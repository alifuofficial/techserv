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
 * Validates that a transaction ID has not been used anywhere on the platform
 */
export async function isTransactionIdDuplicate(
  txId: string,
  excludePaymentId?: string
): Promise<boolean> {
  const cleanTxId = txId.trim();
  if (!cleanTxId) return false;

  const existing = await db.payment.findFirst({
    where: {
      transactionId: {
        equals: cleanTxId,
        mode: "insensitive",
      },
      ...(excludePaymentId ? { id: { not: excludePaymentId } } : {}),
    },
  });

  return !!existing;
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

  const apiKey = await getSystemSetting("verify_et_api_key", process.env.VERIFY_ET_API_KEY || "");

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
        "Authorization": `Bearer ${apiKey.trim()}`,
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
      console.warn(`[Verify.et] Non-200 response (${response.status}) from verification gateway.`);
      return {
        isVerified: false,
        pendingManual: true,
        message: "External verification service unavailable. Queued for admin review.",
      };
    }

    const data = await response.json();

    // If Verify.et successfully verified the slip
    if (data.success && (data.verified || data.status === "VERIFIED" || data.status === "SUCCESS")) {
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
        message: data.error || data.message || "Transaction ID could not be found or does not match amount.",
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
