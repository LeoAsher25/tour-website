import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/container";
import { SectionHeader } from "@/components/section-header";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

export async function GallerySection() {
  const t = await getTranslations("home.gallery");

  const gallery = [
    {
      src: "/images/gallery/layer-20_1678645520.png.webp",
      alt: t("alts.pass"),
      className: "md:col-span-2 md:row-span-2",
    },
    {
      src: "/images/gallery/layer-7631_1678682722.jpg.webp",
      alt: t("alts.village"),
      className: "",
    },
    {
      src: "/images/gallery/unnamed_1763885473.jpg.webp",
      alt: t("alts.golden"),
      className: "",
    },
    {
      src: "/images/gallery/doc-tham-ma-2_1678682709.png.webp",
      alt: t("alts.thamMa"),
      className: "md:row-span-2",
    },
    {
      src: "/images/gallery/460983428_1085247160276912_7741909890966607091_n_1763890090.jpg.webp",
      alt: t("alts.travellers"),
      className: "",
    },
    {
      src: "/images/gallery/layer-151_1678682754.png.webp",
      alt: t("alts.sunset"),
      className: "md:col-span-2",
    },
  ];

  return (
    <section id="gallery" className="scroll-mt-24 bg-surface py-24 lg:py-32">
      <Container>
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("title1")} <span className="accent-word">{t("titleAccent")}</span>
            </>
          }
          description={t("description")}
          align="center"
        />

        <Stagger
          gap={0.1}
          className="mt-14 grid auto-rows-[200px] grid-cols-1 gap-4 sm:grid-cols-2 md:auto-rows-[220px] md:grid-cols-4">
          {gallery.map((item) => (
            <StaggerItem key={item.src} className={item.className} scale>
              <div className="group relative h-full w-full cursor-pointer overflow-hidden rounded-2xl border border-border">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/70 via-dark-bg/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="absolute bottom-0 left-0 right-0 translate-y-3 p-4 text-sm font-light text-dark-text opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {item.alt}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
