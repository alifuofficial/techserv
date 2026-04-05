import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { db } from "@/lib/db";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Generate metadata dynamically from database settings
export async function generateMetadata(): Promise<Metadata> {
  let settings: { key: string; value: string }[] = [];
  try {
    settings = await db.setting.findMany();
  } catch (error) {
    // Fallback if db is unavilable during build
  }

  const getSetting = (key: string) => settings.find((s) => s.key === key)?.value;

  const siteName = getSetting("site_name") || "TechServ";
  const seoTitle = getSetting("seo_title") || siteName;
  const seoDesc = getSetting("seo_description") || "Premium digital services";
  const seoKeywords = getSetting("seo_keywords") || "";
  const seoAuthor = getSetting("seo_author") || siteName;

  return {
    title: {
      default: seoTitle,
      template: `%s | ${siteName}`,
    },
    description: seoDesc,
    keywords: seoKeywords,
    authors: [{ name: seoAuthor }],
    icons: { icon: getSetting("logo_url") || "https://z-cdn.chatglm.cn/z-ai/static/logo.svg" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let settings: { key: string; value: string }[] = [];
  try {
    settings = await db.setting.findMany();
  } catch (error) {
    // Silent
  }

  const getSetting = (key: string) => settings.find((s) => s.key === key)?.value;
  const logoUrl = getSetting("logo_url") || "";
  const siteName = getSetting("site_name") || "TechServ";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <Providers>
          <SiteHeader logoUrl={logoUrl} siteName={siteName} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
