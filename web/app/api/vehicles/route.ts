import { S_CLIENT } from "@/utils/strapi/client";

type StrapiRecord = Record<string, unknown>;

function attributesOf(record: StrapiRecord) {
  const attributes = record.attributes;

  return attributes && typeof attributes === "object"
    ? (attributes as StrapiRecord)
    : record;
}

function relationRecords(value: unknown): StrapiRecord[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is StrapiRecord => Boolean(item) && typeof item === "object",
    );
  }

  if (value && typeof value === "object") {
    const data = (value as StrapiRecord).data;

    if (Array.isArray(data)) {
      return data.filter(
        (item): item is StrapiRecord => Boolean(item) && typeof item === "object",
      );
    }
  }

  return [];
}

function recordId(record: StrapiRecord, fallback: string) {
  const attributes = attributesOf(record);
  const id = record.documentId ?? record.id ?? attributes.slug;

  return typeof id === "string" || typeof id === "number"
    ? String(id)
    : fallback;
}

function yearsFor(vehicles: StrapiRecord[]) {
  const years = new Set<number>();

  for (const vehicle of vehicles) {
    const attributes = attributesOf(vehicle);
    const yearFrom = Number(attributes.yearFrom);
    const yearTo = Number(attributes.yearTo);

    if (!Number.isInteger(yearFrom) || !Number.isInteger(yearTo)) {
      continue;
    }

    for (let year = yearFrom; year <= yearTo; year += 1) {
      years.add(year);
    }
  }

  return [...years].sort((a, b) => b - a);
}

export async function GET() {
  try {
    const response = await S_CLIENT.collection("vehicle-makes").find({
      fields: ["name", "slug"],
      populate: {
        models: {
          fields: ["name", "slug"],
          populate: {
            vehicles: {
              fields: ["yearFrom", "yearTo"],
            },
          },
        },
      },
      sort: ["name:asc"],
      pagination: { pageSize: 250 },
    });

    const makes = (response.data as unknown as StrapiRecord[]).map(
      (make, makeIndex) => {
        const makeAttributes = attributesOf(make);
        const models = relationRecords(makeAttributes.models)
          .map((model, modelIndex) => {
            const modelAttributes = attributesOf(model);

            return {
              id: recordId(model, `model-${makeIndex}-${modelIndex}`),
              name: String(modelAttributes.name ?? ""),
              years: yearsFor(relationRecords(modelAttributes.vehicles)),
            };
          })
          .filter((model) => model.name)
          .sort((a, b) => a.name.localeCompare(b.name));

        return {
          id: recordId(make, `make-${makeIndex}`),
          name: String(makeAttributes.name ?? ""),
          models,
        };
      },
    );

    return Response.json({ data: makes.filter((make) => make.name) });
  } catch (error) {
    console.error("Unable to load vehicles", error);

    return Response.json(
      { message: "Unable to load vehicles. Please try again." },
      { status: 502 },
    );
  }
}
