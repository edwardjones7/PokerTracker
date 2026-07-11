/** Tiny attribution tag pinned to the top-right corner of every page. */
export function PoweredBy() {
  return (
    <a
      href="https://www.elenos.ai"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-2 right-3 z-50 text-[10px] tracking-wide text-muted-foreground/60 transition-colors hover:text-foreground"
    >
      Powered by <span className="font-semibold">Elenos</span>
    </a>
  );
}
