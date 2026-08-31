import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTelegramUserFromRequest } from '@/lib/telegram-auth';
import { isTransactionIdDuplicate, verifyPaymentWithVerifyEt } from '@/lib/verify-et';
import { sendEventNotification } from '@/lib/telegram-notifications';
import { checkAndUnlockReferralBonus } from '@/lib/referral-service';

export const dynamic = "force-dynamic";

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

    // 1. Strict Global Unique Transaction ID Enforcement
    const isDuplicate = await isTransactionIdDuplicate(cleanTxId);
    if (isDuplicate) {
      return NextResponse.json({
        error: `Transaction ID "${cleanTxId}" has already been submitted on the platform. Each payment slip can only be used once.`,
      }, { status: 400 });
    }

    // 2. Automated Slip / OCR Verification via Verify.et (if configured)
    const verifyResult = await verifyPaymentWithVerifyEt({
      transactionId: cleanTxId,
      amount: depositAmount,
      provider,
      screenshotUrl: screenshot,
      senderName,
    });

    if (verifyResult.isFraud) {
      return NextResponse.json({
        error: verifyResult.message || 'Transaction details could not be validated. Please check your TxID and amount.',
      }, { status: 400 });
    }

    // 3. If automated verification succeeded, auto-approve & settle instantly
    if (verifyResult.isVerified) {
      const autoApprovedResult = await db.$transaction(async (tx) => {
        // Save Payment as APPROVED
        const payment = await tx.payment.create({
          data: {
            userId: user.id,
            amount: depositAmount,
            currency: 'ETB',
            provider,
            transactionId: cleanTxId,
            screenshotUrl: screenshot,
            status: 'APPROVED',
            adminNote: `Auto-verified via Verify.et | Sender: ${senderName || 'N/A'}`,
          },
        });

        // Ensure Ledger exists
        let ledger = await tx.ledgerAccount.findUnique({
          where: { userId: user.id },
        });

        if (!ledger) {
          ledger = await tx.ledgerAccount.create({
            data: {
              userId: user.id,
              balance: 0,
              currency: 'ETB',
            },
          });
        }

        // Credit Ledger
        const updatedLedger = await tx.ledgerAccount.update({
          where: { id: ledger.id },
          data: { balance: { increment: depositAmount } },
        });

        // Record Transaction
        await tx.ledgerTransaction.create({
          data: {
            accountId: ledger.id,
            amount: depositAmount,
            currency: 'ETB',
            referenceType: 'PAYMENT_DEPOSIT',
            referenceId: payment.id,
            description: `Auto-verified deposit via ${provider} (${cleanTxId})`,
          },
        });

        return { payment, newBalance: updatedLedger.balance };
      });

      // Dispatch Telegram Notification
      sendEventNotification('DEPOSIT_APPROVED', user.id, {
        user_name: user.name || 'Customer',
        amount: depositAmount,
        currency: 'ETB',
        new_balance: autoApprovedResult.newBalance,
        provider,
        tx_id: cleanTxId,
      }).catch(console.error);

      // Trigger Referral Unlock
      checkAndUnlockReferralBonus(user.id, 'DEPOSIT', depositAmount).catch(console.error);

      return NextResponse.json({
        success: true,
        autoApproved: true,
        message: 'Deposit verified automatically and credited to your wallet balance!',
        payment: autoApprovedResult.payment,
        newBalance: autoApprovedResult.newBalance,
      });
    }

    // 4. Default: Save as PENDING for manual admin verification
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

    return NextResponse.json({
      success: true,
      pending: true,
      message: 'Deposit receipt submitted for review! Your balance will be updated once approved by admin.',
      payment,
    });
  } catch (error: any) {
    console.error('[WALLET_DEPOSIT_API_ERROR]', error);
    return NextResponse.json({ error: 'Failed to process deposit. Please try again.' }, { status: 500 });
  }
}
