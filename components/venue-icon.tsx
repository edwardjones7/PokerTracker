import { Dices, House, Monitor, type LucideIcon } from "lucide-react";
import type { Venue } from "@/db/schema";
import { cn } from "@/lib/utils";

const VENUE_ICONS: Record<Venue, LucideIcon> = {
  casino: Dices,
  home: House,
  online: Monitor,
};

const VENUE_TINTS: Record<Venue, string> = {
  casino: "bg-amber-400/10 text-amber-300",
  home: "bg-sky-400/10 text-sky-300",
  online: "bg-violet-400/10 text-violet-300",
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
