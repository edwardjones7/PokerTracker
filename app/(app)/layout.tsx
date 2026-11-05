import Link from "next/link";
import { SideNav, BottomNav } from "@/components/app-nav";
import { Logo } from "@/components/logo";
import { PoweredBy } from "@/components/powered-by";
import { requireUser, isOwner } from "@/lib/auth";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // requireUser() is cache()d, so pages re-checking auth costs nothing extra.
  const user = await requireUser();
  const owner = isOwner(user.email);
  return (
    <>
      <SideNav showUsers={owner} />
      <div className="flex flex-1 flex-col lg:pl-60">
        {/* Mobile-only brand bar; desktop has the logo in the side rail. */}
        <header className="flex items-center justify-between gap-3 px-4 pt-3 pb-2 sm:px-6 lg:hidden">
          <Link href="/" className="inline-block">
            <Logo />
          </Link>
          <PoweredBy />
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-2 pb-28 sm:px-6 lg:px-10 lg:pt-8 lg:pb-16">
          {children}
        </main>
      </div>
      <BottomNav showUsers={owner} name={user.name} email={user.email} />
    </>
  );
}
