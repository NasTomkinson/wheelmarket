"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";

type RegisterValues = {
  username: string;
  email: string;
  location: string;
  password: string;
  confirmPassword: string;
};

const inputClass =
  "w-full rounded-lg border border-neutral bg-white px-3 py-2.5 text-neutral-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-light";

export default function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    defaultValues: {
      username: "",
      email: "",
      location: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterValues) {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          location: values.location,
          password: values.password,
        }),
      });
      const body = (await response.json()) as { message?: string };

      if (!response.ok) throw new Error(body.message || "Unable to create your account.");

      const result = await signIn("credentials", {
        identifier: values.email,
        password: values.password,
        redirect: false,
      });

      if (!result?.ok) {
        router.push("/auth/sign-in?registered=true");
        return;
      }

      router.push("/account");
      router.refresh();
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : "Unable to create your account.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-semibold">Username</label>
        <input
          id="username"
          autoComplete="username"
          autoFocus
          className={inputClass}
          {...register("username", {
            required: "Enter a username.",
            minLength: { value: 3, message: "Use at least 3 characters." },
            maxLength: { value: 50, message: "Use no more than 50 characters." },
          })}
        />
        {errors.username && <p className="mt-1 text-sm text-red-700">{errors.username.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email address</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={inputClass}
          {...register("email", {
            required: "Enter your email address.",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address." },
          })}
        />
        {errors.email && <p className="mt-1 text-sm text-red-700">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="location" className="mb-1.5 block text-sm font-semibold">Collection location</label>
        <input
          id="location"
          autoComplete="address-level2"
          placeholder="Town or city"
          className={inputClass}
          {...register("location", {
            required: "Enter a collection location.",
            minLength: { value: 2, message: "Use at least 2 characters." },
            maxLength: { value: 120, message: "Use no more than 120 characters." },
          })}
        />
        <p className="mt-1 text-xs text-neutral-dark/60">Use a general area, not your full address.</p>
        {errors.location && <p className="mt-1 text-sm text-red-700">{errors.location.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          {...register("password", {
            required: "Enter a password.",
            minLength: { value: 8, message: "Use at least 8 characters." },
            maxLength: { value: 128, message: "Use no more than 128 characters." },
          })}
        />
        {errors.password && <p className="mt-1 text-sm text-red-700">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold">Confirm password</label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          {...register("confirmPassword", {
            required: "Confirm your password.",
            validate: (value) => value === getValues("password") || "Passwords do not match.",
          })}
        />
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-700">{errors.confirmPassword.message}</p>}
      </div>

      {errors.root?.message && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800" role="alert">
          {errors.root.message}
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-neutral-dark/70">
        Already have an account? <Link href="/auth/sign-in" className="font-semibold text-primary hover:text-primary-dark">Sign in</Link>
      </p>
    </form>
  );
}
