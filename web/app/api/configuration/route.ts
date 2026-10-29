import { S_CLIENT } from "../../../utils/strapi/client"

export async function GET(){
    const PCDCollection = await S_CLIENT.collection("pcd-bolt-patterns")
    const PCDs = await PCDCollection.find()
    return Response.json(PCDs)
}