import type {
  AddOn,
  HomepageTour,
  HomepageTourSectionData,
  ItineraryDay,
  Tour,
  TourVariant,
} from "@/types/domain";

/**
 * Static translation layer for database content (tours, variants, add-ons,
 * itineraries). The DB stores English copy; this module maps it to Vietnamese
 * for the /vi locale at the render boundary.
 *
 * Lookups are keyed by stable identifiers (tour slug + day number + variant
 * id) rather than by English string matching, so admin edits to the English
 * text don't silently break translations — missing keys fall back to the
 * English source.
 *
 * Booking snapshots (tour_title, variant_name, add-on names frozen at booking
 * time) are intentionally NOT translated — they are immutable history.
 */

type StrDict = Record<string, string>;

/** A single itinerary stop translation. */
export interface StopVi {
  title?: string;
  description?: string;
}

/** Vietnamese translation of a Tour (fields that can be translated). */
export interface TourViContent {
  title?: string;
  subtitle?: string;
  description?: string;
  overview?: string;
  suitableFor?: string;
  startLocation?: string;
  endLocation?: string;
  highlights?: StrDict;
  included?: StrDict;
  excluded?: StrDict;
  accommodation?: string;
  transportation?: string;
  meals?: string;
  warnings?: StrDict;
  itinerary?: Record<number, { title?: string; summary?: string; stops?: Record<string, StopVi> }>;
  variants?: Record<string, { name?: string; description?: string }>;
  addOns?: Record<string, { name?: string; description?: string }>;
}

