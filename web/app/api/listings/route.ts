import { S_CLIENT } from "@/utils/strapi/client";
import { getAllListings } from "@/utils/strapi/listings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth/options";

const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const conditionOptions = new Set([
  "new",
  "like_new",
  "excellent",
  "good",
  "fair",
  "refurbished",
]);
const constructionOptions = new Set(["cast", "flow_formed", "forged"]);
const tyreTypeOptions = new Set(["budget", "mid_range", "premium"]);
const maxImageSize = 10 * 1024 * 1024;

type ListingPayload = {
  title?: unknown;
  description?: unknown;
  condition?: unknown;
  price?: unknown;
  brand?: unknown;
  wheelModel?: unknown;
  pcd?: unknown;
  diameter?: unknown;
  width?: unknown;
  offset?: unknown;
  centreBore?: unknown;
  construction?: unknown;
  partNumber?: unknown;
  quantity?: unknown;
  finish?: unknown;
  tyresIncluded?: unknown;
  tyreType?: unknown;
  otherInformation?: unknown;
};

function isTrimmedString(value: unknown, minimum = 1, maximum = Infinity) {
  return (
    typeof value === "string" &&
    value.trim().length >= minimum &&
    value.trim().length <= maximum
  );
}

function isNumberInRange(value: unknown, minimum: number, maximum: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum;
}

function validatePayload(data: ListingPayload, images: File[]) {
  if (images.length < 1 || images.length > 8) return "Add between 1 and 8 wheel images.";
  if (images.some((image) => !acceptedImageTypes.has(image.type))) {
    return "Images must be JPG, PNG, or WebP files.";
  }
  if (images.some((image) => image.size > maxImageSize)) {
    return "Each image must be 10 MB or smaller.";
  }
  if (!isTrimmedString(data.title, 10, 100)) return "Enter a title between 10 and 100 characters.";
  if (!isTrimmedString(data.description, 30, 3000)) {
    return "Enter a description between 30 and 3,000 characters.";
  }
  if (typeof data.condition !== "string" || !conditionOptions.has(data.condition)) {
    return "Choose a valid wheel condition.";
  }
  if (!isNumberInRange(data.price, 0.01, 1_000_000)) return "Enter a valid price.";
  if (data.brand && !isTrimmedString(data.brand, 1, 100)) return "Choose a valid wheel brand.";
  if (!isTrimmedString(data.wheelModel, 1, 100)) return "Enter the wheel model.";
  if (!isTrimmedString(data.pcd, 1, 100)) return "Choose a PCD / bolt pattern.";
  if (!isNumberInRange(data.diameter, 10, 30)) return "Enter a wheel diameter from 10 to 30 inches.";
  if (!isNumberInRange(data.width, 3, 20)) return "Enter a wheel width from 3 to 20 inches.";
  if (!isNumberInRange(data.offset, -100, 100)) return "Enter an offset from -100 to 100 mm.";
  if (!isNumberInRange(data.centreBore, 30, 150)) return "Enter a centre bore from 30 to 150 mm.";
  if (typeof data.construction !== "string" || !constructionOptions.has(data.construction)) {
    return "Choose a valid construction type.";
  }
  if (data.partNumber && !isTrimmedString(data.partNumber, 1, 100)) return "Enter a valid part number.";
  if (!Number.isInteger(data.quantity) || !isNumberInRange(data.quantity, 1, 4)) {
    return "Choose a quantity from 1 to 4 wheels.";
  }
  if (data.finish && !isTrimmedString(data.finish, 1, 100)) return "Enter a valid finish.";
  if (typeof data.tyresIncluded !== "boolean") return "Choose whether tyres are included.";
  if (
    data.tyresIncluded &&
    (typeof data.tyreType !== "string" || !tyreTypeOptions.has(data.tyreType))
  ) {
    return "Choose the included tyre type.";
  }
  if (data.otherInformation && !isTrimmedString(data.otherInformation, 1, 1500)) {
    return "Other information must be 1,500 characters or fewer.";
  }

  return null;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ message: "You must be signed in to create a listing." }, { status: 401 });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return Response.json({ message: "The listing submission was not valid." }, { status: 400 });
  }

  const rawData = formData.get("data");
  const images = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (typeof rawData !== "string") {
    return Response.json({ message: "Listing details are missing." }, { status: 400 });
  }

  let data: ListingPayload;

  try {
    data = JSON.parse(rawData) as ListingPayload;
  } catch {
    return Response.json({ message: "Listing details are not valid JSON." }, { status: 400 });
  }

  const validationError = validatePayload(data, images);

  if (validationError) {
    return Response.json({ message: validationError }, { status: 400 });
  }

  const uploadedFileIds: number[] = [];

  try {
    for (const [index, image] of images.entries()) {
      const uploaded = await S_CLIENT.files.upload(image, {
        fileInfo: {
          alternativeText: `${String(data.title).trim()} - image ${index + 1}`,
        },
      });

      if (!uploaded[0]?.id) throw new Error("Strapi did not return an uploaded file ID.");
      uploadedFileIds.push(uploaded[0].id);
    }

    const listing = await S_CLIENT.collection("listings").create({
      images: uploadedFileIds,
      title: String(data.title).trim(),
      description: String(data.description).trim(),
      condition: data.condition,
      price: data.price,
      brand: data.brand || undefined,
      wheelModel: String(data.wheelModel).trim(),
      wheelSpecifications: {
        pcd_bolt_pattern: data.pcd,
        diameter: data.diameter,
        width: data.width,
        offset: data.offset,
        centreBore: data.centreBore,
        construction: data.construction,
      },
      partNumber: typeof data.partNumber === "string" ? data.partNumber.trim() || undefined : undefined,
      quantity: data.quantity,
      finish: typeof data.finish === "string" ? data.finish.trim() || undefined : undefined,
      tyresIncluded: data.tyresIncluded,
      tyreType: data.tyresIncluded ? data.tyreType : undefined,
      otherInformation:
        typeof data.otherInformation === "string"
          ? data.otherInformation.trim() || undefined
          : undefined,
    });

    return Response.json({ data: listing.data }, { status: 201 });
  } catch (error) {
    await Promise.allSettled(uploadedFileIds.map((id) => S_CLIENT.files.delete(id)));
    console.error("Unable to create listing", error);

    return Response.json(
      { message: "We could not create your listing. No images were saved; please try again." },
      { status: 502 },
    );
  }
}

export async function GET() {
  try {
    const listings = await getAllListings();

    return Response.json({ data: listings }, { status: 200 });
  } catch (error) {
    console.error("Unable to load listings", error);

    return Response.json(
      { message: "We could not load the listings. Please try again." },
      { status: 502 },
    );
  }
}
