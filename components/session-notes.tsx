"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { NotebookPen, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateSessionNotes, type ActionState } from "@/app/actions/sessions";

const initialState: ActionState = { error: null };

/** Notes card on the session detail page. Read view with an edit toggle;
 * opens straight into the editor right after a live cash-out (autoEdit). */
export function SessionNotes({
  sessionId,
  notes,
  autoEdit = false,
}: {
  sessionId: number;
  notes: string;
  autoEdit?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updateSessionNotes,
    initialState,
  );
  const [editing, setEditing] = useState(autoEdit && !notes);
  const submitted = useRef(false);

  useEffect(() => {
    if (!submitted.current || pending) return;
    submitted.current = false;
    if (state.error === null) setEditing(false);
  }, [pending, state]);

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-medium">
          <NotebookPen className="size-4 text-muted-foreground" /> Notes
        </p>
        {!editing && notes && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-3.5" /> Edit
          </Button>
        )}
      </div>

      {editing ? (
        <form
          action={formAction}
          onSubmit={() => (submitted.current = true)}
          className="flex flex-col gap-3"
        >
          <input type="hidden" name="sessionId" value={sessionId} />
          <Textarea
            name="notes"
            defaultValue={notes}
            placeholder="Table dynamics, big hands, mistakes, reads…"
            rows={5}
            autoFocus
          />
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save notes"}
            </Button>
          </div>
        </form>
      ) : notes ? (
        <p className="text-sm whitespace-pre-wrap text-muted-foreground">
          {notes}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="w-full rounded-lg border border-dashed p-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          How did it go? Add your write-up…
        </button>
      )}
    </div>
  );
}
