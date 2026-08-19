import { siteConfig } from "@/config/site";
import type { BlogPost } from "@/types/domain";
import { markdownToTiptap } from "./tiptap";

const withContentJson = (posts: Omit<BlogPost, "contentJson">[]): BlogPost[] =>
  posts.map((p) => ({ ...p, contentJson: markdownToTiptap(p.content) }));

/**
 * Seed blog content used by `npm run db:seed` to populate Supabase.
 * Public site reads published posts from Postgres — this is the seed source.
 */
export const mockBlogPosts: BlogPost[] = withContentJson([
  {
    slug: "when-to-ride-the-ha-giang-loop",
    title: "When to Ride the Ha Giang Loop",
    excerpt:
      "Every season paints the highlands differently. Here's how to choose the window that matches the trip you want — from golden rice terraces to pink buckwheat hills.",
    content: `The Ha Giang Loop changes character month to month, and there is no bad time to ride it — only different moods.

## The golden season — September to October

September and October bring the rice harvest. Terraces glow amber across Hoang Su Phi and the valleys around Quan Ba, and farmers work the fields as you pass. Mornings are crisp, afternoons warm, and the light is worth waking early for.

## Buckwheat flower season — November

From November the hills of Dong Van and Meo Vac bloom with soft pink buckwheat flowers. It is the most photographed season in the province, and it's easy to see why — whole slopes turn the colour of cherry blossom.

## Clear winter — December to February

Winter is crisp and clear with the fewest crowds. Passes can be cold at dawn, so pack layers. In exchange you get visibility across the karst plateau and empty roads.

## Spring green — March to May

Green returns by March as the valleys wake up. This is a lovely shoulder season: warm days, dramatic clouds, and fewer travellers than autumn.

## Summer — June to August

Summer is lush and vibrant but brings afternoon rain. Roads stay open, the waterfalls run full, and the landscape is at its most jungle-like.

Whatever the month, mornings on Ma Pi Leng reward the early riser. Pack layers, ride slow, and let the season you choose become part of the story.`,
    coverImage: "/images/tours/layer-5301_1680436329.png.webp",
    author: siteConfig.brand.businessName,
    tags: ["planning", "seasons"],
    featured: true,
    status: "published",
    publishedAt: "2026-07-01",
    createdAt: "2026-06-20",
    updatedAt: "2026-07-01",
    readingMinutes: 6,
  },
  {
    slug: "meeting-the-communities-of-lo-lo-chai",
    title: "Meeting the Communities of Lo Lo Chai",
    excerpt:
      "A stone village at the foot of the flag tower, and the people who make it unforgettable. A slow guide to the northernmost village in Vietnam.",
    content: `Tucked beneath Lung Cu flag tower, Lo Lo Chai is a village of earthen-walled homes, cobbled lanes and warm hosts. It is the northernmost village in Vietnam, and it holds the Loop's quietest overnight stop.

## A village that keeps its own time

Lo Lo Chai belongs to the Lo Lo ethnic group, one of Vietnam's smallest. Homes are built low against the wind, with thick earth walls and slate roofs. The village is tidy and still — motorbikes are parked at the edge, and life happens in courtyards.

## Staying overnight

Staying here means shared dinners around a low table, home-brewed corn wine, and stories passed between generations. Your host might show you how the family weaves, or walk you to the flag tower before sunrise.

## Travel slowly enough

The highlands stop being scenery and become people the moment you slow down. Sit where you are offered a seat. Accept the tea. Learn one or two phrases of the local greeting — it changes the whole conversation.

Lo Lo Chai asks for little and returns a lot. Ride in quietly, and leave quietly.`,
    coverImage: "/images/intro/doc-tham-ma-dong-van-ha-giang1_1680112915.png.webp",
    author: siteConfig.brand.businessName,
    tags: ["culture", "villages"],
    featured: true,
    status: "published",
    publishedAt: "2026-06-18",
    createdAt: "2026-06-05",
    updatedAt: "2026-06-18",
    readingMinutes: 5,
  },
  {
    slug: "ma-pi-leng-the-most-spectacular-pass-in-vietnam",
    title: "Ma Pi Leng — The Most Spectacular Pass in Vietnam",
    excerpt:
      "Twenty kilometres of switchbacks carved into cliff, with the Nho Que River far below. Everything you need to know before you ride the pass.",
    content: `Ma Pi Leng is the crown of the Ha Giang Loop — a 20-kilometre stretch of switchbacks carved into the mountainside, with the emerald Nho Que River threading through the gorge hundreds of metres below.

## Why it stops everyone

The road clings to the cliff with hairpin after hairpin, and every bend opens a view that makes riders pull over. At the top, the Sky Walk viewpoint gives you the full sweep of the gorge. Below, a boat tour on the Nho Que takes you between the towering walls of Tu San Canyon.

## Riding it well

Go early. By 8am the viewpoints are quiet and the light is soft. Ride at your own pace — the group will wait at each stop. Keep your eyes on the road more than the view while moving; there is plenty of time to look once you stop.

## The viewpoint names you'll hear

- **Ma Pi Leng Pass** — the famous viewpoint at the top of the pass
- **Sky Walk** — a short cliff path with glass-floor sections
- **Tu San Canyon** — the deepest canyon in Southeast Asia, best seen from the river
- **Nho Que Boat Tour** — a must-do in the dry season

Ma Pi Leng rewards the rider who respects it. Take the photos, but leave some time to just stand there and let the scale sink in.`,
    coverImage: "/images/tours/layer-5301_1680436422.png.webp",
    author: siteConfig.brand.businessName,
    tags: ["passes", "viewpoints"],
    featured: false,
    status: "published",
    publishedAt: "2026-05-30",
    createdAt: "2026-05-15",
    updatedAt: "2026-05-30",
    readingMinutes: 7,
  },
  {
    slug: "du-gia-the-fairy-village",
    title: "Du Gia — The Fairy Village",
    excerpt:
      "A peaceful valley of waterfalls and rice terraces, and the perfect place to end the Loop. What makes Du Gia worth the detour.",
    content: `Many riders ask what Du Gia has to offer. The honest answer: not much — and that is exactly the point.

## A village that asks you to slow down

Du Gia sits in a green valley where a three-tier waterfall pours into swimming pools edged by rice terraces. There are no crowds, no ticket booths, no shops worth lingering in. There is just the sound of water, the work of the fields, and the best homestay dinner on the Loop.

## Swimming below the waterfall

After two days of switchbacks, the waterfall is a ritual. Walk the short path up, swim in the cold green pools, and dry off on warm rocks while the valley does its thing around you.

## Why travellers remember it

We recommend Du Gia to everyone because it offers a peaceful respite from busy schedules and lives. Being immersed in the rocky mountain landscape helps you forget normal worries. The morning fog, the rooster calls, the family dinner — these are the memories people keep.

Come for the waterfall. Stay for the stillness. Leave with the Loop's best souvenir: a quiet mind.`,
    coverImage: "/images/tours/doc-tham-ma-2_1678897612.png.webp",
    author: siteConfig.brand.businessName,
    tags: ["villages", "waterfalls"],
    featured: false,
    status: "published",
    publishedAt: "2026-05-12",
    createdAt: "2026-04-28",
    updatedAt: "2026-05-12",
    readingMinutes: 5,
  },
  {
    slug: "easy-rider-or-self-riding",
    title: "Easy Rider or Self-Riding? Choosing Your Loop Experience",
    excerpt:
      "The Ha Giang Loop works two ways: ride your own bike, or ride pillion behind an expert guide. Here's how to choose.",
    content: `Every ${siteConfig.brand.businessName} tour offers both ways to experience the Loop. Neither is better — they are simply different trips.

## Self-riding

You ride your own semi-automatic motorbike, following the guide in a small group. This is the classic Loop experience: complete control, wind in your face, and the deep satisfaction of earning every viewpoint with your own hands.

**Best for:** confident riders, people with a motorcycle licence (International Driving Permit 1968, A or A1), and anyone who already loves two wheels.

## Easy rider

You ride pillion behind an experienced driver-guide. You watch everything, take the photos, and leave the hairpins to someone who knows them by heart. Plenty of couples do this — one rides, one rides pillion.

**Best for:** non-riders, travellers without a licence, and anyone who wants to simply soak in the scenery without concentrating on the road.

## The practical difference

Both options include the same homestays, meals, and itinerary. The easy rider price is slightly higher because a second person — your guide-driver — is with you. For two people sharing one bike, we upgrade the motorbike for free.

Still unsure? Message us. We'll help you pick the right option for your experience and confidence.`,
    coverImage: "/images/tours/6672482d11919ccfc580_1761915521.jpg.webp",
    author: siteConfig.brand.businessName,
    tags: ["planning", "riding"],
    featured: false,
    status: "published",
    publishedAt: "2026-04-20",
    createdAt: "2026-04-05",
    updatedAt: "2026-04-20",
    readingMinutes: 6,
  },
  {
    slug: "packing-for-the-ha-giang-loop",
    title: "What to Pack for the Ha Giang Loop",
    excerpt:
      "Motorbikes mean limited storage. Here's the honest packing list we give every traveller before they ride.",
    content: `Motorbike storage is limited, and Ha Giang's weather changes fast. Pack light, pack smart, and leave the suitcase at home.

## The essentials

- **Small backpack** — easy-to-carry bags are recommended; leave large suitcases at our Ha Giang hostel (free storage with CCTV 24/7)
- **Rain gear** — we provide it, but a light packable layer is gold
- **Warm layer** — mornings on the passes are cold even in summer
- **Sun protection** — sunscreen, sunglasses, a buff for the dust
- **Water** — we supply bottles, but refill often

## What to leave behind

Heavy jeans, big suitcases, expensive electronics you'd worry about. Everything you need is available along the way: pho, coffee, sim cards, and the occasional village shop.

## The comfort rule

You will be on the bike 4–6 hours a day. A well-fitted helmet (we provide), comfortable clothes, and a small dry bag make the difference between a good day and a great one.

Pack for the person you are when the sun comes out, and the person you become when the clouds roll in over Ma Pi Leng.`,
    coverImage: "/images/tours/271604766_323761536313102_3033792690503952637_n-20220113124825_1680436050.jpg.webp",
    author: siteConfig.brand.businessName,
    tags: ["planning", "packing"],
    featured: false,
    status: "published",
    publishedAt: "2026-03-25",
    createdAt: "2026-03-10",
    updatedAt: "2026-03-25",
    readingMinutes: 4,
  },
]);
