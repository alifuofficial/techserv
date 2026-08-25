"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface HeaderAuthProps {
  session: any;
}

export function HeaderAuth({ session }: HeaderAuthProps) {
  if (session) {
    const role = (session.user?.role || "USER").toUpperCase();
    const dashboardLink = role === "ADMIN" ? "/admin" : (role === "MERCHANT" ? "/merchant" : "/dashboard");

    return (
      <div className="flex items-center gap-3">
        <Button variant="outline" className="hidden sm:inline-flex bg-transparent border-white/10 text-white hover:bg-white/5 h-10 px-6 rounded-full" asChild>
          <Link href={dashboardLink}>Dashboard</Link>
        </Button>
        <Button 
          onClick={() => signOut({ callbackUrl: '/' })} 
          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 h-10 px-6 rounded-full border-none"
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" className="hidden sm:inline-flex bg-transparent border-white/10 text-white hover:bg-white/5 h-10 px-6 rounded-full" asChild>
        <Link href="/auth/login">Login</Link>
      </Button>
      <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-6 rounded-full border-none" asChild>
        <Link href="/auth/register">Sign Up</Link>
      </Button>
    </div>
  );
}
