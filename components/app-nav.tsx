"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Spade, Wallet } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sessions", label: "Sessions", icon: List },
  { href: "/session/live", label: "Play", icon: Spade },
  { href: "/bankroll", label: "Bankroll", icon: Wallet },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Desktop navigation — fixed left rail, hidden below lg. */
export function SideNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="px-5 pt-6 pb-8">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="flex flex-col gap-1 px-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon
                className={cn("size-4.5", active && "text-primary")}
                {...(href === "/session/live" && active
                  ? { fill: "currentColor", strokeWidth: 0 }
                  : {})}
              />
              {label}
            </Link>
          );
        })}
      </div>
      <p className="mt-auto px-5 pb-5 text-xs text-muted-foreground/60">
        Track it or it didn&apos;t happen.
      </p>
    </nav>
  );
}

/** Mobile navigation — bottom tab bar, hidden at lg and up. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75 lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors",
                active
                  ? "font-medium text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon
                className="size-5"
                {...(href === "/session/live" && active
                  ? { fill: "currentColor", strokeWidth: 0 }
                  : {})}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
