import { WithdrawalService } from "@/lib/withdrawal-service";
import WithdrawalsClient from "./withdrawals-client";

export const dynamic = "force-dynamic";

export default async function AdminWithdrawalsPage() {
  const [withdrawals, stats] = await Promise.all([
    WithdrawalService.listWithdrawals("ALL"),
    WithdrawalService.getStats(),
  ]);

  return (
    <WithdrawalsClient
      initialWithdrawals={withdrawals}
      initialStats={stats}
    />
  );
}
