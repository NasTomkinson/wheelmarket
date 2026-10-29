import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SignInForm from "../_components/sign-in-form";
import { authOptions } from "@/utils/auth/options";

function getSafeCallbackUrl(value?: string) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const callbackUrl = getSafeCallbackUrl(params.callbackUrl);

  if (session) redirect(callbackUrl);

  return (
    <main className="container flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-neutral bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Welcome back</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-dark">Sign in</h1>
        <p className="mt-2 mb-7 text-neutral-dark/70">Use your WheelMarket email address or username.</p>
        {params.registered === "true" && (
          <div className="mb-5 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
            Your account was created. You can sign in now.
          </div>
        )}
        <SignInForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
