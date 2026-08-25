import Script from "next/script";
import { getSystemSetting } from "@/modules/settings/settings-service";
import { Providers } from "@/components/providers";

export default async function TelegramLayout({ children }: { children: React.ReactNode }) {
  const telegramEnabled = await getSystemSetting("telegram_enabled", "true");

  if (telegramEnabled === "false") {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
        <div className="text-center p-8 bg-[#121826] rounded-3xl border border-white/5">
          <h2 className="text-xl font-bold text-white mb-2">Service Unavailable</h2>
          <p className="text-slate-400 text-sm">The Telegram Mini App is currently disabled by the administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <Providers>
      <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-emerald-500/30">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        {children}
      </div>
    </Providers>
  );
}
