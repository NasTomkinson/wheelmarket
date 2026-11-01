import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { getStrapiMediaUrl } from "@/utils/helpers";
import { getListingsForUser, type Listing } from "@/utils/strapi/listings";
import { authOptions } from "@/utils/auth/options";

export const dynamic = "force-dynamic";

const priceFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const conditionLabels: Record<string, string> = {
  new: "New",
  used: "Used",
  refurbished: "Refurbished",
  damaged: "Damaged / for repair",
};

function ListingCard({ listing }: { listing: Listing }) {
  const image = listing.images?.[0];
  const specifications = listing.wheelSpecifications;
  const pcd = specifications?.pcd_bolt_pattern;

  return (
    <article className="overflow-hidden rounded-xl border border-neutral bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] bg-neutral-light">
        {image ? (
          <Image
            src={getStrapiMediaUrl(image.url)}
            alt={image.alternativeText || listing.title}
            fill
            unoptimized
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-neutral-dark/50">
            No image available
          </div>
        )}

        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ${
            listing.publishedAt ? "bg-emerald-600 text-white" : "bg-amber-100 text-amber-900"
          }`}
        >
          {listing.publishedAt ? "Live" : "Draft"}
        </span>
        {listing.images && listing.images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">
            {listing.images.length} photos
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {listing.brand?.name || "Wheel listing"}
            </p>
            <h2 className="mt-1 line-clamp-2 text-xl! text-neutral-dark">{listing.title}</h2>
          </div>
          <p className="shrink-0 text-lg font-bold text-neutral-dark">{priceFormatter.format(listing.price)}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-y border-neutral-light py-3 text-sm">
          <div>
            <span className="block text-xs text-neutral-dark/55">Condition</span>
            <span className="font-semibold text-neutral-dark">{conditionLabels[listing.condition] || listing.condition}</span>
          </div>
          <div>
            <span className="block text-xs text-neutral-dark/55">Wheels</span>
            <span className="font-semibold text-neutral-dark">{listing.quantity} × {specifications?.diameter ? `${specifications.diameter}″` : listing.wheelModel}</span>
          </div>
          <div>
            <span className="block text-xs text-neutral-dark/55">Width / offset</span>
            <span className="font-semibold text-neutral-dark">
              {specifications ? `${specifications.width}J · ET${specifications.offset}` : "Not specified"}
            </span>
          </div>
          <div>
            <span className="block text-xs text-neutral-dark/55">PCD</span>
            <span className="font-semibold text-neutral-dark">{pcd ? `${pcd.bolts} × ${pcd.spacing}` : "Not specified"}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-neutral-dark/60">
          <span>{listing.tyresIncluded ? "Tyres included" : "Wheels only"}</span>
          <time dateTime={listing.createdAt}>Listed {dateFormatter.format(new Date(listing.createdAt))}</time>
        </div>
      </div>
    </article>
  );
}

export default async function Listings() {
  const session = await getServerSession(authOptions);
  let listings: Listing[] = [];
  let loadFailed = false;

  try {
    if (!session?.user?.id) throw new Error("Authenticated user ID is missing.");
    listings = await getListingsForUser(session.user.id);
  } catch (error) {
    loadFailed = true;
    console.error("Unable to render listings", error);
  }

  return (
    <div className="pb-12">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-bold uppercase tracking-widest text-primary">Your garage</p>
          <h1 className="text-3xl font-bold text-neutral-dark sm:text-4xl">Listings</h1>
          <p className="mt-2 text-neutral-dark/70">
            {listings.length > 0
              ? `${listings.length} ${listings.length === 1 ? "listing" : "listings"} available`
              : "Manage the wheels you have listed for sale."}
          </p>
        </div>
        <Link className="btn btn-primary shrink-0" href="/account/listings/new">Create new listing</Link>
      </div>

      {loadFailed ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-800" role="alert">
          <h2 className="text-xl!">Unable to load listings</h2>
          <p className="mt-1">Please refresh the page and try again.</p>
        </div>
      ) : listings.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => <ListingCard key={listing.documentId} listing={listing} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-neutral bg-white p-8 text-center shadow-sm">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary-light text-2xl" aria-hidden="true">＋</div>
          <h2 className="text-xl!">You currently have no listings</h2>
          <p className="mt-2 max-w-md text-neutral-dark/70">Create your first listing to start advertising your wheels.</p>
          <Link className="btn btn-primary mt-6" href="/account/listings/new">Sell my wheels</Link>
        </div>
      )}
    </div>
  );
}
