import { getSystemSetting } from "@/modules/settings/settings-service";
import RegisterClient from "./register-client";

export default async function RegisterPage() {
  const telegramAuthOnly = await getSystemSetting("telegram_auth_only", "false");
  const botUsername = await getSystemSetting("telegram_bot_username", "");

  return <RegisterClient telegramAuthOnly={telegramAuthOnly === "true"} botUsername={botUsername} />;
}
