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
      setIsTma(true);
      tg.ready();
      tg.expand();

      // Set theme variables
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);

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
      </TelegramContext.Provider>
    </>
  );
}
