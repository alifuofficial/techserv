'use server';

import { setSystemSetting } from '@/modules/settings/settings-service';
import { revalidatePath } from 'next/cache';

export async function savePlatformSettings(webEnabled: boolean, telegramEnabled: boolean) {
  await setSystemSetting('web_enabled', webEnabled.toString());
  await setSystemSetting('telegram_enabled', telegramEnabled.toString());
  revalidatePath('/');
  revalidatePath('/admin/settings');
  return { success: true };
}
