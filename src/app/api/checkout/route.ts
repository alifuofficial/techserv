import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, quantity, provider, txId, name, phone, amount, userId } = body;

    if (!campaignId || !quantity || !provider || !txId || !name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Fetch Campaign
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign || campaign.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Campaign is not active or does not exist' }, { status: 400 });
    }

    // 2. Validate amount (security check)
    const expectedAmount = campaign.entryPrice * quantity;
    if (amount !== expectedAmount) {
      return NextResponse.json({ error: 'Amount mismatch detected' }, { status: 400 });
    }

    // 3. Find or Create User
    let user;
    if (userId) {
      user = await db.user.findUnique({ where: { id: userId } });
    }
    if (!user) {
      user = await db.user.findUnique({ where: { phone } });
    }

    if (!user) {
      const fallbackEmail = `${phone}@techserv.local`; 
      const existingEmailUser = await db.user.findUnique({ where: { email: fallbackEmail }});
      if (existingEmailUser) {
          user = existingEmailUser;
      } else {
          user = await db.user.create({
            data: {
              name,
              phone,
              email: fallbackEmail,
              role: 'USER',
            }
          });
      }
    }

    // 4. Handle WALLET Payments Instantly
    if (provider === 'WALLET') {
      const ledger = await db.ledgerAccount.findUnique({
        where: { userId: user.id }
      });
      
      if (!ledger || ledger.balance < expectedAmount) {
        return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
      }

      const result = await db.$transaction(async (tx) => {
        // Debit
        await tx.ledgerAccount.update({
          where: { id: ledger.id },
          data: { balance: { decrement: expectedAmount } }
        });
        
        // Log transaction
        await tx.ledgerTransaction.create({
          data: {
            accountId: ledger.id,
            amount: -expectedAmount,
            referenceType: 'ENTRY_PURCHASE',
            referenceId: campaignId,
            description: `Purchased ${quantity} tickets for ${campaign.title}`
          }
        });

        // Create Payment as APPROVED
        const payment = await tx.payment.create({
          data: {
            userId: user.id,
            amount: expectedAmount,
            currency: campaign.currency,
            provider: 'WALLET',
            transactionId: txId,
            status: 'APPROVED'
          }
        });

        // Get max entry number for this campaign to ensure sequential unique entryNumbers
        const lastEntry = await tx.entry.findFirst({
          where: { campaignId },
          orderBy: { entryNumber: 'desc' },
          select: { entryNumber: true }
        });
        
        let nextEntryNumber = (lastEntry?.entryNumber || 0) + 1;

        // Create Entries
        for (let i = 0; i < quantity; i++) {
          await tx.entry.create({
            data: {
              campaignId,
              userId: user.id,
              paymentId: payment.id,
              entryNumber: nextEntryNumber++
            }
          });
        }
        
        return payment;
      });

      return NextResponse.json({ success: true, paymentId: result.id });
    }

    // 5. Handle Manual Pending Payments (Telebirr, CBE)
    const existingPayment = await db.payment.findUnique({
      where: {
        provider_transactionId: {
          provider,
          transactionId: txId,
        }
      }
    });

    if (existingPayment) {
      return NextResponse.json({ error: 'Transaction ID has already been used' }, { status: 400 });
    }

    const payment = await db.payment.create({
      data: {
        userId: user.id,
        amount: expectedAmount,
        currency: campaign.currency,
        provider,
        transactionId: txId,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, paymentId: payment.id });

  } catch (error: any) {
    console.error('[CHECKOUT_API_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
