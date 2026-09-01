import { DailySpinService } from "@/lib/daily-spin-service";
import SpinAdminClient from "./spin-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminSpinPage() {
  const data = await DailySpinService.getAdminStatsAndHistory();

  return (
    <SpinAdminClient
      initialSettings={data.settings}
      stats={data.stats}
      initialHistory={data.history}
    />
  );
}
