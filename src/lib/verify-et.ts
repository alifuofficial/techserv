import { db } from "@/lib/db";
import { getSystemSetting } from "@/modules/settings/settings-service";

export interface VerifyEtResult {
  isVerified: boolean;
  isFraud?: boolean;
  pendingManual: boolean;
  message: string;
  data?: any;
}

/**
 * Normalizes a transaction ID for uniform comparison (case-insensitive, trimmed, internal spaces collapsed)
 */
export function normalizeTxId(rawTxId: string): string {
  if (!rawTxId) return "";
  return rawTxId
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "")
    .toUpperCase();
}

/**
 * Validates that a transaction ID has not been used anywhere on the platform
 * (Checks both active APPROVED and PENDING deposits to prevent replay attacks)
 */
export async function isTransactionIdDuplicate(
  txId: string,
  excludePaymentId?: string,
  txClient: any = db
): Promise<{ isDuplicate: boolean; existingPayment?: any; reason?: string }> {
  const cleanTxId = txId.trim();
  if (!cleanTxId) return { isDuplicate: false };

  const normalized = normalizeTxId(cleanTxId);

  // Exclude internal wallet transaction IDs or withdrawal transaction references
  if (
    cleanTxId.startsWith("TG-WALLET-") ||
    cleanTxId.startsWith("WEB-WALLET-") ||
    cleanTxId.startsWith("WITHDRAW_")
  ) {
    return { isDuplicate: false };
  }

  // 1. Check exact match (case-insensitive)
  const exactMatch = await txClient.payment.findFirst({
    where: {
      transactionId: {
        equals: cleanTxId,
        mode: "insensitive",
      },
      status: { in: ["APPROVED", "PENDING"] },
      provider: { not: "WALLET" },
      ...(excludePaymentId ? { id: { not: excludePaymentId } } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (exactMatch) {
    const isApproved = exactMatch.status === "APPROVED";
    return {
      isDuplicate: true,
      existingPayment: exactMatch,
      reason: isApproved
        ? `Transaction ID "${cleanTxId}" has already been approved and credited on ${new Date(exactMatch.createdAt).toLocaleDateString()}. Duplicate submissions are rejected.`
        : `Transaction ID "${cleanTxId}" is already currently pending review in payment #${exactMatch.id.slice(0, 8)}. Please wait for admin approval.`,
    };
  }

  // 2. Check normalized match (e.g. spaces/dots variations)
  if (normalized.length >= 6) {
    const candidates = await txClient.payment.findMany({
      where: {
        status: { in: ["APPROVED", "PENDING"] },
        provider: { not: "WALLET" },
        ...(excludePaymentId ? { id: { not: excludePaymentId } } : {}),
      },
      select: {
        id: true,
        transactionId: true,
        status: true,
        createdAt: true,
      },
      take: 200,
      orderBy: { createdAt: "desc" },
    });

    const candidateMatch = candidates.find((c: any) => {
      if (!c.transactionId) return false;
      return normalizeTxId(c.transactionId) === normalized;
    });

    if (candidateMatch) {
      const isApproved = candidateMatch.status === "APPROVED";
      return {
        isDuplicate: true,
        existingPayment: candidateMatch,
        reason: isApproved
          ? `Transaction ID "${cleanTxId}" matches an already approved transaction (#${candidateMatch.id.slice(0, 8)}). Duplicate slips are rejected.`
          : `Transaction ID "${cleanTxId}" is already in the review queue (#${candidateMatch.id.slice(0, 8)}).`,
      };
    }
  }

  return { isDuplicate: false };
}

/**
 * Attempts automated OCR / Bank API verification using Verify.et
 */
export async function verifyPaymentWithVerifyEt(params: {
  transactionId: string;
  amount: number;
  provider: string;
  screenshotUrl?: string;
  senderName?: string;
}): Promise<VerifyEtResult> {
  const { transactionId, amount, provider, screenshotUrl, senderName } = params;

  const apiKey = await getSystemSetting(
    "verify_et_api_key",
    process.env.VERIFY_ET_API_KEY || ""
  );

  // If no API key configured, pass to manual admin review
  if (!apiKey || !apiKey.trim()) {
    return {
      isVerified: false,
      pendingManual: true,
      message: "Verify.et API key not set. Queued for manual admin verification.",
    };
  }

  try {
    const response = await fetch("https://api.verify.et/api/v1/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        transaction_id: transactionId.trim(),
        amount: Number(amount),
        provider: provider.toUpperCase(),
        screenshot: screenshotUrl || "",
        sender_name: senderName || "",
      }),
      signal: AbortSignal.timeout(6000), // 6 second timeout
    });

    if (!response.ok) {
      console.warn(
        `[Verify.et] Non-200 response (${response.status}) from verification gateway.`
      );
      return {
        isVerified: false,
        pendingManual: true,
        message: "External verification service unavailable. Queued for admin review.",
      };
    }

    const data = await response.json();

    // If Verify.et successfully verified the slip
    if (
      data.success &&
      (data.verified || data.status === "VERIFIED" || data.status === "SUCCESS")
    ) {
      return {
        isVerified: true,
        pendingManual: false,
        message: data.message || "Payment verified automatically via Verify.et!",
        data: data.data,
      };
    }

    // If Verify.et explicitly flags invalid/tampered slip
    if (data.fraud || data.status === "FAILED" || data.status === "INVALID") {
      return {
        isVerified: false,
        isFraud: true,
        pendingManual: false,
        message:
          data.error ||
          data.message ||
          "Transaction ID could not be found or does not match amount.",
      };
    }

    // Default fallback to manual review
    return {
      isVerified: false,
      pendingManual: true,
      message: "Pending manual admin approval.",
    };
  } catch (error: any) {
    console.warn("[Verify.et Check Error]", error.message || error);
    return {
      isVerified: false,
      pendingManual: true,
      message: "Verification timed out. Queued for manual admin review.",
    };
  }
}