const tourViContent: Record<string, TourViContent> = {
  "ha-giang-loop-3d2n": {
    title: "Tour Xe Máy 3 Ngày 2 Đêm",
    subtitle: "Cung đường Hà Giang Loop kinh điển",
    description:
      "Cung đường huyền thoại: đèo Mã Pì Lèng, cao nguyên đá Đồng Văn và đêm homestay cùng gia đình người H'mông.",
    overview:
      "Ba ngày, hai đêm và con đường ngoạn mục nhất Việt Nam. Chinh phục những con đèo huyền thoại, ngủ tại homestay địa phương và đuổi theo khung cảnh đã làm nên tên tuổi Hà Giang.",
    suitableFor: "Độ tuổi 18 – 35 · Không phù hợp với người sợ độ cao",
    startLocation: "Hà Giang",
    endLocation: "Hà Giang",
    highlights: {
      "0": "Mã Pì Lèng — con đèo ấn tượng nhất Việt Nam",
      "1": "Cao nguyên đá Đồng Văn — Công viên địa chất UNESCO",
      "2": "Homestay cùng gia đình người H'mông",
      "3": "Tour thuyền sông Nho Quế",
      "4": "Cột cờ Lũng Cú tại biên giới",
      "5": "Nhóm nhỏ, tối đa 12 tay lái",
    },
    included: {
      "0": "2 đêm homestay (phòng dorm)",
      "1": "3 bữa sáng, 3 bữa trưa, 2 bữa tối",
      "2": "Xe bán tự động đời mới",
      "3": "Nhóm nhỏ đi theo hướng dẫn viên",
      "4": "Vé tham quan, thuyền Nho Quế, xăng",
      "5": "Bảo hiểm hư hỏng xe máy",
      "6": "Giường dorm miễn phí tại Hà Giang đêm trước ngày khởi hành",
    },
    excluded: {
      "0": "Nâng cấp phòng riêng (+400.000 VND/2 người/đêm)",
      "1": "Bảo hiểm du lịch",
      "2": "Đồ uống & chi phí cá nhân",
    },
    accommodation:
      "2 đêm tại homestay địa phương cùng các gia đình bản xứ. Phòng dorm với chăn ga sạch sẽ.",
    transportation: "Bao gồm xe máy Honda 110cc bán tự động.",
    meals: "Tất cả bữa ăn được bao gồm: 3 bữa sáng, 3 bữa trưa, 2 bữa tối.",
    itinerary: {
      1: {
        title: "Hà Giang — Yên Minh (95km)",
        summary:
          "Gặp mặt và bàn giao xe, sau đó chạy qua Cổng Trời Quản Bạ và Núi Đôi đến Yên Minh.",
        stops: {
          "0": { title: "Gặp mặt & bàn giao xe", description: "Gặp tại Hostel Jasmine, nhận xe, mũ bảo hiểm và hướng dẫn hành trình." },
          "1": { title: "Quản Bạ — Cổng Trời", description: "Điểm ngắm cảnh đầu tiên nhìn xuống thung lũng Quản Bạ và hai đỉnh núi hình nón." },
          "2": { title: "Nhận phòng homestay & tiệc chào mừng", description: "Ngủ tại bản người H'mông. Bữa tối chào mừng lớn." },
        },
      },
      2: {
        title: "Yên Minh — Mèo Vạc (120km)",
        summary: "Vương miện của cung đường: Lũng Cú, phố cổ Đồng Văn và đèo Mã Pì Lèng huyền thoại.",
        stops: {
          "0": { title: "Cột cờ Lũng Cú", description: "Cực Bắc của Việt Nam, tại biên giới Trung Quốc." },
          "1": { title: "Phố cổ Đồng Văn", description: "Dạo bước thị trấn cổ trên cao nguyên đá." },
          "2": { title: "Đèo Mã Pì Lèng", description: "Cung đường hùng vĩ nhất hành trình — dành thời gian hòa mình với thiên nhiên trên đỉnh đèo." },
          "3": { title: "Homestay Mèo Vạc", description: "Nhận phòng, tiệc chào mừng và nghỉ ngơi cho ngày mai." },
        },
      },
      3: {
        title: "Mèo Vạc — Hà Giang (160km)",
        summary: "Thác Du Già, cảnh sắc làng tiên và hành trình trở về Hà Giang trước 4 giờ chiều.",
        stops: {
          "0": { title: "Thác Du Già", description: "Ngôi làng tiên với cảnh sắc mộng mơ." },
          "1": { title: "Trở về Hà Giang", description: "Tour kết thúc lúc 4 giờ chiều. Bắt xe giường nằm lúc 9 giờ tối về Hà Nội." },
        },
      },
    },
    variants: {
      "v1-self": { name: "Tự lái", description: "Không bao gồm vé xe" },
      "v1-easy": { name: "Easy Rider", description: "Không bao gồm vé xe" },
      "v1-self-bus": { name: "Tự lái + xe 2 chiều", description: "Gói bao gồm xe khứ hồi Hà Nội" },
    },
    addOns: {
      "a1-private": { name: "Nâng cấp phòng riêng", description: "2 đêm, cho 2 người" },
    },
  },
  "ha-giang-loop-4d3n": {
    title: "Tour Xe Máy 4 Ngày 3 Đêm",
    subtitle: "Cung đường mở rộng",
    description:
      "Bốn ngày xuyên cao nguyên — thêm thời gian cho Du Già, dừng chụp ảnh lâu hơn và nhịp điệu sâu hơn.",
    overview:
      "Một ngày thêm biến cung đường thành một hành trình trọn vẹn: làng tiên Du Già, trọn buổi sáng tại Mã Pì Lèng và những buổi chiều chậm rãi giữa các bản làng.",
    suitableFor: "Độ tuổi 18 – 35",
    startLocation: "Hà Giang",
    endLocation: "Hà Giang",
    highlights: {
      "0": "Qua đêm tại Du Già — làng tiên",
      "1": "Trọn ngày tại Mã Pì Lèng & Nho Quế",
      "2": "Homestay bản Lô Lô Chải",
      "3": "Giao lưu văn hóa bản làng lâu hơn",
      "4": "Nhóm nhỏ, tối đa 12 tay lái",
    },
    included: {
      "0": "3 đêm homestay (phòng dorm)",
      "1": "4 bữa sáng, 4 bữa trưa, 3 bữa tối",
      "2": "Xe bán tự động đời mới",
      "3": "Vé tham quan, thuyền Nho Quế, xăng",
      "4": "Bảo hiểm hư hỏng xe máy",
      "5": "Giường dorm miễn phí tại Hà Giang đêm trước ngày khởi hành",
    },
    excluded: {
      "0": "Nâng cấp phòng riêng (+400.000 VND/2 người/đêm)",
      "1": "Bảo hiểm du lịch",
      "2": "Đồ uống & chi phí cá nhân",
    },
    accommodation: "3 đêm tại homestay địa phương, bao gồm làng tiên Du Già.",
    transportation: "Bao gồm xe máy Honda 110cc bán tự động.",
    meals: "Tất cả bữa ăn được bao gồm: 4 bữa sáng, 4 bữa trưa, 3 bữa tối.",
    itinerary: {
      1: { title: "Hà Giang — Yên Minh (95km)", summary: "Gặp mặt, Cổng Trời Quản Bạ, qua đêm tại Yên Minh." },
      2: { title: "Yên Minh — Mèo Vạc (120km)", summary: "Lũng Cú, Đồng Văn, Mã Pì Lèng, qua đêm tại Mèo Vạc." },
      3: { title: "Mèo Vạc — Du Già (85km)", summary: "Làng tiên. Thác nước, ruộng bậc thang, buổi tối yên bình." },
      4: { title: "Du Già — Hà Giang (108km)", summary: "Trở về qua Quản Bạ, đến Hà Giang trước 4 giờ chiều." },
    },
    variants: {
      "v2-self": { name: "Tự lái", description: "Không bao gồm vé xe" },
      "v2-easy": { name: "Easy Rider", description: "Không bao gồm vé xe" },
      "v2-self-bus": { name: "Tự lái + xe 2 chiều", description: "Gói bao gồm xe khứ hồi Hà Nội" },
    },
    addOns: {
      "a2-private": { name: "Nâng cấp phòng riêng", description: "3 đêm, cho 2 người" },
    },
  },
  "cao-bang-loop-3d2n": {
    title: "Tour Cao Bằng 3N2Đ",
    subtitle: "Dành cho những nhà thám hiểm thực thụ",
    description:
      "Chán những cung đường du lịch quen thuộc? Hãy đến thác Bản Giốc, hang Pắc Bó và vùng biên giới hoang sơ.",
    overview:
      "Cung đường Cao Bằng dành cho những nhà thám hiểm thực thụ tìm đến miền Bắc hoang sơ chưa bị khai thác của Việt Nam — thác Bản Giốc, tour thuyền và những con đường vắng vẻ.",
    suitableFor: "Mọi đối tượng",
    startLocation: "Hà Giang hoặc Cao Bằng",
    endLocation: "Hà Giang hoặc Cao Bằng",
    highlights: {
      "0": "Thác Bản Giốc — bao gồm tour thuyền",
      "1": "Hang Pắc Bó, nơi Bác Hồ trở về",
      "2": "Động Ngườm Ngao",
      "3": "Có thể khởi hành từ Hà Giang hoặc Cao Bằng",
      "4": "Đường biên giới hoang sơ",
    },
    included: {
      "0": "2 đêm homestay (phòng dorm)",
      "1": "3 bữa sáng, 3 bữa trưa, 2 bữa tối",
      "2": "Xe bán tự động + xăng",
      "3": "Vé thuyền thác Bản Giốc",
      "4": "Vé tham quan Pắc Bó",
      "5": "Bảo hiểm hư hỏng xe máy",
    },
    excluded: { "0": "Bảo hiểm du lịch", "1": "Phòng riêng", "2": "Đồ uống" },
    accommodation: "2 đêm tại homestay địa phương.",
    transportation: "Bao gồm xe máy bán tự động.",
    meals: "Bao gồm 3 bữa sáng, 3 bữa trưa, 2 bữa tối.",
    itinerary: {
      1: { title: "Hà Giang — Cao Bằng", summary: "Chạy đường biên giới về phía Cao Bằng." },
      2: { title: "Thác Bản Giốc", summary: "Tour thuyền, hang động và thác nước biên giới." },
      3: { title: "Trở về", summary: "Chạy về qua hang Pắc Bó." },
    },
    variants: {
      "v3-self": { name: "Tự lái", description: "Không xe" },
      "v3-easy": { name: "Easy Rider", description: "Không xe" },
    },
  },
  "jeep-wrangler-tour": {
    title: "Tour Jeep Wrangler",
    subtitle: "Đi cùng hướng dẫn viên địa phương trên chiếc Jeep huyền thoại",
    description:
      "Chinh phục cung đường trên chiếc Jeep Wrangler mui trần — cách kinh điển để ngắm Hà Giang mà không cần xe máy.",
    overview:
      "Không cần bằng lái, không cần xe — chỉ cần lên xe. Tài xế hướng dẫn viên địa phương của chúng tôi sẽ đưa bạn qua cung đường trên chiếc Jeep Wrangler Sahara.",
    suitableFor: "Mọi đối tượng, không cần bằng lái",
    startLocation: "Hà Giang",
    endLocation: "Hà Giang",
    highlights: {
      "0": "1 xe Jeep Wrangler Sahara",
      "1": "2 đêm homestay phòng riêng",
      "2": "3 bữa sáng, 3 bữa trưa, 2 bữa tối",
      "3": "1 chai nước / ngày",
      "4": "Quà tặng miễn phí của Jeep Tour",
    },
    included: {
      "0": "Jeep Wrangler với tài xế hướng dẫn viên địa phương",
      "1": "2 đêm homestay phòng riêng",
      "2": "Tất cả bữa ăn (3S/3T/2C)",
      "3": "Xăng + vé tham quan",
      "4": "Ảnh & video của đội ngũ media",
    },
    excluded: {
      "0": "Bảo hiểm du lịch",
      "1": "Đồ uống",
      "2": "Bảo hiểm hư hỏng xe tùy chọn 1.000.000 VND/ngày",
    },
    accommodation: "2 đêm phòng riêng tại homestay đẹp.",
    transportation: "Jeep Wrangler Sahara với tài xế hướng dẫn viên.",
    meals: "Bao gồm 3 bữa sáng, 3 bữa trưa, 2 bữa tối.",
    itinerary: {
      1: { title: "Hà Giang — Yên Minh", summary: "Đi Jeep qua Quản Bạ đến Yên Minh." },
      2: { title: "Yên Minh — Mèo Vạc", summary: "Mã Pì Lèng và những con đèo cao." },
      3: { title: "Mèo Vạc — Hà Giang", summary: "Trở về qua Du Già." },
    },
    variants: {
      "v4-1pax": { name: "1 khách", description: "2 ngày 1 đêm + xe" },
      "v4-3d2n": { name: "1 khách", description: "3 ngày 2 đêm + xe" },
    },
  },
  "suv-hi-class-ha-giang-loop": {
    title: "Tour SUV Cao Cấp Hà Giang Loop",
    subtitle: "Khách sạn 5 sao, xe riêng",
    description:
      "Cung đường cao cấp: SUV riêng, khách sạn 5 sao hoặc 4 sao và lịch trình hoàn toàn linh hoạt.",
    overview:
      "Dành cho du khách muốn ngắm Hà Giang với tiện nghi khách sạn — một chiếc SUV riêng, tài xế riêng và những khách sạn được chọn lọc kỹ càng.",
    suitableFor: "Mọi đối tượng",
    startLocation: "Hà Giang",
    endLocation: "Hà Giang",
    highlights: {
      "0": "SUV riêng + tài xế hướng dẫn viên",
      "1": "Khách sạn 4 sao hoặc 5 sao",
      "2": "Lịch trình linh hoạt",
      "3": "Bao gồm xe khứ hồi từ Hà Nội",
    },
    included: {
      "0": "SUV riêng với tài xế hướng dẫn viên",
      "1": "Khách sạn (4 hoặc 5 sao)",
      "2": "Tất cả bữa ăn",
      "3": "Xe limousine khứ hồi Hà Nội",
    },
    excluded: { "0": "Bảo hiểm du lịch", "1": "Đồ uống" },
    accommodation: "3 đêm tại khách sạn 4 sao hoặc 5 sao.",
    transportation: "SUV riêng với tài xế hướng dẫn viên địa phương.",
    meals: "Tất cả bữa ăn được bao gồm.",
    itinerary: {
      1: { title: "Hà Nội — Hà Giang", summary: "Xe limousine, sau đó nhận phòng." },
      2: { title: "Quản Bạ — Đồng Văn", summary: "Cao nguyên bằng SUV." },
      3: { title: "Mã Pì Lèng", summary: "Con đèo, hẻm vực và khung cảnh." },
      4: { title: "Trở về Hà Nội", summary: "Lên xe limousine trở về." },
    },
    variants: {
      "v5-4star": { name: "Khách sạn 4 sao", description: "1 khách, 4N3Đ + xe" },
      "v5-5star": { name: "Khách sạn 5 sao", description: "1 khách, 4N3Đ + xe" },
    },
  },
};

