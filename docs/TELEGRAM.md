# Telegram Integration

## 1. Bot Functionality
The Telegram Bot acts as an entry point and notification center.
- `/start` - Welcomes the user, provides inline keyboards to "Browse Campaigns", "My Entries".
- `/start ref_123` - Captures referral links and deep links directly into specific campaigns.
- Webhook endpoints map user interactions to the core Domain Services.

## 2. Mini App Architecture
The Telegram Mini App (TMA) is just the Next.js application loaded inside an iframe by Telegram.

```javascript
// Example TMA Detection in Next.js
export function useTelegram() {
  const [isTMA, setIsTMA] = useState(false);
  const [initData, setInitData] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setIsTMA(true);
      setInitData(window.Telegram.WebApp.initData);
      window.Telegram.WebApp.ready();
    }
  }, []);

  return { isTMA, initData };
}
```

## 3. Authentication & Account Linking
When the TMA opens:
1. It sends `initData` to `/api/v1/telegram/auth`.
2. The backend validates the HMAC signature using the Bot Token.
3. If valid, it extracts the Telegram User ID.
4. It looks up `user_identities` for this Telegram ID.
5. If found, logs them in (returns session).
6. If not found, it prompts the user to Link an existing Web account (via Email OTP) or Create a new account instantly.
