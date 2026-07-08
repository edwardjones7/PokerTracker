import { createPastSession } from "@/app/actions/sessions";
import { SessionForm } from "@/components/session-form";

export default function NewSessionPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Add past session</h1>
      <SessionForm
        mode="past"
        action={createPastSession}
        submitLabel="Save session"
      />
    </div>
  );
}
