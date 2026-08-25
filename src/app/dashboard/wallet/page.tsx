import { db } from "@/lib/db";
import UserWalletClient from "./wallet-client";

import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function WalletPage() {
  // Fetch demo user for MVP (replace with real auth session later)
  let user = await db.user.findUnique({
    where: { email: 'user@milkytech.online' }
  });

  if (!user) {
    user = await db.user.findFirst({ where: { role: 'USER' }});
  }

  if (!user) {
    return <div>No user found</div>;
  }

  // Get Ledger Account
  const ledger = await db.ledgerAccount.findUnique({
    where: { userId: user.id }
  });

  const balance = ledger ? ledger.balance : 0;

  // Get all Payments (Deposits) for this user to show in history
  // In a real app we'd combine LedgerTransactions and Payments, 
  // but for MVP we can just show Payments since they represent deposits.
  const payments = await db.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  // Map them to the UI format
  const mappedTransactions = payments.map(p => ({
    id: p.transactionId,
    type: "DEPOSIT",
    title: `${p.provider} Deposit`,
    date: format(new Date(p.createdAt), 'MMM d, yyyy, HH:mm'),
    amount: `+${p.amount.toLocaleString()}.00 ETB`,
    status: p.status, // PENDING, APPROVED, REJECTED
  }));

  return (
    <UserWalletClient 
      initialBalance={balance} 
      initialTransactions={mappedTransactions} 
    />
  );
}
