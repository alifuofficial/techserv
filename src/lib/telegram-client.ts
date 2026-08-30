/**
 * Client helper to make API requests to /api/telegram/* with automatic x-telegram-init-data attachment
 * and aggressive cache-busting for Telegram WebViews.
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
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    ...(options.headers as Record<string, string> || {}),
  };

  if (initData) {
    headers["x-telegram-init-data"] = initData;
  }

  const isGet = !options.method || options.method.toUpperCase() === "GET";
  const separator = path.includes("?") ? "&" : "?";
  const finalUrl = isGet ? `${path}${separator}_t=${Date.now()}` : path;

  const res = await fetch(finalUrl, {
    ...options,
    cache: "no-store",
    headers,
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
