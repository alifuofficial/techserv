import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isTransactionIdDuplicate, verifyPaymentWithVerifyEt } from '@/lib/verify-et';
import { checkAndUnlockReferralBonus } from '@/lib/referral-service';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, quantity = 1, provider = "WALLET", txId, name, phone, amount, userId, screenshot } = body;

    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    if (!campaignId || !name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Find or Create User
    let user;
    if (userId) {
      user = await db.user.findUnique({ where: { id: userId } });
    }
    if (!user) {
      user = await db.user.findUnique({ where: { phone } });
    }

    if (!user) {
      const fallbackEmail = `${phone.replace(/\+/g, '')}@milkytech.online`; 
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

    // =========================================================================
    // 2. WALLET CHECKOUT WITH STRICT INTERACTIVE TRANSACTION & ROW LOCKING
    // =========================================================================
    if (provider === 'WALLET') {
      try {
        const purchaseResult = await db.$transaction(async (tx) => {
          const campaign = await tx.campaign.findUnique({
            where: { id: campaignId },
          });

          if (!campaign || campaign.status !== 'ACTIVE') {
            throw new Error('CAMPAIGN_INACTIVE');
          }

          const currentCount = await tx.entry.count({
            where: { campaignId: campaign.id },
          });

          const remaining = campaign.maxEntries - currentCount;
          if (qty > remaining) {
            throw new Error(`OVERFLOW:${remaining}`);
          }

          const expectedAmount = campaign.entryPrice * qty;

          const ledger = await tx.ledgerAccount.findUnique({
            where: { userId: user.id },
          });

          if (!ledger || ledger.balance < expectedAmount) {
            throw new Error(`INSUFFICIENT_FUNDS:${ledger?.balance || 0}:${expectedAmount}`);
          }

          // Debit Wallet
          const updatedLedger = await tx.ledgerAccount.update({
            where: { id: ledger.id },
            data: { balance: { decrement: expectedAmount } },
          });

          // Log transaction
          await tx.ledgerTransaction.create({
            data: {
              accountId: ledger.id,
              amount: -expectedAmount,
              currency: campaign.currency,
              referenceType: 'ENTRY_PURCHASE',
              referenceId: campaignId,
              description: `Purchased ${qty} tickets for ${campaign.title} via Web`,
            },
          });

          // Create Payment as APPROVED
          const payment = await tx.payment.create({
            data: {
              userId: user.id,
              amount: expectedAmount,
              currency: campaign.currency,
              provider: 'WALLET',
              transactionId: txId || `WEB-WALLET-${Date.now()}`,
              status: 'APPROVED',
            },
          });

          // Sequential Unique entryNumbers
          const lastEntry = await tx.entry.findFirst({
            where: { campaignId },
            orderBy: { entryNumber: 'desc' },
            select: { entryNumber: true },
          });

          let nextEntryNumber = (lastEntry?.entryNumber || 0) + 1;
          const createdTickets: string[] = [];
          const prefix = campaign.id.substring(0, 4).toUpperCase();

          for (let i = 0; i < qty; i++) {
            const entryNum = nextEntryNumber++;
            await tx.entry.create({
              data: {
                campaignId,
                userId: user.id,
                paymentId: payment.id,
                entryNumber: entryNum,
              },
            });
            createdTickets.push(`TKT-${prefix}-${entryNum}`);
          }

          if (currentCount + qty >= campaign.maxEntries) {
            await tx.campaign.update({
              where: { id: campaign.id },
              data: { status: 'DRAWING' },
            });
          }

          return { payment, tickets: createdTickets, totalAmount: expectedAmount };
        });

        // Trigger referral unlock on first purchase
        checkAndUnlockReferralBonus(user.id, 'PURCHASE', purchaseResult.totalAmount).catch(console.error);

        return NextResponse.json({
          success: true,
          paymentId: purchaseResult.payment.id,
          tickets: purchaseResult.tickets,
        });
      } catch (err: any) {
        if (err.message?.startsWith('OVERFLOW:')) {
          const rem = err.message.split(':')[1];
          return NextResponse.json({ error: `Only ${rem} ticket(s) remaining for this campaign.` }, { status: 400 });
        }
        if (err.message?.startsWith('INSUFFICIENT_FUNDS:')) {
          return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
        }
        if (err.message === 'CAMPAIGN_INACTIVE') {
          return NextResponse.json({ error: 'Campaign is not active or does not exist' }, { status: 400 });
        }
        throw err;
      }
    }

    // =========================================================================
    // 3. MANUAL PAYMENT (Telebirr, CBE, Bank Transfer)
    // =========================================================================
    if (!txId || !txId.trim()) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const cleanTxId = txId.trim();

    // 1. Strict Global Unique TxID Check
    const isDuplicate = await isTransactionIdDuplicate(cleanTxId);
    if (isDuplicate) {
      return NextResponse.json({
        error: `Transaction ID "${cleanTxId}" has already been used on the platform.`,
      }, { status: 400 });
    }

    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { _count: { select: { entries: true } } },
    });

    if (!campaign || campaign.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Campaign is not active' }, { status: 400 });
    }

    const remaining = campaign.maxEntries - campaign._count.entries;
    if (qty > remaining) {
      return NextResponse.json({ error: `Only ${remaining} ticket(s) remaining` }, { status: 400 });
    }

    const expectedAmount = campaign.entryPrice * qty;

    // 2. Automated OCR / Verify.et Verification
    const verifyResult = await verifyPaymentWithVerifyEt({
      transactionId: cleanTxId,
      amount: expectedAmount,
      provider,
      screenshotUrl: screenshot,
      senderName: name,
    });

    if (verifyResult.isFraud) {
      return NextResponse.json({ error: verifyResult.message || 'Invalid transaction receipt.' }, { status: 400 });
    }

    if (verifyResult.isVerified) {
      const autoApprovedPurchase = await db.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            userId: user.id,
            amount: expectedAmount,
            currency: campaign.currency,
            provider,
            transactionId: cleanTxId,
            screenshotUrl: screenshot || '',
            status: 'APPROVED',
            adminNote: `Auto-verified via Verify.et | WEB_CHECKOUT:${campaign.id}:${qty}`,
          },
        });

        const lastEntry = await tx.entry.findFirst({
          where: { campaignId },
          orderBy: { entryNumber: 'desc' },
          select: { entryNumber: true },
        });

        let nextEntryNumber = (lastEntry?.entryNumber || 0) + 1;
        const createdTickets: string[] = [];
        const prefix = campaign.id.substring(0, 4).toUpperCase();

        for (let i = 0; i < qty; i++) {
          const entryNum = nextEntryNumber++;
          await tx.entry.create({
            data: {
              campaignId,
              userId: user.id,
              paymentId: payment.id,
              entryNumber: entryNum,
            },
          });
          createdTickets.push(`TKT-${prefix}-${entryNum}`);
        }

        return { payment, tickets: createdTickets };
      });

      checkAndUnlockReferralBonus(user.id, 'PURCHASE', expectedAmount).catch(console.error);

      return NextResponse.json({
        success: true,
        autoApproved: true,
        paymentId: autoApprovedPurchase.payment.id,
        tickets: autoApprovedPurchase.tickets,
      });
    }

    // 3. Default: Save as PENDING for admin review
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        amount: expectedAmount,
        currency: campaign.currency,
        provider,
        transactionId: cleanTxId,
        screenshotUrl: screenshot || '',
        status: 'PENDING',
        adminNote: `CAMPAIGN_CHECKOUT:${campaign.id}:${qty}|Sender:${name} (${phone})|Title:${campaign.title}`,
      },
    });

    return NextResponse.json({ success: true, pending: true, paymentId: payment.id });
  } catch (error: any) {
    console.error('[CHECKOUT_API_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
