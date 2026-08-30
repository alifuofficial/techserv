import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ProfileClient from "./profile-client";

export default function ProfilePage() {
  return (
    <div className="pb-24 px-5 min-h-screen bg-[#0B0F19]">
      <div className="pt-14 pb-6 flex items-center gap-4 sticky top-0 bg-[#0B0F19]/90 backdrop-blur-lg z-10">
        <Link href="/telegram" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center active:scale-95 transition-transform">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">Profile</h1>
      </div>

      <ProfileClient dbUser={null} telegramId="" />
    </div>
  );
}
