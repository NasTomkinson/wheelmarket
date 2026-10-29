import Image from "next/image";
import Search from "@/components/search"
import Link from "next/link";
import { getServerSession } from "next-auth";
import AuthControl from "./auth-control";
import { authOptions } from "@/utils/auth/options";

export default async function Header () {
    const session = await getServerSession(authOptions);

    return (
        <header className="border-b ">
            <div className="container grid grid-cols-3 py-4 ">
                <div className="flex flex-col justify-center items-start">
                    <Link href="/"> 
                        <Image src="/logoMark.svg" width="100" height="100" className="w-16" alt="WheelMarket Logo" />
                    </Link>
                </div>
                <div>
                    <Search />
                </div>
                <div className="flex flex-row justify-end items-center"> 
                    <AuthControl username={session?.user?.username} />
                </div>
            </div>
        </header>
    )
}
