import { getActiveListings, type ListingFilters } from "./listings";
import { S_CLIENT } from "./client";

/**
 * The canonical search values understood by QueryEngine.
 *
 * Every property is optional so the same utility can power the basic vehicle
 * search, the advanced wheel-specification search, or a combination of both.
 * `offset` is the canonical value for both `offset` and `ET` URL parameters.
 */
export type QueryEngineParams = {
  make?: string;
  model?: string;
  year?: number;
  pcd?: {
    bolts: number;
    spacing: number;
  };
  diameter?: number;
  offset?: number;
  width?: number;
  centreBore?: number;
  tyresIncluded?: boolean;
};

/** A resolved wheel specification used to build a Strapi listing filter. */
export type ResolvedFitment = {
  pcd?: string;
  diameter?: number;
  offset?: number;
  width?: number;
  centreBore?: number;
};

/** The shape returned by QueryEngine to the API route. */
export type QueryEngineResult = {
  listings: Awaited<ReturnType<typeof getActiveListings>>;
  params: QueryEngineParams;
  resolvedFitments: ResolvedFitment[];
};

/** A small common interface supported by URLSearchParams and Next.js search params. */
type QueryParamSource = Pick<URLSearchParams, "get">;

/** A generic Strapi record supports both Strapi 5 and older `attributes` responses. */
type StrapiRecord = Record<string, unknown>;

/** Internal fitments keep PCD as numeric fields so Strapi can filter each value. */
type ListingFitment = {
  bolts?: number;
  spacing?: number;
  diameter?: number;
  offset?: number;
  width?: number;
  centreBore?: number;
};

/**
 * Validation errors are separated from network/server errors so the API route
 * can return a helpful HTTP 400 response for malformed query parameters.
 */
export class QueryEngineValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QueryEngineValidationError";
  }
}

/** Return the data fields from either a flat Strapi 5 record or a v4 record. */
function attributesOf(record: StrapiRecord): StrapiRecord {
  const attributes = record.attributes;

  return attributes && typeof attributes === "object"
    ? (attributes as StrapiRecord)
    : record;
}

/** Unwrap a single populated Strapi relation when it is nested below `data`. */
function relationRecord(value: unknown): StrapiRecord | undefined {
  if (!value || typeof value !== "object") return undefined;

  const record = value as StrapiRecord;
  const data = record.data;

  return data && typeof data === "object" && !Array.isArray(data)
    ? (data as StrapiRecord)
    : record;
}

/** Unwrap a repeatable component or a populated to-many Strapi relation. */
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

/** Read and trim the first populated URL parameter from a list of aliases. */
function readParameter(source: QueryParamSource, aliases: string[]) {
  for (const alias of aliases) {
    const value = source.get(alias)?.trim();
    if (value) return value;
  }

  return undefined;
}

/** Parse a bounded numeric parameter after removing common wheel notation. */
function parseNumberParameter(
  value: string | undefined,
  label: string,
  options: { min: number; max: number; integer?: boolean },
) {
  if (value === undefined) return undefined;

  const normalised = value.replace(/^ET\s*/i, "").replace(/J$/i, "").trim();
  const number = Number(normalised);
  const isExpectedNumber = options.integer
    ? Number.isInteger(number)
    : Number.isFinite(number);

  if (!isExpectedNumber || number < options.min || number > options.max) {
    throw new QueryEngineValidationError(`${label} is not valid.`);
  }

  return number;
}

/** Parse URL-friendly boolean values used by checkbox filters. */
function parseBooleanParameter(value: string | undefined, label: string) {
  if (value === undefined) return undefined;

  if (["true", "1", "yes"].includes(value.toLowerCase())) return true;
  if (["false", "0", "no"].includes(value.toLowerCase())) return false;

  throw new QueryEngineValidationError(`${label} must be true or false.`);
}

/** Parse PCD notation such as `5x112`, `5 X 112`, or `5*112`. */
function parsePcd(value: string | undefined): QueryEngineParams["pcd"] {
  if (value === undefined) return undefined;

  const match = value.match(/^(\d+)\s*[x*]\s*(\d+(?:\.\d+)?)$/i);
  if (!match) {
    throw new QueryEngineValidationError("PCD must use a format such as 5x112.");
  }

  const bolts = Number(match[1]);
  const spacing = Number(match[2]);

  if (bolts < 3 || bolts > 10 || spacing < 80 || spacing > 250) {
    throw new QueryEngineValidationError("PCD is outside the supported range.");
  }

  return { bolts, spacing };
}

