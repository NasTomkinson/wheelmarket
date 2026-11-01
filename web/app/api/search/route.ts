import {
  QueryEngine,
  QueryEngineValidationError,
} from "@/utils/strapi/query-engine";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const engine = new QueryEngine(request.nextUrl.searchParams);
    const result = await engine.search();

    return Response.json(
      {
        data: result.listings,
        meta: {
          params: result.params,
          resolvedFitments: result.resolvedFitments,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof QueryEngineValidationError) {
      return Response.json({ message: error.message }, { status: 400 });
    }

    console.error("Unable to load active listings", error);

    return Response.json(
      { message: "We could not load the listings. Please try again." },
      { status: 502 },
    );
  }
}
