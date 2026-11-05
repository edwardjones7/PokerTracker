import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  axes: ["opsz"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PokerTracker",
  description: "Track your live and online poker sessions",
  appleWebApp: {
    capable: true,
    title: "PokerTracker",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Without this, every env(safe-area-inset-*) in the app resolves to 0.
  viewportFit: "cover",
  themeColor: "#0b100d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${bodoni.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
        {/* The installed app's status bar is transparent: this keeps scrolled
            content from running under the clock. */}
        <div
          aria-hidden="true"
          className="fixed inset-x-0 top-0 z-50 h-[env(safe-area-inset-top)] bg-background/70 backdrop-blur-md"
        />
        {children}
        <Toaster
          position="top-center"
          mobileOffset={{ top: "calc(env(safe-area-inset-top) + 0.75rem)" }}
        />
      </body>
    </html>
  );
}
