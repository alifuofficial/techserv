import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || "";
  
  const dbUser = await db.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true }
  });
  
  const telegramId = email.split('@')[0].replace('telegram_', '');

  return (
    <div className="pb-24 px-5">
      <div className="pt-14 pb-6 flex items-center gap-4 sticky top-0 bg-[#0B0F19]/80 backdrop-blur-lg z-10">
        <Link href="/telegram" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">Profile</h1>
      </div>

      <ProfileClient dbUser={dbUser} telegramId={telegramId} />
    </div>
  );
}
