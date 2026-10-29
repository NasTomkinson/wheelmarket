import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth/options";

export default async function AccountPage(){
    const session = await getServerSession(authOptions);

    return (
        <div className="container"> 
            <h1 className="text-3xl font-bold text-neutral-dark">Welcome, {session?.user?.username}</h1>
            <p className="mt-2 text-neutral-dark/70">Manage your listings and account settings.</p>
        </div>
    )
}
