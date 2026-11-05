"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function useSignOut() {
  const router = useRouter();
  return async function signOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };
}

export function SignOutButton({ className }: { className?: string }) {
  const signOut = useSignOut();

  return (
    <button
      type="button"
      onClick={signOut}
      className={cn(
        "flex items-center gap-3 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <LogOut className="size-4.5" />
      Sign out
    </button>
  );
}