/** Convert URL query parameters into one predictable, typed search object. */
function parseQueryParams(source: QueryParamSource): QueryEngineParams {
  return {
    make: readParameter(source, ["make", "vehicleMake"]),
    model: readParameter(source, ["model", "vehicleModel"]),
    year: parseNumberParameter(readParameter(source, ["year", "vehicleYear"]), "Year", {
      min: 1886,
      max: 2100,
      integer: true,
    }),
    pcd: parsePcd(readParameter(source, ["pcd"])),
    diameter: parseNumberParameter(
      readParameter(source, ["diameter", "size"]),
      "Wheel size",
      { min: 10, max: 30, integer: true },
    ),
    // ET is another name for wheel offset, so either URL key populates `offset`.
    offset: parseNumberParameter(readParameter(source, ["offset", "et"]), "Offset", {
      min: -100,
      max: 100,
    }),
    width: parseNumberParameter(readParameter(source, ["width"]), "Width", {
      min: 3,
      max: 20,
    }),
    // Bore is supported now because it is part of vehicle compatibility and listings.
    centreBore: parseNumberParameter(
      readParameter(source, ["centreBore", "centerBore", "bore"]),
      "Centre bore",
      { min: 30, max: 150 },
    ),
    tyresIncluded: parseBooleanParameter(
      readParameter(source, ["tyresIncluded", "tyres"]),
      "Includes tyres",
    ),
  };
}

