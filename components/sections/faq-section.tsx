"use client";

import { Accordion } from "@base-ui/react/accordion";
import { MessageCircle, Plus } from "lucide-react";

import { Container } from "@/components/container";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/section-header";
import { getZaloLink, siteConfig } from "@/src/config/site";

const faqs = [
  {
    q: "I am a solo traveler — can I join the group?",
    a: "Absolutely. These are individual, couple, or group tours based on your preference. Even as a solo traveler you receive the full tour experience. We also have group tours running every day with around 10 people.",
  },
  {
    q: "Can I bring my suitcase or big backpack?",
    a: `As we travel on motorbikes, storage is limited — small backpacks and easy-to-carry bags are recommended. You can leave big backpacks at ${siteConfig.brand.shortName} Hostel with free storage and CCTV 24/7.`,
  },
  {
    q: "Do you have scooter / automatic bikes?",
    a: "The scooter or automatic bike is not suitable for mountain roads with lots of up-and-down. You need gears to slow safely on the descents. We offer a short training session with the semi-automatic — it's easy to learn and you'll be a professional after our training.",
  },
  {
    q: "Can I ride a motorbike without a licence?",
    a: "For self-riding you need an International Driving Permit 1968 (stamp A or A1) plus your national licence (stamp A or A1). Need help? Choose the Easy Rider option and ride pillion behind an expert guide — no licence needed.",
  },
  {
    q: "Can I make the payment by card?",
    a: "Yes! We accept payment by cash and card when you pay at our office, or you can make the payment through the website (card payment fee 4% applies online).",
  },
  {
    q: `Does ${siteConfig.brand.shortName} have an office in Hanoi?`,
    a: `Yes! ${siteConfig.brand.shortName}'s office is at No.22 Phat Loc Street, Hoan Kiem, Hanoi. In Ha Giang we have two hostels: No.134C Ly Tu Trong Street (Minh Khai) and ${siteConfig.brand.shortName} Hostel 2 at Hoa Bac / Km11, Vi Xuyen.`,
  },
];

export function FaqSection() {
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              eyebrow="FAQ"
              title={
                <>
                  Questions, <span className="accent-word">answered</span>
                </>
              }
              description="Everything travellers usually ask before riding the loop."
            />
            <Reveal delay={0.2}>
              <a
                href={getZaloLink()}
                target="_blank"
                rel="noreferrer"
                className="group mt-8 inline-flex items-center gap-3 text-sm font-medium text-accent transition-colors hover:text-accent-hover">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/30 bg-accent-tint transition-all duration-300 group-hover:translate-x-1 group-hover:bg-accent group-hover:text-accent-foreground">
                  <MessageCircle className="h-5 w-5" />
                </span>
                Still curious? Message us on Zalo
              </a>
            </Reveal>
          </div>

          <Reveal>
            <Accordion.Root
              className="divide-y divide-border rounded-[1.75rem] border border-border bg-card shadow-sm"
              defaultValue={["faq-0"]}>
              {faqs.map((faq, i) => (
                <Accordion.Item key={i} value={`faq-${i}`}>
                  <Accordion.Header>
                    <Accordion.Trigger
                      className="group flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-6 text-left outline-none sm:px-8"
                      aria-label={faq.q}>
                      <span className="font-serif text-lg text-foreground transition-colors group-hover:text-accent sm:text-xl">
                        {faq.q}
                      </span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background transition-all duration-300 group-data-[panel-open]:rotate-45 group-data-[panel-open]:border-accent group-data-[panel-open]:bg-accent group-data-[panel-open]:text-accent-foreground">
                        <Plus className="h-4 w-4 text-accent transition-colors group-data-[panel-open]:text-accent-foreground" />
                      </span>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Panel
                    render={
                      <div className="px-6 pb-6 sm:px-8">
                        <p className="max-w-2xl text-sm font-light leading-7 text-muted-foreground">
                          {faq.a}
                        </p>
                      </div>
                    }
                  />
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
