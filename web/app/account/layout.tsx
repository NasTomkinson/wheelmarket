import Sidebar from "./_components/sidebar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/utils/auth/options";

export default async function AccountLayout({ children }: LayoutProps<"/">){
    const session = await getServerSession(authOptions);

    if (!session) redirect("/auth/sign-in?callbackUrl=/account");

    return (
        <div className="py-8 container">
            <div className="grid grid-cols-[1fr_4fr] gap-4">
                <Sidebar />
                <article>
                    { children }
                </article>
            </div>
        </div>
    )
}
