import Link from "next/link";
import { Plus, Spade } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSessionsWithRebuys } from "@/lib/data";
import { SessionCard } from "@/components/session-card";
import { SessionTable } from "@/components/session-table";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const sessions = (await getSessionsWithRebuys()).filter(
    (s) => s.status === "completed",
  );

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Sessions"
        description={
          sessions.length > 0
            ? `${sessions.length} session${sessions.length === 1 ? "" : "s"} on the books`
            : undefined
        }
      >
        <Button render={<Link href="/sessions/new" />}>
          <Plus className="size-4" /> Add past session
        </Button>
      </PageHeader>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-12 text-center">
          <Spade className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No sessions yet. Start one from the Play tab, or add a past
            session.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 md:hidden">
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
          <div className="hidden md:block">
            <SessionTable sessions={sessions} />
          </div>
        </>
      )}
    </div>
  );
}
