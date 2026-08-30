import AdminSettingsClient from './settings-client';
import { getSystemSetting } from '@/modules/settings/settings-service';

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = {
    // General
    platformName: await getSystemSetting('platform_name', 'MilkyTech'),
    supportEmail: await getSystemSetting('support_email', 'support@milkytech.online'),
    
    // Availability
    webEnabled: (await getSystemSetting('web_enabled', 'true')) === 'true',
    telegramEnabled: (await getSystemSetting('telegram_enabled', 'true')) === 'true',
    telegramAuthOnly: (await getSystemSetting('telegram_auth_only', 'false')) === 'true',

    // Payment Methods
    telebirrEnabled: (await getSystemSetting('telebirr_enabled', 'true')) === 'true',
    telebirrAccountName: await getSystemSetting('telebirr_account_name', 'MilkyTech Online'),
    telebirrAccountNumber: await getSystemSetting('telebirr_account_number', '0911000000'),
    telebirrInstructions: await getSystemSetting('telebirr_instructions', 'Transfer to the Telebirr number above and upload your screenshot receipt.'),
    
    cbeEnabled: (await getSystemSetting('cbe_enabled', 'true')) === 'true',
    cbeAccountName: await getSystemSetting('cbe_account_name', 'MilkyTech Online PLC'),
    cbeAccountNumber: await getSystemSetting('cbe_account_number', '1000123456789'),
    cbeInstructions: await getSystemSetting('cbe_instructions', 'Transfer to the CBE account number above and upload your screenshot receipt.'),

    // API Keys
    verifyEtApiKey: await getSystemSetting('verify_et_api_key', ''),
    telegramBotToken: await getSystemSetting('telegram_bot_token', ''),
    telegramBotUsername: await getSystemSetting('telegram_bot_username', 'milkytechonlinebot'),

    // SMTP Email
    smtpHost: await getSystemSetting('smtp_host', ''),
    smtpPort: await getSystemSetting('smtp_port', '587'),
    smtpUser: await getSystemSetting('smtp_user', ''),
    smtpPass: await getSystemSetting('smtp_pass', ''),
    smtpFromName: await getSystemSetting('smtp_from_name', 'MilkyTech Support'),
    smtpFromEmail: await getSystemSetting('smtp_from_email', 'support@milkytech.online'),
    smtpSecure: (await getSystemSetting('smtp_secure', 'false')) === 'true',

    // Referrals
    referralEnabled: (await getSystemSetting('referral_enabled', 'true')) === 'true',
    referralBonusAmount: await getSystemSetting('referral_bonus_amount', '10'),
    referralCurrency: await getSystemSetting('referral_currency', 'ETB'),
    referralCustomText: await getSystemSetting('referral_custom_text', 'Earn bonus for every friend who joins MilkyTech using your link!'),
  };

  return <AdminSettingsClient initialSettings={settings} />;
}
