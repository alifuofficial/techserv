import { db } from '@/lib/db';

export async function getSystemSetting(key: string, defaultValue: string): Promise<string> {
  const setting = await db.systemSetting.findUnique({ where: { key } });
  return setting?.value ?? defaultValue;
}

export async function setSystemSetting(key: string, value: string) {
  await db.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
}
