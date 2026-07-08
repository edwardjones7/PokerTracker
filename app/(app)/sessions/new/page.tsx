import { createPastSession } from "@/app/actions/sessions";
import { SessionForm } from "@/components/session-form";
import { PageHeader } from "@/components/page-header";

export default function NewSessionPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col">
      <PageHeader
        title="Add past session"
        description="Log a session you already played."
      />
      <div className="rounded-2xl border bg-card p-4 sm:p-6">
        <SessionForm
          mode="past"
          action={createPastSession}
          submitLabel="Save session"
        />
      </div>
    </div>
  );
}
