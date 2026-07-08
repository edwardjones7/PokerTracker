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

export const STAKES_PRESETS = [
  { label: "$1/$2", small: 100, big: 200 },
  { label: "$1/$3", small: 100, big: 300 },
  { label: "$2/$5", small: 200, big: 500 },
];
