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

    const existingPayment = await db.payment.findUnique({ where: { id } });
    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (existingPayment.status === 'APPROVED' && status === 'APPROVED') {
      return NextResponse.json({ success: true, message: 'Already approved' });
    }

    // If approving, use a transaction to update status AND credit the ledger
    if (status === 'APPROVED') {
      await db.$transaction(async (tx) => {
        // 1. Update Payment status
        await tx.payment.update({
          where: { id },
          data: { status }
        });

        // 2. Ensure LedgerAccount exists for user
        let ledger = await tx.ledgerAccount.findUnique({
          where: { userId: existingPayment.userId }
        });

        if (!ledger) {
          ledger = await tx.ledgerAccount.create({
            data: {
              userId: existingPayment.userId,
              balance: 0,
              currency: existingPayment.currency
            }
          });
        }

        // 3. Create LedgerTransaction
        await tx.ledgerTransaction.create({
          data: {
            accountId: ledger.id,
            amount: existingPayment.amount, // Credit
            referenceType: 'PAYMENT_DEPOSIT',
            referenceId: existingPayment.id,
            description: `Deposit via ${existingPayment.provider} (${existingPayment.transactionId})`
          }
        });

        // 4. Update Ledger Balance
        await tx.ledgerAccount.update({
          where: { id: ledger.id },
          data: { balance: { increment: existingPayment.amount } }
        });
      });

      return NextResponse.json({ success: true, message: 'Payment approved and wallet credited.' });
    }

    // Otherwise, just update status (e.g. REJECTED)
    const payment = await db.payment.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, payment });

  } catch (error: any) {
    console.error('[ADMIN_PAYMENT_UPDATE_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
