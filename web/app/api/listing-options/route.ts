import { S_CLIENT } from "@/utils/strapi/client";

export async function GET() {
  try {
    const [pcdResponse, brandResponse] = await Promise.all([
      S_CLIENT.collection("pcd-bolt-patterns").find({
        fields: ["bolts", "spacing"],
        sort: ["bolts:asc", "spacing:asc"],
        pagination: { pageSize: 100 },
      }),
      S_CLIENT.collection("wheel-brands").find({
        fields: ["name"],
        populate: { models: { fields: ["name"] } },
        sort: ["name:asc"],
        pagination: { pageSize: 100 },
      }),
    ]);

    return Response.json({
      pcds: pcdResponse.data,
      brands: brandResponse.data,
    });
  } catch (error) {
    console.error("Unable to load listing options", error);

    return Response.json(
      { message: "Unable to load wheel options. Please try again." },
      { status: 502 },
    );
  }
}
