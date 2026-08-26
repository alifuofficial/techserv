import { getSystemSetting } from "@/modules/settings/settings-service";
import LoginClient from "./login-client";

export default async function LoginPage() {
  const telegramAuthOnly = await getSystemSetting("telegram_auth_only", "false");
  const botUsername = await getSystemSetting("telegram_bot_username", "");

  return <LoginClient telegramAuthOnly={telegramAuthOnly === "true"} botUsername={botUsername} />;
}
