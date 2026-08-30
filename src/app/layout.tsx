import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MilkyTech | Prize Campaigns",
  description: "Join exciting prize campaigns and win big!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
