import "@/styles/globals.css";
import AppShell from "@/components/AppShell";
import type { Metadata } from "next";
import { LanguageProvider } from "@/i18n/language-context";

export const metadata: Metadata = {
  title: "AI Vidya for Bharat",
  description: "Generate learning courses instantly in your own language.",
  icons: {
    icon: [
      { url: "/icons/favicon.ico" },
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/icons/favicon.ico",
    apple: "/icons/favicon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900 antialiased">
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}