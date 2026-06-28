import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { BRAND } from "@/lib/constants";
import { DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS, getSiteUrl } from "@/lib/seo/site";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { parseTheme } from "@/lib/theme/resolve";
import enMessages from "@/messages/en.json";
import { ModalProvider } from "@/components/ui/ModalProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: {
    default: BRAND.name,
    template: `%s | ${BRAND.name}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: BRAND.name,
    title: BRAND.name,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: BRAND.name,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.name,
    description: DEFAULT_DESCRIPTION,
    images: [`${siteUrl}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
  },
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

  const cookieStore = await cookies();
  const theme = parseTheme(cookieStore.get("theme")?.value);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${theme} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider defaultTheme={theme}>
            <ModalProvider>
              <ToastProvider>{children}</ToastProvider>
            </ModalProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
