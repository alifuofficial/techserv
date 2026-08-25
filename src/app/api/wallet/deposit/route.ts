import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, provider, txId, senderName, date, screenshot } = body;

    if (!amount || !provider || !txId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Since we don't have NextAuth session perfectly set up in this demo handler, 
    // we will attach the deposit to the demo "User" we created.
    let user = await db.user.findUnique({
      where: { email: 'user@milkytech.online' }
    });

    if (!user) {
        // Fallback if demo user isn't found
        user = await db.user.findFirst({ where: { role: 'USER' }});
    }
    
    if (!user) {
        return NextResponse.json({ error: 'No user found to attach payment to' }, { status: 400 });
    }

    // To prevent duplicate transaction IDs for the same provider
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

    // Save payment
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        amount: Number(amount), // Storing direct amount for MVP simplicity
        currency: 'ETB',
        provider,
        transactionId: txId,
        screenshotUrl: screenshot, // storing base64 or null
        status: 'PENDING',
        adminNote: `Sender: ${senderName} | Date: ${date}` // Store sender name in adminNote
      }
    });
    
    return NextResponse.json({ success: true, payment });

  } catch (error: any) {
    console.error('[WALLET_DEPOSIT_API_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
