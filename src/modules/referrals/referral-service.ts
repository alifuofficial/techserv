import { db } from '@/lib/db';
import * as crypto from 'crypto';

export class ReferralService {
  /**
   * Generate a unique referral code for a user if they don't have one.
   */
  static async getOrCreateReferralCode(userId: string) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    if (user.referralCode) return user.referralCode;

    // Generate a short unique string
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();

    const updated = await db.user.update({
      where: { id: userId },
      data: { referralCode: code },
    });

    return updated.referralCode;
  }

  /**
   * Link a new user to the person who referred them.
   * This should be called immediately upon user registration if a ref code is present.
   */
  static async processReferral(newUserId: string, referralCode: string) {
    const referrer = await db.user.findUnique({
      where: { referralCode },
    });

    if (!referrer) return null; // Invalid code, ignore gracefully
    if (referrer.id === newUserId) return null; // Can't refer yourself

    await db.user.update({
      where: { id: newUserId },
      data: { referredById: referrer.id },
    });

    return referrer.id;
  }

  /**
   * Calculate referral metrics for a user (e.g. for the Dashboard)
   */
  static async getReferralStats(userId: string) {
    const count = await db.user.count({
      where: { referredById: userId },
    });

    return { totalReferred: count };
  }
}
