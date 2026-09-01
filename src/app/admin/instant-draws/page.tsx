import { db } from "@/lib/db";
import { InstantDrawService, INSTANT_DRAW_PRESETS } from "@/lib/instant-draw-service";
import InstantAdminClient from "./instant-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminInstantDrawsPage() {
  const [activeDraws, recentCompleted] = await Promise.all([
    InstantDrawService.listActiveInstantDraws(),
    db.campaign.findMany({
      where: {
        slug: { startsWith: "flash-" },
        status: "COMPLETED",
      },
      include: {
        prizes: true,
        draw: true,
        _count: { select: { entries: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <InstantAdminClient
      initialActiveDraws={activeDraws}
      initialCompleted={recentCompleted}
      presets={INSTANT_DRAW_PRESETS}
    />
  );
}
