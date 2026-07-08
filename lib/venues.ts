import type { Venue } from "@/db/schema";

export const VENUE_OPTIONS: {
  value: Venue;
  label: string;
  emoji: string;
  locationPlaceholder: string;
}[] = [
  {
    value: "casino",
    label: "Casino",
    emoji: "🎰",
    locationPlaceholder: "Casino name",
  },
  {
    value: "home",
    label: "Home game",
    emoji: "🏠",
    locationPlaceholder: "Whose game?",
  },
  {
    value: "online",
    label: "Online",
    emoji: "💻",
    locationPlaceholder: "Site name",
  },
];

export const venueLabel = (venue: Venue) =>
  VENUE_OPTIONS.find((v) => v.value === venue)!;

export type StakesPreset = { label: string; small: number; big: number };

/** Typical stakes per venue (cents). First entry is the venue's default. */
export const STAKES_PRESETS: Record<Venue, StakesPreset[]> = {
  casino: [
    { label: "$1/$2", small: 100, big: 200 },
    { label: "$1/$3", small: 100, big: 300 },
    { label: "$2/$5", small: 200, big: 500 },
  ],
  home: [
    { label: "5¢/10¢", small: 5, big: 10 },
    { label: "10¢/20¢", small: 10, big: 20 },
    { label: "25¢/50¢", small: 25, big: 50 },
    { label: "50¢/$1", small: 50, big: 100 },
  ],
  online: [
    { label: "1¢/2¢", small: 1, big: 2 },
    { label: "2¢/5¢", small: 2, big: 5 },
    { label: "5¢/10¢", small: 5, big: 10 },
    { label: "10¢/25¢", small: 10, big: 25 },
  ],
};
