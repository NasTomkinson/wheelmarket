import { S_CLIENT } from "./client";

export type ListingImage = {
  id: number;
  documentId: string;
  url: string;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
};

export type Listing = {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  title: string;
  description: string;
  condition: string;
  price: number;
  wheelModel: string;
  partNumber?: string | null;
  quantity: number;
  finish?: string | null;
  tyresIncluded: boolean;
  tyreType?: string | null;
  images?: ListingImage[];
  brand?: {
    id: number;
    documentId: string;
    name: string;
  } | null;
  seller?: {
    id: number;
    username: string;
  } | null;
  wheelSpecifications?: {
    id: number;
    diameter: number;
    width: number;
    offset: number;
    centreBore: number;
    construction: string;
    pcd_bolt_pattern?: {
      id: number;
      documentId: string;
      bolts: number;
      spacing: number;
    } | null;
  } | null;
};

const listingQuery = {
  sort: ["createdAt:desc"],
  populate: {
    images: {
      fields: ["url", "alternativeText", "width", "height"],
    },
    brand: {
      fields: ["name"],
    },
    seller: {
      fields: ["username"],
    },
    wheelSpecifications: {
      populate: {
        pcd_bolt_pattern: {
          fields: ["bolts", "spacing"],
        },
      },
    },
  },
};

async function getListingsByStatus(status: "draft" | "published", userId?: number) {
  const collection = S_CLIENT.collection("listings");
  const filters = userId
    ? { seller: { id: { $eq: userId } } }
    : undefined;
  const firstPage = await collection.find({
    ...listingQuery,
    status,
    filters,
    pagination: { page: 1, pageSize: 100, withCount: true },
  });
  const pageCount = firstPage.meta?.pagination?.pageCount ?? 1;
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      collection.find({
        ...listingQuery,
        status,
        filters,
        pagination: { page: index + 2, pageSize: 100, withCount: false },
      }),
    ),
  );

  return [firstPage, ...remainingPages].flatMap((response) => response.data as Listing[]);
}

export async function getAllListings() {
  const [drafts, published] = await Promise.all([
    getListingsByStatus("draft"),
    getListingsByStatus("published"),
  ]);
  const listingsByDocumentId = new Map<string, Listing>();

  drafts.forEach((listing) => listingsByDocumentId.set(listing.documentId, listing));
  published.forEach((listing) => listingsByDocumentId.set(listing.documentId, listing));

  return Array.from(listingsByDocumentId.values()).sort(
    (first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt),
  );
}

export async function getListingsForUser(userId: string | number) {
  const numericUserId = Number(userId);

  if (!Number.isSafeInteger(numericUserId) || numericUserId < 1) {
    throw new Error("A valid Strapi user ID is required to load listings.");
  }

  const [drafts, published] = await Promise.all([
    getListingsByStatus("draft", numericUserId),
    getListingsByStatus("published", numericUserId),
  ]);
  const listingsByDocumentId = new Map<string, Listing>();

  drafts.forEach((listing) => listingsByDocumentId.set(listing.documentId, listing));
  published.forEach((listing) => listingsByDocumentId.set(listing.documentId, listing));

  return Array.from(listingsByDocumentId.values()).sort(
    (first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt),
  );
}

export function getStrapiMediaUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;

  const baseUrl = (process.env.STRAPI_URL ?? "http://localhost:1337").replace(/\/api\/?$/, "");
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
