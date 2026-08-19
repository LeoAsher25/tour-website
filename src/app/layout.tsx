import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { RouteScrollReset } from "@/components/route-scroll-reset";
import { ScrollToTop } from "@/components/scroll-to-top";
import { siteConfig } from "@/config/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.seo.title,
    template: `%s | ${siteConfig.brand.fullName}`,
  },
  description: siteConfig.seo.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.brand.fullName,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <RouteScrollReset />
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
