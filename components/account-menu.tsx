"use client";

import Link from "next/link";
import { Menu } from "@base-ui/react/menu";
import { CircleUserRound, LogOut, UsersRound } from "lucide-react";
import { useSignOut } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";

const itemClass =
  "flex w-full cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm outline-none data-highlighted:bg-accent";

/** Mobile "Account" tab: holds what the desktop side rail shows directly. */
export function AccountMenu({
  name,
  email,
  showUsers,
  active,
}: {
  name: string;
  email: string;
  showUsers: boolean;
  active: boolean;
}) {
  const signOut = useSignOut();
  return (
    <Menu.Root>
      <Menu.Trigger
        className={cn(
          "flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors",
          active
            ? "font-medium text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <CircleUserRound className="size-5" />
        Account
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="top"
          align="end"
          sideOffset={10}
          collisionPadding={12}
          className="z-[60]"
        >
          <Menu.Popup className="w-60 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl outline-none data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-1 data-closed:animate-out data-closed:fade-out-0">
            <div className="mb-1.5 border-b px-2.5 pt-1.5 pb-2.5">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
            {showUsers && (
              <Menu.LinkItem
                closeOnClick
                render={<Link href="/users" />}
                className={itemClass}
              >
                <UsersRound className="size-4 text-muted-foreground" /> Users
              </Menu.LinkItem>
            )}
            <Menu.Item onClick={signOut} className={itemClass}>
              <LogOut className="size-4 text-muted-foreground" /> Sign out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
