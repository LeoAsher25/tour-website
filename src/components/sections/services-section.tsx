import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/section-header";

export async function ServicesSection() {
  const t = await getTranslations("home.services");

  const services = [
    { title: t("items.honda.title"), image: "/images/services/2023/03/16/large/honda-wave-110cc-new_1678933906.png.webp", text: t("items.honda.text") },
    { title: t("items.suzuki.title"), image: "/images/services/2023/03/16/large/suzuki-hj125-2019_1678934001.jpg.webp", text: t("items.suzuki.text") },
    { title: t("items.xr.title"), image: "/images/services/2024/10/22/large/xr150_1729593790.png.webp", text: t("items.xr.text") },
    { title: t("items.jeep.title"), image: "/images/services/2025/11/23/large/unnamed_1763884958.jpg.webp", text: t("items.jeep.text") },
  ];

  return (
    <section id="services" className="scroll-mt-24 bg-surface py-24 lg:py-32">
      <Container>
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("title1")}{" "}
              <span className="accent-word">{t("titleAccent")}</span>{" "}
              {t("title2")}
            </>
          }
          description={t("description")}
          align="center"
        />

        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <StaggerItem key={service.title} scale>
              <article className="group h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg">
                <div className="relative h-52 overflow-hidden bg-surface">
                  <div className="absolute right-4 top-4 z-10 font-serif text-sm text-muted-foreground/60">
                    0{i + 1}
                  </div>
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-1"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl text-foreground transition-colors group-hover:text-accent">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm font-light leading-6 text-muted-foreground">
                    {service.text}
                  </p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-12 max-w-2xl text-center text-sm font-light leading-7 text-muted-foreground">
            {t("note")}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
