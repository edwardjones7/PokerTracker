import { Dices, House, Monitor, type LucideIcon } from "lucide-react";
import type { Venue } from "@/db/schema";
import { cn } from "@/lib/utils";

const VENUE_ICONS: Record<Venue, LucideIcon> = {
  casino: Dices,
  home: House,
  online: Monitor,
};

const VENUE_TINTS: Record<Venue, string> = {
  casino: "bg-primary/10 text-primary",
  home: "bg-profit/10 text-profit",
  online: "bg-foreground/10 text-foreground",
};

export function VenueIcon({
  venue,
  className,
}: {
  venue: Venue;
  className?: string;
}) {
  const Icon = VENUE_ICONS[venue];
  return <Icon className={className} />;
}

/** Icon in a venue-tinted rounded square, used on cards and detail pages. */
export function VenueBadge({
  venue,
  className,
}: {
  venue: Venue;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg",
        VENUE_TINTS[venue],
        className ?? "size-10",
      )}
    >
      <VenueIcon venue={venue} className="size-[50%]" />
    </span>
  );
}
