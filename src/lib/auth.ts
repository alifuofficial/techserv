import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { db } from "./db";

function validateTelegramWebAppData(telegramInitData: string): { isValid: boolean; user?: any } {
  const initData = new URLSearchParams(telegramInitData);
  const hash = initData.get('hash');
  
  if (!hash) {
    return { isValid: false };
  }

  initData.delete('hash');
  
  const keys = Array.from(initData.keys()).sort();
  const dataCheckString = keys.map((key) => `${key}=${initData.get(key)}`).join('\n');

  const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (calculatedHash === hash) {
    const userStr = initData.get('user');
    return {
      isValid: true,
      user: userStr ? JSON.parse(userStr) : null,
    };
  }

  return { isValid: false };
}

function validateTelegramWidgetData(data: any): boolean {
  const hash = data.hash;
  if (!hash) return false;

  const dataCheckArr = [];
  const allowedKeys = ['auth_date', 'first_name', 'id', 'last_name', 'photo_url', 'username'];
  for (const key of allowedKeys) {
    if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
      dataCheckArr.push(key + '=' + data[key]);
    }
  }
  dataCheckArr.sort();
  const dataCheckString = dataCheckArr.join('\n');
  
  const secretKey = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN || '').digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return calculatedHash === hash;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email or Phone", type: "text", placeholder: "Email or Phone" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await db.user.findFirst({
          where: {
            OR: [
              { email: credentials.email },
              { phone: credentials.email }
            ]
          }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    }),
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: {
        initData: { label: "Init Data", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.initData) throw new Error("Missing initData");

        const { isValid, user: telegramUser } = validateTelegramWebAppData(credentials.initData);
        if (!isValid || !telegramUser) throw new Error("Invalid Telegram data");

        const telegramId = telegramUser.id.toString();
        const username = telegramUser.username || `tg_${telegramId}`;

        // Find existing user by telegram ID (we'll store it in a new field or simply link via email for now)
        // Since we don't have UserIdentity model in the actual schema (Wait, do we?)
        // Let's check if there is a UserIdentity model in Prisma.
        // If not, we will use email `telegram_${telegramId}@milkytech.online`.
        
        let user = await db.user.findFirst({
          where: { email: `telegram_${telegramId}@milkytech.online` }
        });

        if (!user) {
          let referredById = null;
          try {
            const params = new URLSearchParams(credentials.initData);
            const startParam = params.get('start_param');
            if (startParam && startParam.startsWith('MILKY-')) {
              const referrerIdFragment = startParam.replace('MILKY-', '');
              const referrer = await db.user.findFirst({
                where: {
                  id: {
                    startsWith: referrerIdFragment,
                    mode: 'insensitive'
                  }
                }
              });
              if (referrer) {
                referredById = referrer.id;
              }
            }
          } catch (e) {
            console.error("Referral error", e);
          }

          user = await db.user.create({
            data: {
              name: telegramUser.first_name + (telegramUser.last_name ? ` ${telegramUser.last_name}` : ''),
              email: `telegram_${telegramId}@milkytech.online`,
              role: 'USER',
              password: '', // No password for telegram users
              referredById: referredById
            }
          });
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    }),
    CredentialsProvider({
      id: "telegram-widget",
      name: "Telegram Widget",
      credentials: {
        id: { label: "id", type: "text" },
        first_name: { label: "first_name", type: "text" },
        last_name: { label: "last_name", type: "text" },
        username: { label: "username", type: "text" },
        photo_url: { label: "photo_url", type: "text" },
        auth_date: { label: "auth_date", type: "text" },
        hash: { label: "hash", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.hash) throw new Error("Missing hash");
        
        const isValid = validateTelegramWidgetData(credentials);
        if (!isValid) throw new Error("Invalid Telegram Widget data");

        const telegramId = credentials.id;
        let user = await db.user.findFirst({
          where: { email: `telegram_${telegramId}@milkytech.online` }
        });

        if (!user) {
          user = await db.user.create({
            data: {
              name: credentials.first_name + (credentials.last_name ? ` ${credentials.last_name}` : ''),
              email: `telegram_${telegramId}@milkytech.online`,
              role: 'USER',
              password: '', // No password for telegram users
            }
          });
        }
        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-do-not-use-in-prod",
};
