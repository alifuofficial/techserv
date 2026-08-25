import AdminSettingsClient from './settings-client';
import { getSystemSetting } from '@/modules/settings/settings-service';

export default async function AdminSettingsPage() {
  const webEnabledStr = await getSystemSetting('web_enabled', 'true');
  const telegramEnabledStr = await getSystemSetting('telegram_enabled', 'true');

  const initialWebEnabled = webEnabledStr === 'true';
  const initialTelegramEnabled = telegramEnabledStr === 'true';

  return <AdminSettingsClient initialWebEnabled={initialWebEnabled} initialTelegramEnabled={initialTelegramEnabled} />;
}
