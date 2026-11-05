"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Spade, UsersRound, Wallet } from "lucide-react";
import { AccountMenu } from "@/components/account-menu";
import { PlayChip } from "@/components/chips";
import { Logo } from "@/components/logo";
import { PoweredBy } from "@/components/powered-by";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sessions", label: "Sessions", icon: List },
  { href: "/session/live", label: "Play", icon: Spade },
  { href: "/bankroll", label: "Bankroll", icon: Wallet },
];

// Owner-only entry, appended when the layout says the viewer is the owner.
const usersItem = { href: "/users", label: "Users", icon: UsersRound };

function navItems(showUsers: boolean) {
  return showUsers ? [...items, usersItem] : items;
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Desktop navigation — fixed left rail, hidden below lg. */
export function SideNav({ showUsers = false }: { showUsers?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="px-5 pt-6 pb-8">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="flex flex-col gap-1 px-3">
        {navItems(showUsers).map(({ href, label, icon: Icon }) => {
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
      <div className="mt-auto flex flex-col gap-3 px-3 pb-5">
        <SignOutButton className="px-3 py-2 hover:bg-sidebar-accent/60" />
        <div className="flex flex-col gap-1 px-2">
          <p className="text-xs text-muted-foreground/60">
            Track it or it didn&apos;t happen.
          </p>
          <PoweredBy className="self-start" />
        </div>
      </div>
    </nav>
  );
}

/** Mobile navigation — bottom tab bar, hidden at lg and up. */
export function BottomNav({
  showUsers = false,
  name,
  email,
}: {
  showUsers?: boolean;
  name: string;
  email: string;
}) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-sidebar-border bg-sidebar/95 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 pb-[env(safe-area-inset-bottom)]">
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
              {href === "/session/live" ? (
                // Raised action: -mt-9 leaves the same 20px footprint as the
                // other icons, so every label stays on one baseline.
                <PlayChip className="-mt-9 size-14 drop-shadow-[0_4px_12px_rgb(212_174_90_/_0.3)]" />
              ) : (
                <Icon className="size-5" />
              )}
              {label}
            </Link>
          );
        })}
        <AccountMenu
          name={name}
          email={email}
          showUsers={showUsers}
          active={pathname.startsWith("/users")}
        />
      </div>
    </nav>
  );
}
