import { db } from '@/lib/db';

// High-performance in-memory cache for system settings with 60-second TTL
const settingsCache = new Map<string, { value: string; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export async function getSystemSetting(key: string, defaultValue: string): Promise<string> {
  const now = Date.now();
  const cached = settingsCache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  try {
    const setting = await db.systemSetting.findUnique({ where: { key } });
    const value = setting?.value ?? defaultValue;
    settingsCache.set(key, { value, expiresAt: now + CACHE_TTL_MS });
    return value;
  } catch (error) {
    // Next.js build-time prerendering gracefully falls back to default if DB is unavailable
    console.warn(`[getSystemSetting] Failed to fetch setting '${key}', returning default. Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    return defaultValue;
  }
}

export async function getMultipleSystemSettings(keys: { key: string; defaultValue: string }[]): Promise<Record<string, string>> {
  const now = Date.now();
  const result: Record<string, string> = {};
  const missingKeys: { key: string; defaultValue: string }[] = [];

  for (const item of keys) {
    const cached = settingsCache.get(item.key);
    if (cached && cached.expiresAt > now) {
      result[item.key] = cached.value;
    } else {
      missingKeys.push(item);
    }
  }

  if (missingKeys.length > 0) {
    try {
      const records = await db.systemSetting.findMany({
        where: { key: { in: missingKeys.map((k) => k.key) } },
      });
      const recordMap = new Map(records.map((r) => [r.key, r.value]));

      for (const item of missingKeys) {
        const value = recordMap.get(item.key) ?? item.defaultValue;
        result[item.key] = value;
        settingsCache.set(item.key, { value, expiresAt: now + CACHE_TTL_MS });
      }
    } catch (e) {
      for (const item of missingKeys) {
        result[item.key] = item.defaultValue;
      }
    }
  }

  return result;
}

export async function setSystemSetting(key: string, value: string) {
  // Invalidate and update cache immediately
  settingsCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  
  await db.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
}
