import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createHash } from "crypto";
import { db } from "@/lib/db";

// Try to load bcryptjs, fallback to sha256 verification
let bcrypt: typeof import("bcryptjs") | null = null;
try {
  bcrypt = require("bcryptjs");
} catch {
  console.warn("bcryptjs not available, using sha256 for password hashing");
}

function verifyPassword(password: string, storedHash: string): boolean {
  // Handle sha256$ prefixed hashes
  if (storedHash.startsWith("sha256$")) {
    const hash = storedHash.replace("sha256$", "");
    const computedHash = createHash("sha256").update(password).digest("hex");
    return hash === computedHash;
  }
  // Handle bcrypt hashes
  if (bcrypt) {
    return bcrypt.compareSync(password, storedHash);
  }
  return false;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: {
        id: { label: "ID", type: "text" },
        first_name: { label: "First Name", type: "text" },
        last_name: { label: "Last Name", type: "text" },
        username: { label: "Username", type: "text" },
        photo_url: { label: "Photo URL", type: "text" },
        auth_date: { label: "Auth Date", type: "text" },
        hash: { label: "Hash", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const { id, hash } = credentials;
        if (!id || !hash) return null;

        // Filter valid Telegram fields for hash verification
        const telegramFields = [
          "id", "first_name", "last_name", "username", "photo_url", "auth_date"
        ];
        
        const data: Record<string, string> = { hash };
        for (const key of telegramFields) {
          if (credentials[key as keyof typeof credentials]) {
            data[key] = credentials[key as keyof typeof credentials] as string;
          }
        }

        // Fetch bot token from settings
        const botTokenSetting = await db.setting.findUnique({
          where: { key: "telegram_bot_token" },
        });

        if (!botTokenSetting?.value) {
          throw new Error("Telegram bot not configured");
        }

        const isEnabledSetting = await db.setting.findUnique({
          where: { key: "telegram_enabled" },
        });

        if (isEnabledSetting?.value !== "true") {
          throw new Error("Telegram login is currently disabled");
        }

        // Verify hash
        const { verifyTelegramAuth } = await import("./telegram");
        const isValid = verifyTelegramAuth(data, botTokenSetting.value);

        if (!isValid) {
          throw new Error("Invalid Telegram authentication");
        }

        // Find or create user
        let user = await db.user.findUnique({
          where: { telegramId: id },
        });

        if (!user) {
          // ... (existing user creation logic)
          const randomPassword = Math.random().toString(36);
          const hashedPassword = bcrypt 
            ? bcrypt.hashSync(randomPassword, 12)
            : "sha256$" + createHash("sha256").update(randomPassword).digest("hex");
          
          user = await db.user.create({
            data: {
              name: credentials.username 
                ? `@${credentials.username}` 
                : `${credentials.first_name} ${credentials.last_name || ""}`.trim(),
              email: `${id}@telegram.user`, // Temporary email for telegram users
              password: hashedPassword,
              telegramId: id,
              telegram: credentials.username ? `@${credentials.username}` : null,
              referralCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
              tier: "Standard",
            },
          });
        }

        // --- Soft Delete Handle ---
        if (user.deletedAt) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          if (user.deletedAt < thirtyDaysAgo) {
            throw new Error("This account has been permanently deleted.");
          }

          // Restore account
          await db.user.update({
            where: { id: user.id },
            data: { deletedAt: null },
          });
        }

        // --- Banned Account Check ---
        if (user.isActive === false) {
          throw new Error("Your account has been suspended. Please contact support.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tier: user.tier,
          referralCode: user.referralCode,
        };
      },
    }),
    CredentialsProvider({
      id: "telegram-tma",
      name: "Telegram Mini App",
      credentials: {
        initData: { label: "Init Data", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.initData) return null;

        const { initData } = credentials;

        // Fetch bot token from settings
        const botTokenSetting = await db.setting.findUnique({
          where: { key: "telegram_bot_token" },
        });

        if (!botTokenSetting?.value) {
          throw new Error("Telegram bot not configured");
        }

        // Verify HMAC signature
        const { verifyTmaAuth } = await import("./telegram");
        const isValid = verifyTmaAuth(initData, botTokenSetting.value);

        if (!isValid) {
          throw new Error("Invalid Mini App authentication");
        }

        // Extract user info from initData
        const params = new URLSearchParams(initData);
        const userRaw = params.get("user");
        if (!userRaw) throw new Error("User data missing in initData");

        const tgUser = JSON.parse(userRaw);
        const { id, first_name, last_name, username } = tgUser;

        // Extract start_param for referrals
        const startParamRaw = params.get("start_param");

        // Find or create user
        let user = await db.user.findUnique({
          where: { telegramId: String(id) },
        });

        if (!user) {
          let referredById = null;
          if (startParamRaw && startParamRaw.startsWith("ref_")) {
            const code = startParamRaw.replace("ref_", "");
            const referer = await db.user.findUnique({
              where: { referralCode: code },
            });
            if (referer) {
              referredById = referer.id;
            }
          }

          const randomPassword = Math.random().toString(36);
          const hashedPassword = bcrypt 
            ? bcrypt.hashSync(randomPassword, 12)
            : "sha256$" + createHash("sha256").update(randomPassword).digest("hex");
          
          user = await db.user.create({
            data: {
              name: username 
                ? `@${username}` 
                : `${first_name} ${last_name || ""}`.trim(),
              email: `${id}@telegram.user`,
              password: hashedPassword,
              telegramId: String(id),
              telegram: username ? `@${username}` : null,
              referralCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
              tier: "Standard",
              isActive: true, // Auto-activate TMA users
              emailVerified: new Date(),
              referredById,
            },
          });
        }

        // --- Soft Delete Handle ---
        if (user.deletedAt) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          if (user.deletedAt < thirtyDaysAgo) {
            throw new Error("This account has been permanently deleted.");
          }

          // Restore account
          await db.user.update({
            where: { id: user.id },
            data: { deletedAt: null },
          });
        }

        // --- Banned Account Check ---
        if (user.isActive === false) {
          throw new Error("Your account has been suspended. Please contact support.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tier: user.tier,
          referralCode: user.referralCode,
        };
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        const isPasswordValid = verifyPassword(credentials.password, user.password);
        if (!isPasswordValid) return null;

        // --- Soft Delete Handle ---
        if (user.deletedAt) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          if (user.deletedAt < thirtyDaysAgo) {
            throw new Error("This account has been permanently deleted.");
          }

          // Restore account
          await db.user.update({
            where: { id: user.id },
            data: { deletedAt: null },
          });
        }

        // --- Banned Account Check ---
        if (user.isActive === false) {
          throw new Error("Your account has been suspended. Please contact support.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tier: user.tier,
          referralCode: user.referralCode,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.tier = (user as any).tier;
        token.referralCode = (user as any).referralCode;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).tier = token.tier;
        (session.user as any).referralCode = token.referralCode;

        // Check if user is still active (not banned)
        if (token.id) {
          const user = await db.user.findUnique({
            where: { id: token.id as string },
            select: { isActive: true },
          });
          if (user && user.isActive === false) {
            (session.user as any).banned = true;
          }
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
