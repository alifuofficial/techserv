"use client";

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";

export function TelegramLoginWidget({ botUsername }: { botUsername: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!botUsername || !containerRef.current) return;

    // Clear existing script if any
    containerRef.current.innerHTML = "";

    // Telegram global callback
    (window as any).onTelegramAuth = function (user: any) {
      signIn("telegram-widget", {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name || "",
        username: user.username || "",
        photo_url: user.photo_url || "",
        auth_date: user.auth_date,
        hash: user.hash,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "10");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    containerRef.current.appendChild(script);
  }, [botUsername]);

  if (!botUsername) {
    return <div className="text-red-500 text-sm">Bot username not configured.</div>;
  }

  return <div ref={containerRef} className="flex justify-center my-4 min-h-[40px]" />;
}
