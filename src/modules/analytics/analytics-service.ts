import { db } from '@/lib/db';

export class AnalyticsService {
  /**
   * Tracks user acquisition sources.
   * Called during registration or first visit.
   * In a full implementation, this could write to a dedicated 'events' or 'analytics' table.
   */
  static async trackAcquisition(userId: string, channel: 'WEB' | 'TELEGRAM' | 'REFERRAL') {
    // Standard implementation: Log to an external service like Mixpanel/PostHog
    // Or save locally to a tracking table if built. 
    console.log(`[Analytics] New user acquisition - User: ${userId}, Channel: ${channel}`);
  }

  /**
   * Generate basic admin dashboard metrics.
   */
  static async getDashboardMetrics() {
    const [totalUsers, activeCampaigns, totalRevenue] = await Promise.all([
      db.user.count(),
      db.campaign.count({ where: { status: 'ACTIVE' } }),
      // Calculate total platform revenue from approved payments
      db.payment.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalUsers,
      activeCampaigns,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }
}
