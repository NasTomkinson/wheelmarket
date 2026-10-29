"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Icon } from "@/components/icon";

export default function AuthControl({ username }: { username?: string }) {
  if (!username) {
    return (
      <Link href="/auth/sign-in" className="btn btn-primary flex items-center gap-2">
        <Icon name="mdi:user" className="size-5" />
        <span>Sign in</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/account" className="btn flex items-center gap-2 text-neutral-dark hover:bg-neutral-light">
        <Icon name="mdi:user" className="size-5" />
        <span className="max-w-32 truncate">{username}</span>
      </Link>
      <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="btn text-sm text-neutral-dark/70 hover:bg-neutral-light">
        Sign out
      </button>
    </div>
  );
}
