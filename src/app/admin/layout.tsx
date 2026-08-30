import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role?.toUpperCase() !== "ADMIN") {
    redirect("/auth/login?callbackUrl=/admin"); 
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
