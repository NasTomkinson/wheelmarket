import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import RegisterForm from "../_components/register-form";
import { authOptions } from "@/utils/auth/options";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session) redirect("/account");

  return (
    <main className="container flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-neutral bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Join WheelMarket</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-dark">Create an account</h1>
        <p className="mt-2 mb-7 text-neutral-dark/70">Your account will be stored in Strapi’s standard users table.</p>
        <RegisterForm />
      </div>
    </main>
  );
}
