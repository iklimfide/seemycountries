import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { BRAND } from "@/lib/constants";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import enMessages from "@/messages/en.json";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: BRAND.name,
    template: `%s | ${BRAND.name}`,
  },
  description:
    "Mark the countries and cities you've visited. One perfect photo and memory per city — built for speed and social sharing.",
  metadataBase: new URL(`https://${BRAND.domain}`),
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let locale: Locale = defaultLocale;
  let messages: Record<string, unknown> = enMessages;

  try {
    locale = (await getLocale()) as Locale;
    messages = await getMessages();
  } catch {
    // Fallback when request config is unavailable (e.g. during error recovery)
  }

  return (
    <html lang={locale} className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
