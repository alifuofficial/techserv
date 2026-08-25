import { NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { db } from '@/lib/db';

/**
 * Validates the Telegram initData string.
 * Uses the algorithm specified in Telegram Mini App documentation.
 */
function validateTelegramWebAppData(telegramInitData: string): { isValid: boolean; user?: any } {
  const initData = new URLSearchParams(telegramInitData);
  const hash = initData.get('hash');
  
  if (!hash) {
    return { isValid: false };
  }

  initData.delete('hash');
  
  // Sort the keys alphabetically
  const keys = Array.from(initData.keys()).sort();
  const dataCheckString = keys.map((key) => `${key}=${initData.get(key)}`).join('\n');

  // Create the secret key
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

  // Calculate hash
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (calculatedHash === hash) {
    const userStr = initData.get('user');
    return {
      isValid: true,
      user: userStr ? JSON.parse(userStr) : null,
    };
  }

  return { isValid: false };
}

export async function POST(req: Request) {
  try {
    const { initData } = await req.json();

    if (!initData) {
      return NextResponse.json({ error: 'Missing initData' }, { status: 400 });
    }

    const { isValid, user: telegramUser } = validateTelegramWebAppData(initData);

    if (!isValid || !telegramUser) {
      return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 401 });
    }

    // 1. Look for existing identity
    const identity = await db.userIdentity.findUnique({
      where: {
        provider_providerId: {
          provider: 'telegram',
          providerId: telegramUser.id.toString(),
        },
      },
      include: { user: true },
    });

    if (identity) {
      // User exists, return success (In a real app, generate a JWT/Session cookie here)
      return NextResponse.json({
        success: true,
        user: identity.user,
        message: 'Authenticated successfully',
      });
    }

    // 2. User does not exist, so we create a new platform user bound to Telegram
    const newUser = await db.$transaction(async (tx) => {
      // In Supabase, you might ideally create the user via Supabase Auth Admin API 
      // so they have a proper auth.users record. For this MVP module logic, 
      // we're inserting directly into the public schema to represent the linking.
      // (Supabase Admin SDK would be called here to generate a UUID).
      const platformUserId = crypto.randomUUID(); 

      const user = await tx.user.create({
        data: {
          id: platformUserId,
          role: 'USER',
        },
      });

      await tx.userIdentity.create({
        data: {
          userId: user.id,
          provider: 'telegram',
          providerId: telegramUser.id.toString(),
        },
      });

      return user;
    });

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'Account created and authenticated via Telegram',
    });
  } catch (error: any) {
    console.error('TMA Auth Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
