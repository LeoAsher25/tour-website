import { getHomepageTours } from "@/lib/repository";
import { BookingSection } from "./booking-section";

/** Server wrapper — fetches tours from Postgres and passes to client section. */
export async function BookingSectionServer({
  locale = "en",
}: {
  locale?: string;
} = {}) {
  const data = await getHomepageTours(locale);
  return <BookingSection data={data} />;
}
