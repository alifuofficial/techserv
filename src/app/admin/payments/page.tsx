import { db } from "@/lib/db";
import PaymentsClient from "./payments-client";

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  // Fetch all payments ordered by newest first
  const payments = await db.payment.findMany({
    include: {
      user: true, // Need user details
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return <PaymentsClient initialPayments={payments} />;
}
