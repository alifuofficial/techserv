import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";

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

    // 1. Fetch Campaign
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: {
        _count: {
          select: { entries: true },
        },
      },
    });

    if (!campaign || campaign.status === "DRAFT" || campaign.status === "CANCELLED") {
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

    // 2. Handle Wallet Payment
    if (provider === "WALLET") {
      const ledger = await db.ledgerAccount.findUnique({
        where: { userId: user.id },
      });

      if (!ledger || ledger.balance < totalAmount) {
        return NextResponse.json({
          success: false,
          error: `Insufficient wallet balance. You have ${(ledger?.balance || 0).toFixed(2)} ETB, but need ${totalAmount.toFixed(2)} ETB. Please deposit funds first.`,
        }, { status: 400 });
      }

      const purchaseResult = await db.$transaction(async (tx) => {
        // Debit Ledger
        await tx.ledgerAccount.update({
          where: { id: ledger.id },
          data: { balance: { decrement: totalAmount } },
        });

        // Record Transaction
        await tx.ledgerTransaction.create({
          data: {
            accountId: ledger.id,
            amount: -totalAmount,
            referenceType: "ENTRY_PURCHASE",
            referenceId: campaign.id,
            description: `Purchased ${qty} ticket(s) for ${campaign.title} via Telegram`,
          },
        });

        // Record Payment
        const payment = await tx.payment.create({
          data: {
            userId: user.id,
            amount: totalAmount,
            currency: campaign.currency,
            provider: "WALLET",
            transactionId: `TG-WALLET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            status: "APPROVED",
          },
        });

        // Get current max entry number
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

      return NextResponse.json({
        success: true,
        message: "Purchase successful! Your entry tickets are ready.",
        tickets: purchaseResult.tickets,
        totalAmount,
        currency: campaign.currency,
      });
    }

    // 3. Handle Manual Payment (Telebirr, CBE)
    if (!txId || !txId.trim()) {
      return NextResponse.json({ success: false, error: "Transaction ID is required for manual payment." }, { status: 400 });
    }

    if (!screenshot) {
      return NextResponse.json({ success: false, error: "Payment screenshot receipt is required for manual payment." }, { status: 400 });
    }

    const cleanTxId = txId.trim();

    const existingPayment = await db.payment.findUnique({
      where: {
        provider_transactionId: {
          provider,
          transactionId: cleanTxId,
        },
      },
    });

    if (existingPayment) {
      return NextResponse.json({ success: false, error: "This Transaction ID has already been submitted." }, { status: 400 });
    }

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

    return NextResponse.json({
      success: true,
      pending: true,
      message: "Payment submitted with screenshot for review! Your tickets will be generated once verified by admin.",
      paymentId: manualPayment.id,
    });
  } catch (error: any) {
    console.error("[POST /api/telegram/checkout error]", error);
    return NextResponse.json({ success: false, error: error.message || "Checkout failed" }, { status: 500 });
  }
}
