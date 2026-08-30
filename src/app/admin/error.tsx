"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error Boundary Caught]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 border border-amber-200 shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong in Admin Portal</h2>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        {error.message || "An unexpected error occurred while loading dashboard data."}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
        <Link
          href="/admin/campaigns"
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all shadow-sm"
        >
          <LayoutDashboard className="w-4 h-4" /> Go to Campaigns
        </Link>
      </div>
    </div>
  );
}
