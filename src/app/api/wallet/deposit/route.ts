import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTelegramUserFromRequest } from '@/lib/telegram-auth';

export async function POST(req: Request) {
  try {
    const user = await getTelegramUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please open via Telegram.' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, provider = 'TELEBIRR', txId, senderName, screenshot } = body;

    const depositAmount = Number(amount);
    if (!depositAmount || depositAmount < 50) {
      return NextResponse.json({ error: 'Minimum deposit amount is 50 ETB' }, { status: 400 });
    }

    if (!txId || !txId.trim()) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    if (!screenshot) {
      return NextResponse.json({ error: 'Payment receipt screenshot is required' }, { status: 400 });
    }

    const cleanTxId = txId.trim();

    // To prevent duplicate transaction IDs for the same provider
    const existingPayment = await db.payment.findUnique({
      where: {
        provider_transactionId: {
          provider,
          transactionId: cleanTxId,
        },
      },
    });

    if (existingPayment) {
      return NextResponse.json({ error: 'This Transaction ID has already been submitted' }, { status: 400 });
    }

    // Save payment
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        amount: depositAmount,
        currency: 'ETB',
        provider,
        transactionId: cleanTxId,
        screenshotUrl: screenshot,
        status: 'PENDING',
        adminNote: `Deposit via Telegram | Sender: ${senderName || 'N/A'} | User: ${user.name || user.email}`,
      },
    });

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    console.error('[WALLET_DEPOSIT_API_ERROR]', error);
    return NextResponse.json({ error: 'Failed to process deposit. Please try again.' }, { status: 500 });
  }
}
