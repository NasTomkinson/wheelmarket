import { getActiveListings } from "@/utils/strapi/listings";

export async function GET() {
  try {
    const listings = await getActiveListings();

    return Response.json({ data: listings }, { status: 200 });
  } catch (error) {
    console.error("Unable to load active listings", error);

    return Response.json(
      { message: "We could not load the listings. Please try again." },
      { status: 502 },
    );
  }
}
