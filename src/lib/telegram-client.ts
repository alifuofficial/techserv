/**
 * Client helper to make API requests to /api/telegram/* with automatic x-telegram-init-data attachment.
 */
export async function fetchTelegramApi(path: string, options: RequestInit = {}) {
  let initData = "";
  if (typeof window !== "undefined") {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initData) {
      initData = tg.initData;
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (initData) {
    headers["x-telegram-init-data"] = initData;
  }

  const res = await fetch(path, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