function lookup(dict: StrDict | undefined, index: number): string | undefined {
  return dict?.[String(index)];
}

function lookupStop(
  dict: Record<string, StopVi> | undefined,
  index: number
): StopVi | undefined {
  return dict?.[String(index)];
}

function localizeItinerary(
  days: ItineraryDay[],
  vi: TourViContent
): ItineraryDay[] {
  const viDays = vi.itinerary;
  if (!viDays) return days;
  return days.map((day) => {
    const viDay = viDays[day.dayNumber];
    if (!viDay) return day;
    return {
      ...day,
      title: viDay.title ?? day.title,
      summary: viDay.summary ?? day.summary,
      stops: day.stops.map((stop, i) => {
        const viStop = lookupStop(viDay.stops, i);
        return {
          ...stop,
          title: viStop?.title ?? stop.title,
          description: viStop?.description ?? stop.description,
        };
      }),
    };
  });
}

function localizeVariants(
  variants: TourVariant[],
  vi: TourViContent
): TourVariant[] {
  const viVariants = vi.variants;
  if (!viVariants) return variants;
  return variants.map((v) => {
    const viV = viVariants[v.id];
    if (!viV) return v;
    return {
      ...v,
      name: viV.name ?? v.name,
      description: viV.description ?? v.description,
    };
  });
}

