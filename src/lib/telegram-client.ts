/**
 * Helper to extract start_param from all possible Telegram Mini App sources
 * (URL queries ?startapp, ?tgWebAppStartParam, ?start_param, Telegram WebApp SDK, sessionStorage)
 */
export function getTelegramStartParam(): string | null {
  if (typeof window === "undefined") return null;

  // 1. Check window.location.search (e.g. ?startapp=... or ?start_param=... or ?ref=... or ?tgWebAppStartParam=...)
  const params = new URLSearchParams(window.location.search);
  const fromUrl =
    params.get("startapp") ||
    params.get("start_param") ||
    params.get("ref") ||
    params.get("tgWebAppStartParam");
  if (fromUrl) {
    try {
      sessionStorage.setItem("milky_start_param", fromUrl);
    } catch (e) {}
    return fromUrl;
  }

  // 2. Check window.Telegram.WebApp.initDataUnsafe
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.initDataUnsafe?.start_param) {
    try {
      sessionStorage.setItem("milky_start_param", tg.initDataUnsafe.start_param);
    } catch (e) {}
    return tg.initDataUnsafe.start_param;
  }

  // 3. Fallback to cached start param in sessionStorage
  try {
    const cached = sessionStorage.getItem("milky_start_param");
    if (cached) return cached;
  } catch (e) {}

  return null;
}

/**
 * Client helper to make API requests to /api/telegram/* with automatic x-telegram-init-data attachment,
 * start_param forwarding for referral attribution, and aggressive cache-busting for Telegram WebViews.
 */
export async function fetchTelegramApi(path: string, options: RequestInit = {}) {
  let initData = "";
  if (typeof window !== "undefined") {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initData) {
      initData = tg.initData;
    }
  }

  const startParam = getTelegramStartParam();

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

  if (startParam) {
    headers["x-telegram-start-param"] = encodeURIComponent(startParam);
  }

  const isGet = !options.method || options.method.toUpperCase() === "GET";
  const separator = path.includes("?") ? "&" : "?";
  let finalUrl = path;

  if (isGet) {
    const startParamQuery = startParam ? `&startParam=${encodeURIComponent(startParam)}` : "";
    finalUrl = `${path}${separator}_t=${Date.now()}${startParamQuery}`;
  }

  const res = await fetch(finalUrl, {
    ...options,
    cache: "no-store",
    headers,
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
