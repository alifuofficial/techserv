import AdminSettingsClient from './settings-client';
import { getSystemSetting } from '@/modules/settings/settings-service';

export default async function AdminSettingsPage() {
  const settings = {
    webEnabled: (await getSystemSetting('web_enabled', 'true')) === 'true',
    telegramEnabled: (await getSystemSetting('telegram_enabled', 'true')) === 'true',
    telebirrEnabled: (await getSystemSetting('telebirr_enabled', 'true')) === 'true',
    cbeEnabled: (await getSystemSetting('cbe_enabled', 'true')) === 'true',
    verifyEtApiKey: await getSystemSetting('verify_et_api_key', ''),
    telegramBotToken: await getSystemSetting('telegram_bot_token', ''),
    telegramBotUsername: await getSystemSetting('telegram_bot_username', 'milkytech_bot'),
    telegramAuthOnly: (await getSystemSetting('telegram_auth_only', 'false')) === 'true',
    platformName: await getSystemSetting('platform_name', 'MilkyTech'),
    supportEmail: await getSystemSetting('support_email', 'support@milkytech.online')
  };

  return <AdminSettingsClient initialSettings={settings} />;
}