function localizeAddOns(addOns: AddOn[], vi: TourViContent): AddOn[] {
  const viAddOns = vi.addOns;
  if (!viAddOns) return addOns;
  return addOns.map((a) => {
    const viA = viAddOns[a.id];
    if (!viA) return a;
    return {
      ...a,
      name: viA.name ?? a.name,
      description: viA.description ?? a.description,
    };
  });
}

/** Localize a full Tour object for the given locale. */
export function localizeTour(tour: Tour, locale: string): Tour {
  if (locale !== "vi") return tour;
  const vi = tourViContent[tour.slug];
  if (!vi) return tour;

  return {
    ...tour,
    title: vi.title ?? tour.title,
    subtitle: vi.subtitle ?? tour.subtitle,
    description: vi.description ?? tour.description,
    overview: vi.overview ?? tour.overview,
    suitableFor: vi.suitableFor ?? tour.suitableFor,
    startLocation: vi.startLocation ?? tour.startLocation,
    endLocation: vi.endLocation ?? tour.endLocation,
    accommodation: vi.accommodation ?? tour.accommodation,
    transportation: vi.transportation ?? tour.transportation,
    meals: vi.meals ?? tour.meals,
    highlights: tour.highlights.map((h, i) => lookup(vi.highlights, i) ?? h),
    included: tour.included.map((item, i) => lookup(vi.included, i) ?? item),
    excluded: tour.excluded.map((item, i) => lookup(vi.excluded, i) ?? item),
    warnings:
      tour.warnings?.map((w, i) => lookup(vi.warnings, i) ?? w) ?? undefined,
    itinerary: localizeItinerary(tour.itinerary, vi),
    variants: localizeVariants(tour.variants, vi),
    addOns: localizeAddOns(tour.addOns, vi),
  };
}

/** Localize a homepage tour card. */
export function localizeHomepageTour(
  tour: HomepageTour,
  locale: string
): HomepageTour {
  if (locale !== "vi") return tour;
  const vi = tourViContent[tour.slug];
  if (!vi) return tour;
  return {
    ...tour,
    title: vi.title ?? tour.title,
    subtitle: vi.subtitle ?? tour.subtitle,
    description: vi.description ?? tour.description,
  };
}

/** Localize homepage tour section data (featured + booking variants/add-ons). */
export function localizeHomepageSection(
  data: HomepageTourSectionData,
  locale: string
): HomepageTourSectionData {
  if (locale !== "vi") return data;
  return {
    featured: data.featured.map((t) => localizeHomepageTour(t, locale)),
    booking: data.booking.map((t) => ({
      ...localizeHomepageTour(t, locale),
      variants: localizeVariants(t.variants, tourViContent[t.slug] ?? {}),
      addOns: localizeAddOns(t.addOns, tourViContent[t.slug] ?? {}),
    })),
  };
}
