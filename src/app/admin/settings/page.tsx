import AdminSettingsClient, { WithdrawalMethodItem } from './settings-client';
import { getSystemSetting } from '@/modules/settings/settings-service';

export const dynamic = "force-dynamic";

export interface PaymentMethodItem {
  id: string;
  name: string;
  shortCode: string;
  category: "MOBILE_MONEY" | "BANK_TRANSFER";
  accountName: string;
  accountNumber: string;
  instructions: string;
  enabled: boolean;
  color: string;
}

export default async function AdminSettingsPage() {
  const telebirrEnabled = (await getSystemSetting('telebirr_enabled', 'true')) === 'true';
  const telebirrAccountName = await getSystemSetting('telebirr_account_name', 'MilkyTech Online');
  const telebirrAccountNumber = await getSystemSetting('telebirr_account_number', '0911000000');
  const telebirrInstructions = await getSystemSetting('telebirr_instructions', 'Transfer to the Telebirr number above and upload your screenshot receipt.');

  const cbeEnabled = (await getSystemSetting('cbe_enabled', 'true')) === 'true';
  const cbeAccountName = await getSystemSetting('cbe_account_name', 'MilkyTech Online PLC');
  const cbeAccountNumber = await getSystemSetting('cbe_account_number', '1000123456789');
  const cbeInstructions = await getSystemSetting('cbe_instructions', 'Transfer to the CBE account number above and upload your screenshot receipt.');

  const customPaymentMethodsRaw = await getSystemSetting('custom_payment_methods', '');
  let customPaymentMethods: PaymentMethodItem[] = [];

  if (customPaymentMethodsRaw) {
    try {
      customPaymentMethods = JSON.parse(customPaymentMethodsRaw);
    } catch (e) {
      customPaymentMethods = [];
    }
  }

  // If no custom methods array yet, initialize with default Telebirr and CBE
  if (!customPaymentMethods || customPaymentMethods.length === 0) {
    customPaymentMethods = [
      {
        id: "telebirr",
        name: "Telebirr Direct",
        shortCode: "TB",
        category: "MOBILE_MONEY",
        accountName: telebirrAccountName,
        accountNumber: telebirrAccountNumber,
        instructions: telebirrInstructions,
        enabled: telebirrEnabled,
        color: "blue",
      },
      {
        id: "cbe",
        name: "Commercial Bank of Ethiopia (CBE)",
        shortCode: "CBE",
        category: "BANK_TRANSFER",
        accountName: cbeAccountName,
        accountNumber: cbeAccountNumber,
        instructions: cbeInstructions,
        enabled: cbeEnabled,
        color: "purple",
      },
    ];
  }

  // Withdrawal Methods
  const customWithdrawalMethodsRaw = await getSystemSetting('withdrawal_methods', '');
  let withdrawalMethods: WithdrawalMethodItem[] = [];
  if (customWithdrawalMethodsRaw) {
    try {
      withdrawalMethods = JSON.parse(customWithdrawalMethodsRaw);
    } catch (e) {
      withdrawalMethods = [];
    }
  }

  if (!withdrawalMethods || withdrawalMethods.length === 0) {
    withdrawalMethods = [
      { id: "TELEBIRR", name: "Telebirr Mobile Money", shortCode: "TB", enabled: true, color: "blue" },
      { id: "CBE", name: "Commercial Bank of Ethiopia (CBE)", shortCode: "CBE", enabled: true, color: "purple" },
      { id: "BOA", name: "Bank of Abyssinia", shortCode: "BOA", enabled: true, color: "amber" },
      { id: "AWASH", name: "Awash Bank", shortCode: "AWASH", enabled: true, color: "emerald" },
      { id: "DASHEN", name: "Dashen Bank", shortCode: "DASHEN", enabled: true, color: "blue" },
    ];
  }

  const settings = {
    // General
    platformName: await getSystemSetting('platform_name', 'MilkyTech'),
    supportEmail: await getSystemSetting('support_email', 'support@milkytech.online'),
    
    // Availability
    webEnabled: (await getSystemSetting('web_enabled', 'true')) === 'true',
    telegramEnabled: (await getSystemSetting('telegram_enabled', 'true')) === 'true',
    telegramAuthOnly: (await getSystemSetting('telegram_auth_only', 'false')) === 'true',

    // Payment Methods (Deposits)
    telebirrEnabled,
    telebirrAccountName,
    telebirrAccountNumber,
    telebirrInstructions,
    
    cbeEnabled,
    cbeAccountName,
    cbeAccountNumber,
    cbeInstructions,

    paymentMethods: customPaymentMethods,

    // Withdrawal Rules & Limits
    withdrawalMinAmount: await getSystemSetting('withdrawal_min_amount', '100'),
    withdrawalMaxDailyAmount: await getSystemSetting('withdrawal_max_daily_amount', '25000'),
    withdrawalFeePercent: await getSystemSetting('withdrawal_fee_percent', '0'),
    withdrawalMethods,

    // Welcome Registration Bonus
    welcomeBonusEnabled: (await getSystemSetting('welcome_bonus_enabled', 'true')) === 'true',
    welcomeBonusAmount: await getSystemSetting('welcome_bonus_amount', '5'),
    welcomeBonusCurrency: await getSystemSetting('welcome_bonus_currency', 'ETB'),

    // Lucky Spin & Cooldown
    dailySpinCooldownHours: await getSystemSetting('daily_spin_cooldown_hours', '24'),
    spinReminderDmEnabled: (await getSystemSetting('spin_reminder_dm_enabled', 'true')) === 'true',

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
    referralUnlockCondition: await getSystemSetting('referral_unlock_condition', 'ON_FIRST_DEPOSIT'),
    referralMinDepositAmount: await getSystemSetting('referral_min_deposit_amount', '50'),
  };

  return <AdminSettingsClient initialSettings={settings} />;
}
