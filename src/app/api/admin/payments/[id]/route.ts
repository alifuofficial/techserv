import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEventNotification } from '@/lib/telegram-notifications';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, reason } = body;

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const existingPayment = await db.payment.findUnique({
      where: { id },
      include: {
        entries: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (existingPayment.status === 'APPROVED' && status === 'APPROVED') {
      return NextResponse.json({ success: true, message: 'Already approved' });
    }

    const userName = existingPayment.user?.name || "Customer";

    // If approving
    if (status === 'APPROVED') {
      let createdTicketNumbers: string[] = [];
      let campaignTitle = "MilkyTech Campaign";
      let isTicketCheckout = false;
      let newBalance = 0;

      await db.$transaction(async (tx) => {
        // 1. Update Payment status
        await tx.payment.update({
          where: { id },
          data: { status: 'APPROVED' },
        });

        // 2. Check if payment is for a Campaign Ticket Checkout
        let campaignId: string | null = null;
        let ticketQuantity = 0;

        const note = existingPayment.adminNote || '';

        if (note.includes('CAMPAIGN_CHECKOUT:')) {
          const match = note.match(/CAMPAIGN_CHECKOUT:([^:|]+):(\d+)/);
          if (match) {
            campaignId = match[1];
            ticketQuantity = parseInt(match[2], 10) || 1;
          }
        }

        // Fallback: If not formatted, check if existing entries exist or match by amount/title
        if (!campaignId && note.toLowerCase().includes('ticket')) {
          const qtyMatch = note.match(/(\d+)\s*ticket/i);
          if (qtyMatch) {
            ticketQuantity = parseInt(qtyMatch[1], 10) || 1;
          }
          const activeCampaign = await tx.campaign.findFirst({
            where: { status: { notIn: ['DRAFT', 'CANCELLED'] } },
            orderBy: { createdAt: 'desc' },
          });
          if (activeCampaign) {
            campaignId = activeCampaign.id;
          }
        }

        // If it's a campaign checkout and no entries have been created yet, generate the tickets
        if (campaignId && ticketQuantity > 0 && existingPayment.entries.length === 0) {
          isTicketCheckout = true;
          const targetCampaign = await tx.campaign.findUnique({
            where: { id: campaignId },
          });

          if (targetCampaign) {
            campaignTitle = targetCampaign.title;
            const prefix = targetCampaign.id.substring(0, 4).toUpperCase();
            const lastEntry = await tx.entry.findFirst({
              where: { campaignId: targetCampaign.id },
              orderBy: { entryNumber: 'desc' },
              select: { entryNumber: true },
            });

            let nextNumber = (lastEntry?.entryNumber || 0) + 1;

            for (let i = 0; i < ticketQuantity; i++) {
              const currentNum = nextNumber++;
              await tx.entry.create({
                data: {
                  campaignId: targetCampaign.id,
                  userId: existingPayment.userId,
                  paymentId: existingPayment.id,
                  entryNumber: currentNum,
                },
              });
              createdTicketNumbers.push(`TKT-${prefix}-${currentNum}`);
            }
          }
        } else if (!campaignId) {
          // If it is a wallet deposit, credit the user's ledger account
          let ledger = await tx.ledgerAccount.findUnique({
            where: { userId: existingPayment.userId },
          });

          if (!ledger) {
            ledger = await tx.ledgerAccount.create({
              data: {
                userId: existingPayment.userId,
                balance: 0,
                currency: existingPayment.currency,
              },
            });
          }

          // Create LedgerTransaction
          await tx.ledgerTransaction.create({
            data: {
              accountId: ledger.id,
              amount: existingPayment.amount, // Credit
              referenceType: 'PAYMENT_DEPOSIT',
              referenceId: existingPayment.id,
              description: `Deposit via ${existingPayment.provider} (${existingPayment.transactionId})`,
            },
          });

          // Update Ledger Balance
          const updatedLedger = await tx.ledgerAccount.update({
            where: { id: ledger.id },
            data: { balance: { increment: existingPayment.amount } },
          });

          newBalance = updatedLedger.balance;
        }
      });

      // Dispatch automated Telegram notification asynchronously
      if (isTicketCheckout && createdTicketNumbers.length > 0) {
        sendEventNotification("TICKET_PURCHASE", existingPayment.userId, {
          user_name: userName,
          campaign_title: campaignTitle,
          ticket_numbers: createdTicketNumbers.join(", "),
          quantity: createdTicketNumbers.length,
          total_price: existingPayment.amount,
          currency: existingPayment.currency,
        }).catch((err) => console.error("[Notify Ticket Purchase Error]", err));
      } else if (!isTicketCheckout) {
        sendEventNotification("DEPOSIT_APPROVED", existingPayment.userId, {
          user_name: userName,
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          new_balance: newBalance,
          provider: existingPayment.provider,
          tx_id: existingPayment.transactionId || "Direct",
        }).catch((err) => console.error("[Notify Deposit Approved Error]", err));
      }

      return NextResponse.json({ success: true, message: 'Payment approved successfully.' });
    }

    // Otherwise, update status to REJECTED
    const payment = await db.payment.update({
      where: { id },
      data: {
        status,
        adminNote: reason ? `${existingPayment.adminNote || ''} | Rejected reason: ${reason}` : existingPayment.adminNote,
      },
    });

    if (status === 'REJECTED') {
      sendEventNotification("DEPOSIT_REJECTED", existingPayment.userId, {
        user_name: userName,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        reason: reason || "Transaction could not be verified.",
        provider: existingPayment.provider,
      }).catch((err) => console.error("[Notify Deposit Rejected Error]", err));
    }

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    console.error('[ADMIN_PAYMENT_UPDATE_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
