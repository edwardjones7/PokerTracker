import { SideNav, BottomNav } from "@/components/app-nav";
import { SignOutButton } from "@/components/sign-out-button";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SideNav />
      <div className="flex flex-1 flex-col lg:pl-60">
        {/* Mobile-only sign out; desktop has it in the side rail. */}
        <div className="flex justify-end px-4 pt-3 lg:hidden">
          <SignOutButton iconOnly className="p-2" />
        </div>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-2 pb-28 sm:px-6 lg:px-10 lg:pt-8 lg:pb-16">
          {children}
        </main>
      </div>
      <BottomNav />
    </>
  );
}
