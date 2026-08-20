import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Root path — the next-intl proxy negotiates the locale from the
 * Accept-Language header / cookie and redirects `/` to `/{locale}`. This
 * page is a final fallback (e.g. static rendering edge cases).
 */
export default function RootPage() {
  redirect({ href: "/", locale: routing.defaultLocale });
}
