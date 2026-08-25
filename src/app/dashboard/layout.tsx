import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserDashboardClient from "./UserDashboardClient";
import { getSystemSetting } from "@/modules/settings/settings-service";
import { TelegramSplash } from "@/components/telegram-splash";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const webEnabled = await getSystemSetting("web_enabled", "true");
  if (webEnabled === "false") {
    return <TelegramSplash />;
  }

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login"); 
  }

  const role = (session.user as any)?.role?.toUpperCase();
  if (role === "ADMIN") {
    redirect("/admin");
  }

  return <UserDashboardClient session={session}>{children}</UserDashboardClient>;
}
