import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { RouteScrollReset } from "@/components/route-scroll-reset";
import { ScrollToTop } from "@/components/scroll-to-top";
import { siteConfig } from "@/config/site";
import { buildOpenGraph, buildTwitterCard, siteUrl } from "@/lib/seo/og";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.seo.title,
    template: `%s | ${siteConfig.brand.fullName}`,
  },
  description: siteConfig.seo.description,
  openGraph: buildOpenGraph({
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    url: siteUrl,
  }),
  twitter: buildTwitterCard({
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
  }),
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
