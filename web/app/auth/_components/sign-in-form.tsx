"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";

type SignInValues = {
  identifier: string;
  password: string;
};

const inputClass =
  "w-full rounded-lg border border-neutral bg-white px-3 py-2.5 text-neutral-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-light";

export default function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ defaultValues: { identifier: "", password: "" } });

  async function onSubmit(values: SignInValues) {
    try {
      const result = await signIn("credentials", {
        identifier: values.identifier,
        password: values.password,
        redirect: false,
        callbackUrl,
      });

      if (!result?.ok) {
        setError("root", { message: "The email/username or password was incorrect." });
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("root", {
        message: "The authentication service is unavailable. Please try again.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label htmlFor="identifier" className="mb-1.5 block text-sm font-semibold">Email or username</label>
        <input
          id="identifier"
          autoComplete="username"
          autoFocus
          className={inputClass}
          {...register("identifier", { required: "Enter your email address or username." })}
        />
        {errors.identifier && <p className="mt-1 text-sm text-red-700">{errors.identifier.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className={inputClass}
          {...register("password", { required: "Enter your password." })}
        />
        {errors.password && <p className="mt-1 text-sm text-red-700">{errors.password.message}</p>}
      </div>

      {errors.root?.message && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800" role="alert">
          {errors.root.message}
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-neutral-dark/70">
        New to WheelMarket? <Link href="/auth/register" className="font-semibold text-primary hover:text-primary-dark">Create an account</Link>
      </p>
    </form>
  );
}
