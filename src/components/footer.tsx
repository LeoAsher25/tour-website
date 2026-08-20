import { useTranslations } from "next-intl";
import { AtSign, Mail, MessageCircle } from "lucide-react";
import { siteConfig, getZaloLink, getPhoneLink } from "@/config/site";
import { Link } from "@/i18n/navigation";
import InstagramIcon from "./icons/InstagramIcon";

export function SiteFooter() {
  const t = useTranslations("site");
  const tf = useTranslations("site.footer");

  const exploreLinks = [
    { label: tf("exploreLinks.motorbikeTours"), href: "/#tours" },
    { label: tf("exploreLinks.jeepSuvTours"), href: "/#tours" },
    { label: tf("exploreLinks.itinerary"), href: "/#itinerary" },
    { label: tf("exploreLinks.services"), href: "/#services" },
    { label: tf("exploreLinks.travelBlog"), href: "/blogs" },
  ];

  return (
    <footer className="bg-dark-bg text-dark-text">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.7fr_0.7fr_1fr] lg:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-accent-tint">
            {siteConfig.brand.businessName}
          </p>
          <h3 className="mt-4 font-serif text-3xl leading-tight">
            {t("taglines.heroSubtitle")}
          </h3>
          <p className="mt-5 max-w-md text-sm font-light leading-7 text-dark-muted">
            {t("taglines.description")}
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label={`${siteConfig.brand.businessName} ${tf("onInstagram")}`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-dark-text/20 transition-colors hover:border-accent hover:text-accent">
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href={getZaloLink()}
              target="_blank"
              rel="noreferrer"
              aria-label={`${siteConfig.brand.businessName} ${tf("onZalo")}`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-dark-text/20 transition-colors hover:border-accent hover:text-accent">
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              aria-label={`${siteConfig.brand.businessName} ${tf("emailUs")}`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-dark-text/20 transition-colors hover:border-accent hover:text-accent">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-dark-muted">
            {tf("explore")}
          </p>
          <ul className="mt-5 space-y-3 text-sm font-light text-dark-text/80">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-dark-muted">
            {tf("contact")}
          </p>
          <ul className="mt-5 space-y-3 text-sm font-light text-dark-text/80">
            <li>{tf("hotlineZalo")}</li>
            <li>
              <a
                href={getPhoneLink()}
                className="transition-colors hover:text-accent">
                {siteConfig.contact.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="transition-colors hover:text-accent">
                {siteConfig.contact.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-dark-muted">
            {tf("locations")}
          </p>
          <ul className="mt-5 space-y-4 text-sm font-light leading-6 text-dark-text/80">
            <li>
              <span className="block text-dark-muted">{tf("haNoiOffice")}</span>
              No.22 Phat Loc St, Hoan Kiem, Ha Noi
            </li>
            <li>
              <span className="block text-dark-muted">Ha Giang — Hostel 1</span>
              {tf("haGiangHostel1")}
            </li>
            <li>
              <span className="block text-dark-muted">Ha Giang — Hostel 2</span>
              {tf("haGiangHostel2")}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-dark-text/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs uppercase tracking-[0.18em] text-dark-muted sm:flex-row sm:px-6 lg:px-8">
          <span>
            © {new Date().getFullYear()} {siteConfig.brand.fullName}
          </span>
          <span className="font-light normal-case tracking-normal">
            CÔNG TY TNHH JASMINE HÀ GIANG
          </span>
        </div>
      </div>
    </footer>
  );
}
