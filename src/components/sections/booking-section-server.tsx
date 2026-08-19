import { getHomepageTours } from "@/lib/repository";
import { BookingSection } from "./booking-section";

/** Server wrapper — fetches tours from Postgres and passes to client section. */
export async function BookingSectionServer() {
  const data = await getHomepageTours();
  return <BookingSection data={data} />;
}
