'use server';

import { setSystemSetting } from '@/modules/settings/settings-service';
import { revalidatePath } from 'next/cache';

export async function savePlatformSettings(settings: Record<string, string>) {
  for (const [key, value] of Object.entries(settings)) {
    await setSystemSetting(key, value);
  }
  revalidatePath('/');
  revalidatePath('/admin/settings');
  return { success: true };
}
