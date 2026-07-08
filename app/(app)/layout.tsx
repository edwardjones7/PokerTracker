import { SideNav, BottomNav } from "@/components/app-nav";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SideNav />
      <div className="flex flex-1 flex-col lg:pl-60">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-5 pb-28 sm:px-6 lg:px-10 lg:pt-8 lg:pb-16">
          {children}
        </main>
      </div>
      <BottomNav />
    </>
  );
}
