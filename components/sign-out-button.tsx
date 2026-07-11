"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function SignOutButton({
  className,
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      aria-label="Sign out"
      className={cn(
        "flex items-center gap-3 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <LogOut className="size-4.5" />
      {!iconOnly && "Sign out"}
    </button>
  );
}
