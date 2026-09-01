import { WithdrawalService } from "@/lib/withdrawal-service";
import WithdrawalsClient, { WithdrawalRecord } from "./withdrawals-client";

export const dynamic = "force-dynamic";

export default async function AdminWithdrawalsPage() {
  let withdrawals: WithdrawalRecord[] = [];
  let stats = {
    totalPendingCount: 0,
    totalPendingAmount: 0,
    totalApprovedCount: 0,
    totalApprovedAmount: 0,
    totalRejectedCount: 0,
    totalCount: 0,
  };

  try {
    const [wList, sData] = await Promise.all([
      WithdrawalService.listWithdrawals("ALL"),
      WithdrawalService.getStats(),
    ]);
    withdrawals = wList || [];
    if (sData) {
      stats = sData;
    }
  } catch (err) {
    console.error("[AdminWithdrawalsPage server error]", err);
  }

  return (
    <WithdrawalsClient
      initialWithdrawals={withdrawals}
      initialStats={stats}
    />
  );
}
