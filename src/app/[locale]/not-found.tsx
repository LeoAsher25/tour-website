import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as getLocale } from "next/root-params";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "site.notFound" });
  return { title: t("title") };
}

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "site.notFound" });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-serif text-7xl text-accent">404</p>
      <h1 className="font-serif text-3xl">{t("title")}</h1>
      <p className="max-w-md text-sm font-light leading-7 text-muted-foreground">
        {t("description")}
      </p>
      <a href={`/${locale}`} className="mt-2 text-sm font-medium text-accent hover:text-accent-hover">
        {t("backHome")}
      </a>
    </div>
  );
}
