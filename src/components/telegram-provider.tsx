"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Script from "next/script";
import { signIn, useSession } from "next-auth/react";

interface TelegramContextType {
  isTma: boolean;
  user: any | null;
  webApp: any | null;
}

const TelegramContext = createContext<TelegramContextType>({
  isTma: false,
  user: null,
  webApp: null,
});

export const useTelegram = () => useContext(TelegramContext);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [webApp, setWebApp] = useState<any>(null);
  const [isTma, setIsTma] = useState(false);
  const { status } = useSession();

  useEffect(() => {
    // Check if we are running inside Telegram
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initData) {
      setWebApp(tg);
      // For TMA, we want to force dark mode for the gamified feel
      document.documentElement.classList.add('dark')
      setIsTma(true)
      tg.ready();
      tg.expand();

      // Set theme variables safely
      if (tg.backgroundColor) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
      }
      if (tg.textColor) {
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
      }

      // Auto-login only if not already authenticated
      if (status === "unauthenticated") {
        signIn("telegram-tma", {
          initData: tg.initData,
          redirect: false,
        }).catch((err) => console.error("TMA Auto-login failed:", err));
      }
    }
  }, [status]);

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <TelegramContext.Provider
        value={{
          isTma,
          user: webApp?.initDataUnsafe?.user || null,
          webApp,
        }}
      >
        {children}
        <TmaNavigator />
      </TelegramContext.Provider>
    </>
  );
}

import { usePathname, useRouter } from "next/navigation";

function TmaNavigator() {
  const { isTma, webApp } = useTelegram();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isTma || !webApp || typeof webApp.BackButton === "undefined") return;

    if (pathname === "/dashboard" || pathname === "/") {
      webApp.BackButton.hide();
    } else {
      webApp.BackButton.show();
    }

    const handleBack = () => {
      // In mini apps, always push explicitly to Dashboard from anywhere to prevent falling into the webview history vacuum
      router.replace("/dashboard");
    };

    webApp.BackButton.onClick(handleBack);

    return () => {
      webApp.BackButton.offClick(handleBack);
    };
  }, [isTma, webApp, pathname, router]);

  return null;
}
