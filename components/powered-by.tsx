import { cn } from "@/lib/utils";

/** Small attribution link. Rendered in normal page flow (side rail, page
    footer, under the auth cards) so it never floats over content. */
export function PoweredBy({ className }: { className?: string }) {
  return (
    <a
      href="https://www.elenos.ai"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-[11px] tracking-wide text-muted-foreground/70 transition-colors hover:text-foreground",
        className,
      )}
    >
      Powered by <span className="font-semibold">Elenos</span>
    </a>
  );
}
