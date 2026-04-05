import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

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

        const { id, hash, ...data } = credentials;
        if (!id || !hash) return null;

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
        const isValid = verifyTelegramAuth(credentials as any, botTokenSetting.value);

        if (!isValid) {
          throw new Error("Invalid Telegram authentication");
        }

        // Find or create user
        let user = await db.user.findUnique({
          where: { telegramId: id },
        });

        if (!user) {
          // Check if a user with the same email exists (Telegram doesn't provide email)
          // For TechServ, we'll create a new user or link if they provide a username
          user = await db.user.create({
            data: {
              name: credentials.username 
                ? `@${credentials.username}` 
                : `${credentials.first_name} ${credentials.last_name || ""}`.trim(),
              email: `${id}@telegram.user`, // Temporary email for telegram users
              password: await bcrypt.hash(Math.random().toString(36), 12),
              telegramId: id,
              telegram: credentials.username ? `@${credentials.username}` : null,
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
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
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
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
