import Image from "next/image";

import { Container } from "@/components/container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/section-header";
import { services } from "@/lib/data/tours";

export function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-24 bg-surface py-24 lg:py-32">
      <Container>
        <SectionHeader
          eyebrow="Fleet & services"
          title={
            <>
              Every bike you need,{" "}
              <span className="accent-word">ready</span> to ride
            </>
          }
          description="Semi-automatic bikes for beginners, manual gearboxes for the confident, and open-top Jeeps for those who'd rather watch the road go by."
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
            The scooter or automatic bike is not suitable for mountain roads with
            lots of up-and-down. We offer a short training session with the
            semi-automatic — easy to learn, and you&rsquo;ll be a pro by the
            first pass.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
