import { db } from '@/lib/db';

export async function getSystemSetting(key: string, defaultValue: string): Promise<string> {
  try {
    const setting = await db.systemSetting.findUnique({ where: { key } });
    return setting?.value ?? defaultValue;
  } catch (error) {
    // Next.js build-time prerendering gracefully falls back to default if DB is unavailable
    console.warn(`[getSystemSetting] Failed to fetch setting '${key}', returning default. Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    return defaultValue;
  }
}

export async function setSystemSetting(key: string, value: string) {
  await db.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
}
