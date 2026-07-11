import { getAllUsers } from "@/lib/data";
import { requireOwner } from "@/lib/auth";
import { LocalTime } from "@/components/local-time";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const owner = await requireOwner();
  const users = await getAllUsers();

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Users"
        description={`${users.length} account${users.length === 1 ? "" : "s"} — only you can see this.`}
      />

      <div className="flex flex-col divide-y divide-border/60 overflow-hidden rounded-xl border bg-card">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between gap-3 px-4 py-3.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {u.name}
                {u.id === owner.id && (
                  <span className="ml-2 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    You
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {u.email}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Joined <LocalTime date={u.createdAt} format="date" />
              </p>
            </div>
            <div className="shrink-0 text-right text-xs text-muted-foreground">
              <p className="text-sm font-semibold tabular-nums text-foreground">
                {u.sessionCount}
                <span className="ml-1 font-normal text-muted-foreground">
                  session{u.sessionCount === 1 ? "" : "s"}
                </span>
              </p>
              <p className="mt-0.5">
                {u.lastPlayed ? (
                  <>
                    Last played <LocalTime date={u.lastPlayed} format="date" />
                  </>
                ) : (
                  "Never played"
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