/** Remove duplicate fitments produced by variants that share wheel specifications. */
function uniqueFitments(fitments: ListingFitment[]) {
  const seen = new Set<string>();

  return fitments.filter((fitment) => {
    const key = JSON.stringify(fitment);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * QueryEngine translates reusable URL search state into Strapi listing filters.
 *
 * Basic search flow:
 * 1. Resolve make/model/year to matching vehicle records.
 * 2. Extract PCD, centre bore, width, and offset from those vehicles.
 * 3. Query published listings by the vehicle's PCD only.
 * 4. Return the full factory fitments as metadata for compatibility warnings.
 *
 * Advanced parameters can still narrow the PCD results by offset, width, or bore.
 */
export class QueryEngine {
  /** Parsed params are public so callers can display or log the canonical query. */
  public readonly params: QueryEngineParams;

  constructor(searchParams: QueryParamSource) {
    this.params = parseQueryParams(searchParams);
  }

  /** Execute the complete vehicle-resolution and listing-search pipeline. */
  async search(): Promise<QueryEngineResult> {
    const hasVehicleParams = Boolean(
      this.params.make || this.params.model || this.params.year,
    );
    const hasAdvancedParams = Boolean(
      this.params.pcd ||
        this.params.diameter !== undefined ||
        this.params.offset !== undefined ||
        this.params.width !== undefined ||
        this.params.centreBore !== undefined ||
        this.params.tyresIncluded !== undefined,
    );

    // With no search params, preserve the existing behaviour of returning all listings.
    if (!hasVehicleParams && !hasAdvancedParams) {
      return {
        listings: await getActiveListings(),
        params: this.params,
        resolvedFitments: [],
      };
    }

    const vehicleFitments = hasVehicleParams
      ? await this.resolveVehicleFitments()
      : [];

    // A requested vehicle with no matching Strapi record must return no listings.
    if (hasVehicleParams && vehicleFitments.length === 0) {
      return { listings: [], params: this.params, resolvedFitments: [] };
    }

    // Vehicle searches deliberately start with PCD only. The complete factory
    // fitments remain untouched below so the UI can compare each listing later.
    const baseSearchFitments = vehicleFitments.length > 0
      ? vehicleFitments.map(({ bolts, spacing }) => ({ bolts, spacing }))
      : [{}];
    const searchFitments = uniqueFitments(
      baseSearchFitments.map((fitment) => this.applyAdvancedParams(fitment)),
    );
    const listings = await getActiveListings(
      this.buildListingFilters(searchFitments),
    );
    const metadataFitments = vehicleFitments.length > 0
      ? vehicleFitments
      : searchFitments;

    return {
      listings,
      params: this.params,
      resolvedFitments: metadataFitments.map((fitment) => ({
        pcd:
          fitment.bolts !== undefined && fitment.spacing !== undefined
            ? `${fitment.bolts}x${fitment.spacing}`
            : undefined,
        diameter: fitment.diameter,
        offset: fitment.offset,
        width: fitment.width,
        centreBore: fitment.centreBore,
      })),
    };
  }

  /** Resolve optional vehicle params against Strapi and extract every valid fitment. */
  private async resolveVehicleFitments(): Promise<ListingFitment[]> {
    const filters: ListingFilters = {};
    const vehicleModel: Record<string, unknown> = {};

    if (this.params.make) {
      vehicleModel.make = { name: { $eqi: this.params.make } };
    }
    if (this.params.model) {
      vehicleModel.name = { $eqi: this.params.model };
    }
    if (Object.keys(vehicleModel).length > 0) {
      filters.vehicleModel = vehicleModel;
    }
    if (this.params.year !== undefined) {
      filters.yearFrom = { $lte: this.params.year };
      filters.yearTo = { $gte: this.params.year };
    }

    const response = await S_CLIENT.collection("vehicles").find({
      fields: ["yearFrom", "yearTo", "centreBore"],
      filters,
      populate: {
        vehicleModel: {
          fields: ["name"],
          populate: { make: { fields: ["name"] } },
        },
        pcdBoltPattern: { fields: ["bolts", "spacing"] },
        wheelFitments: {
          fields: ["wheelDiameter", "wheelWidth", "offset"],
        },
      },
      pagination: { pageSize: 500 },
    });

    return uniqueFitments(
      (response.data as unknown as StrapiRecord[]).flatMap((vehicle) => {
        const attributes = attributesOf(vehicle);
        const pcd = relationRecord(attributes.pcdBoltPattern);
        const pcdAttributes = pcd ? attributesOf(pcd) : undefined;
        const bolts = Number(pcdAttributes?.bolts);
        const spacing = Number(pcdAttributes?.spacing);
        const centreBore = Number(attributes.centreBore);

        return relationRecords(attributes.wheelFitments).map((wheelFitment) => {
          const wheelAttributes = attributesOf(wheelFitment);
          const diameter = Number(wheelAttributes.wheelDiameter);
          const width = Number(wheelAttributes.wheelWidth);
          const offset = Number(wheelAttributes.offset);

          return {
            bolts: Number.isFinite(bolts) ? bolts : undefined,
            spacing: Number.isFinite(spacing) ? spacing : undefined,
            centreBore: Number.isFinite(centreBore) ? centreBore : undefined,
            diameter: Number.isFinite(diameter) ? diameter : undefined,
            width: Number.isFinite(width) ? width : undefined,
            offset: Number.isFinite(offset) ? offset : undefined,
          };
        });
      }),
    );
  }

  /** Explicit advanced params add optional constraints to the PCD-based search. */
  private applyAdvancedParams(fitment: ListingFitment): ListingFitment {
    return {
      ...fitment,
      bolts: this.params.pcd?.bolts ?? fitment.bolts,
      spacing: this.params.pcd?.spacing ?? fitment.spacing,
      diameter: this.params.diameter ?? fitment.diameter,
      offset: this.params.offset ?? fitment.offset,
      width: this.params.width ?? fitment.width,
      centreBore: this.params.centreBore ?? fitment.centreBore,
    };
  }

  /** Convert resolved fitments into Strapi's nested component filter syntax. */
  private buildListingFilters(fitments: ListingFitment[]): ListingFilters {
    const specificationFilters = fitments
      .map((fitment) => {
        const wheelSpecifications: Record<string, unknown> = {};

        if (fitment.bolts !== undefined && fitment.spacing !== undefined) {
          wheelSpecifications.pcd_bolt_pattern = {
            bolts: { $eq: fitment.bolts },
            spacing: { $eq: fitment.spacing },
          };
        }
        if (fitment.diameter !== undefined) {
          wheelSpecifications.diameter = { $eq: fitment.diameter };
        }
        if (fitment.offset !== undefined) {
          wheelSpecifications.offset = { $eq: fitment.offset };
        }
        if (fitment.width !== undefined) {
          wheelSpecifications.width = { $eq: fitment.width };
        }
        if (fitment.centreBore !== undefined) {
          wheelSpecifications.centreBore = { $eq: fitment.centreBore };
        }

        return Object.keys(wheelSpecifications).length > 0
          ? { wheelSpecifications }
          : undefined;
      })
      .filter((filter): filter is { wheelSpecifications: Record<string, unknown> } =>
        Boolean(filter),
      );

    const filters: ListingFilters[] = [];

    if (specificationFilters.length === 1) {
      filters.push(specificationFilters[0]);
    } else if (specificationFilters.length > 1) {
      filters.push({ $or: specificationFilters });
    }

    if (this.params.tyresIncluded !== undefined) {
      filters.push({ tyresIncluded: { $eq: this.params.tyresIncluded } });
    }

    if (filters.length === 0) return {};
    return filters.length === 1 ? filters[0] : { $and: filters };
  }
}
