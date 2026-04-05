"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { MaintenancePage } from "./maintenance-page";
import { Loader2 } from "lucide-react";

export function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkMaintenance() {
      try {
        const res = await fetch("/api/settings/public");
        if (res.ok) {
          const settings = await res.json();
          setMaintenanceMode(settings.maintenance_mode === "true");
        }
      } catch (error) {
        console.error("Maintenance check failed", error);
        setMaintenanceMode(false);
      }
    }
    checkMaintenance();
  }, []);

  const isAdmin = (session?.user as any)?.role === "admin";
  const isAuthPage = pathname?.startsWith("/auth") || pathname?.startsWith("/api/auth");
  const isHome = pathname === "/";

  // If maintenance is ON, and user is NOT admin, and not on an auth/home page (optional home bypass?)
  // User usually wants to block everything except signin
  if (maintenanceMode && !isAdmin && !isAuthPage) {
    return <MaintenancePage />;
  }

  // Still loading settings
  if (maintenanceMode === null && status !== "unauthenticated") {
     // Optional: loading state or just proceed
  }

  return <>{children}</>;
}
