import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";
import { sendEventNotification } from "@/lib/telegram-notifications";
import { isTransactionIdDuplicate, verifyPaymentWithVerifyEt } from "@/lib/verify-et";
import { checkAndUnlockReferralBonus } from "@/lib/referral-service";
import { InstantDrawService } from "@/lib/instant-draw-service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getTelegramUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please reopen the mini app." }, { status: 401 });
    }

    const body = await req.json();
    const { campaignId, quantity = 1, provider = "WALLET", txId, screenshot, senderName } = body;

    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    if (!campaignId) {
      return NextResponse.json({ success: false, error: "Campaign ID is required." }, { status: 400 });
    }

    // =========================================================================
    // 1. WALLET CHECKOUT WITH STRICT SERIALIZABLE TRANSACTION & CONCURRENCY
    // =========================================================================
    if (provider === "WALLET") {
      try {
        const purchaseResult = await db.$transaction(async (tx) => {
          // A. Fetch campaign inside transaction
          const campaign = await tx.campaign.findUnique({
            where: { id: campaignId },
          });

          if (!campaign || campaign.status === "DRAFT" || campaign.status === "CANCELLED" || campaign.status === "COMPLETED") {
            throw new Error("CAMPAIGN_INACTIVE");
          }

          // B. Concurrency check: count live tickets
          const currentCount = await tx.entry.count({
            where: { campaignId: campaign.id },
          });

          const remaining = campaign.maxEntries - currentCount;
          if (qty > remaining) {
            throw new Error(`OVERFLOW:${remaining}`);
          }

          const totalAmount = campaign.entryPrice * qty;

          // C. Fetch user wallet inside transaction
          const ledger = await tx.ledgerAccount.findUnique({
            where: { userId: user.id },
          });

          if (!ledger || ledger.balance < totalAmount) {
            throw new Error(`INSUFFICIENT_FUNDS:${ledger?.balance || 0}:${totalAmount}`);
          }

          // D. Debit Wallet atomically
          const updatedLedger = await tx.ledgerAccount.update({
            where: { id: ledger.id },
            data: { balance: { decrement: totalAmount } },
          });

          // E. Record Ledger Audit Transaction
          await tx.ledgerTransaction.create({
            data: {
              accountId: ledger.id,
              amount: -totalAmount,
              currency: campaign.currency,
              referenceType: "ENTRY_PURCHASE",
              referenceId: campaign.id,
              description: `Purchased ${qty} ticket(s) for ${campaign.title} via Telegram Mini App`,
            },
          });

          // F. Record Payment
          const payment = await tx.payment.create({
            data: {
              userId: user.id,
              amount: totalAmount,
              currency: campaign.currency,
              provider: "WALLET",
              transactionId: `TG-WALLET-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
              status: "APPROVED",
            },
          });

          // G. Sequential Unique Entry Numbers Generation
          const lastEntry = await tx.entry.findFirst({
            where: { campaignId: campaign.id },
            orderBy: { entryNumber: "desc" },
            select: { entryNumber: true },
          });

          let nextNumber = (lastEntry?.entryNumber || 0) + 1;
          const createdTickets: string[] = [];
          const prefix = campaign.id.substring(0, 4).toUpperCase();

          for (let i = 0; i < qty; i++) {
            const entryNum = nextNumber++;
            await tx.entry.create({
              data: {
                campaignId: campaign.id,
                userId: user.id,
                paymentId: payment.id,
                entryNumber: entryNum,
              },
            });
            createdTickets.push(`TKT-${prefix}-${entryNum}`);
          }

          // H. If campaign reached max entries, auto-transition to DRAWING
          if (currentCount + qty >= campaign.maxEntries) {
            await tx.campaign.update({
              where: { id: campaign.id },
              data: { status: "DRAWING" },
            });
          }

          return {
            campaign,
            payment,
            tickets: createdTickets,
            totalAmount,
            newBalance: updatedLedger.balance,
          };
        });

        // Dispatch Telegram Notification
        sendEventNotification("TICKET_PURCHASE", user.id, {
          user_name: user.name || "Customer",
          campaign_title: purchaseResult.campaign.title,
          ticket_numbers: purchaseResult.tickets.join(", "),
          quantity: qty,
          total_price: purchaseResult.totalAmount,
          currency: purchaseResult.campaign.currency,
          balance_remaining: purchaseResult.newBalance,
        }).catch(console.error);

        // Check & Unlock Referral Bonus on First Ticket Purchase
        checkAndUnlockReferralBonus(user.id, "PURCHASE", purchaseResult.totalAmount).catch(console.error);

        // Trigger Instant Auto-Draw execution if full
        InstantDrawService.checkAndExecuteAutoDraw(campaignId).catch(console.error);

        return NextResponse.json(
          {
            success: true,
            message: "Purchase successful! Your entry tickets are registered.",
            tickets: purchaseResult.tickets,
            totalAmount: purchaseResult.totalAmount,
            currency: purchaseResult.campaign.currency,
            newBalance: purchaseResult.newBalance,
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            },
          }
        );
      } catch (err: any) {
        if (err.message?.startsWith("OVERFLOW:")) {
          const rem = err.message.split(":")[1];
          return NextResponse.json({
            success: false,
            error: `Only ${rem} ticket(s) remaining for this campaign.`,
          }, { status: 400 });
        }
        if (err.message?.startsWith("INSUFFICIENT_FUNDS:")) {
          const [, bal, needed] = err.message.split(":");
          return NextResponse.json({
            success: false,
            error: `Insufficient wallet balance. You have ${parseFloat(bal).toFixed(2)} ETB, but need ${parseFloat(needed).toFixed(2)} ETB. Please deposit funds first.`,
          }, { status: 400 });
        }
        if (err.message === "CAMPAIGN_INACTIVE") {
          return NextResponse.json({ success: false, error: "Campaign is no longer active." }, { status: 400 });
        }
        throw err;
      }
    }

    // =========================================================================
    // 2. MANUAL CHECKOUT (Telebirr, CBE, Bank Transfer)
    // =========================================================================
    if (!txId || !txId.trim()) {
      return NextResponse.json({ success: false, error: "Transaction ID is required for manual payment." }, { status: 400 });
    }

    if (!screenshot) {
      return NextResponse.json({ success: false, error: "Payment screenshot receipt is required for manual payment." }, { status: 400 });
    }

    const cleanTxId = txId.trim();

    // 1. Strict Global Unique Transaction ID Check
    const isDuplicate = await isTransactionIdDuplicate(cleanTxId);
    if (isDuplicate) {
      return NextResponse.json({
        success: false,
        error: `Transaction ID "${cleanTxId}" has already been submitted on the platform. Each receipt can only be used once.`,
      }, { status: 400 });
    }

    // Fetch Campaign to calculate exact price
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { _count: { select: { entries: true } } },
    });

    if (!campaign || campaign.status !== "ACTIVE") {
      return NextResponse.json({ success: false, error: "Campaign is not active." }, { status: 400 });
    }

    const remaining = campaign.maxEntries - campaign._count.entries;
    if (qty > remaining) {
      return NextResponse.json({
        success: false,
        error: `Only ${remaining} ticket(s) remaining for this campaign.`,
      }, { status: 400 });
    }

    const totalAmount = campaign.entryPrice * qty;

    // 2. Automated OCR / Verification via Verify.et
    const verifyResult = await verifyPaymentWithVerifyEt({
      transactionId: cleanTxId,
      amount: totalAmount,
      provider,
      screenshotUrl: screenshot,
      senderName,
    });

    if (verifyResult.isFraud) {
      return NextResponse.json({
        success: false,
        error: verifyResult.message || "Transaction details could not be validated. Please check your TxID.",
      }, { status: 400 });
    }

    // 3. If automated verification succeeded, generate tickets immediately!
    if (verifyResult.isVerified) {
      const autoApprovedPurchase = await db.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            userId: user.id,
            amount: totalAmount,
            currency: campaign.currency,
            provider,
            transactionId: cleanTxId,
            screenshotUrl: screenshot,
            status: "APPROVED",
            adminNote: `Auto-verified via Verify.et | CAMPAIGN_CHECKOUT:${campaign.id}:${qty}`,
          },
        });

        const lastEntry = await tx.entry.findFirst({
          where: { campaignId: campaign.id },
          orderBy: { entryNumber: "desc" },
          select: { entryNumber: true },
        });

        let nextNumber = (lastEntry?.entryNumber || 0) + 1;
        const createdTickets: string[] = [];
        const prefix = campaign.id.substring(0, 4).toUpperCase();

        for (let i = 0; i < qty; i++) {
          const entryNum = nextNumber++;
          await tx.entry.create({
            data: {
              campaignId: campaign.id,
              userId: user.id,
              paymentId: payment.id,
              entryNumber: entryNum,
            },
          });
          createdTickets.push(`TKT-${prefix}-${entryNum}`);
        }

        return { payment, tickets: createdTickets };
      });

      sendEventNotification("TICKET_PURCHASE", user.id, {
        user_name: user.name || "Customer",
        campaign_title: campaign.title,
        ticket_numbers: autoApprovedPurchase.tickets.join(", "),
        quantity: qty,
        total_price: totalAmount,
        currency: campaign.currency,
      }).catch(console.error);

      checkAndUnlockReferralBonus(user.id, "PURCHASE", totalAmount).catch(console.error);

      return NextResponse.json({
        success: true,
        autoApproved: true,
        message: "Payment verified automatically via Verify.et! Your tickets have been issued.",
        tickets: autoApprovedPurchase.tickets,
        totalAmount,
        currency: campaign.currency,
      });
    }

    // 4. Default: Save as PENDING for admin manual verification
    const manualPayment = await db.payment.create({
      data: {
        userId: user.id,
        amount: totalAmount,
        currency: campaign.currency,
        provider,
        transactionId: cleanTxId,
        screenshotUrl: screenshot,
        status: "PENDING",
        adminNote: `CAMPAIGN_CHECKOUT:${campaign.id}:${qty}|Sender:${senderName || 'N/A'}|Title:${campaign.title}`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        pending: true,
        message: "Payment submitted with screenshot for review! Your tickets will be generated once verified by admin.",
        paymentId: manualPayment.id,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("[POST /api/telegram/checkout error]", error);
    return NextResponse.json({ success: false, error: error.message || "Checkout failed" }, { status: 500 });
  }
}
