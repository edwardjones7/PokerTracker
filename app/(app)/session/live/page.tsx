import { startSession } from "@/app/actions/sessions";
import { SessionForm } from "@/components/session-form";
import { LiveSession } from "@/components/live-session";
import { getActiveSession } from "@/lib/data";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function LiveSessionPage() {
  const active = await getActiveSession();

  if (active) {
    const { rebuys, rebuyTotal: _rebuyTotal, ...session } = active;
    return <LiveSession session={session} rebuys={rebuys} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col">
      <PageHeader
        title="Start a session"
        description="Sit down, buy in, hit start. Add rebuys as they happen and cash out when you leave — notes come after."
      />
      <div className="rounded-2xl border bg-card p-4 sm:p-6">
        <SessionForm
          mode="start"
          action={startSession}
          submitLabel="Start session"
        />
      </div>
    </div>
  );
}
