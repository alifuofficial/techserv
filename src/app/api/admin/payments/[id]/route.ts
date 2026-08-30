import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const existingPayment = await db.payment.findUnique({
      where: { id },
      include: { entries: true },
    });

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (existingPayment.status === 'APPROVED' && status === 'APPROVED') {
      return NextResponse.json({ success: true, message: 'Already approved' });
    }

    // If approving
    if (status === 'APPROVED') {
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
          // Try to find active campaign
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
          const targetCampaign = await tx.campaign.findUnique({
            where: { id: campaignId },
          });

          if (targetCampaign) {
            const lastEntry = await tx.entry.findFirst({
              where: { campaignId: targetCampaign.id },
              orderBy: { entryNumber: 'desc' },
              select: { entryNumber: true },
            });

            let nextNumber = (lastEntry?.entryNumber || 0) + 1;

            for (let i = 0; i < ticketQuantity; i++) {
              await tx.entry.create({
                data: {
                  campaignId: targetCampaign.id,
                  userId: existingPayment.userId,
                  paymentId: existingPayment.id,
                  entryNumber: nextNumber++,
                },
              });
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
          await tx.ledgerAccount.update({
            where: { id: ledger.id },
            data: { balance: { increment: existingPayment.amount } },
          });
        }
      });

      return NextResponse.json({ success: true, message: 'Payment approved successfully.' });
    }

    // Otherwise, just update status (e.g. REJECTED)
    const payment = await db.payment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    console.error('[ADMIN_PAYMENT_UPDATE_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
