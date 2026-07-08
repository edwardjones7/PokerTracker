import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSessionsWithRebuys } from "@/lib/data";
import { SessionCard } from "@/components/session-card";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const sessions = (await getSessionsWithRebuys()).filter(
    (s) => s.status === "completed",
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sessions</h1>
        <Button size="sm" render={<Link href="/sessions/new" />}>
          <Plus className="size-4" /> Add past session
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No sessions yet. Start one from the Play tab, or add a past session.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  );
}
