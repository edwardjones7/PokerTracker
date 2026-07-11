import { redirect } from "next/navigation";
import { getSessionsWithRebuys, getTransactions } from "@/lib/data";
import { OnboardingForm } from "./onboarding-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const [sessions, transactions] = await Promise.all([
    getSessionsWithRebuys(),
    getTransactions(),
  ]);
  // Already onboarded (or claimed legacy data) — nothing to set up.
  if (sessions.length > 0 || transactions.length > 0) redirect("/");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl tracking-tight">
            Welcome to PokerTracker
          </CardTitle>
          <CardDescription>
            How much are you starting with? Leave blank for $0 — you can
            always add deposits later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm />
        </CardContent>
      </Card>
    </div>
  );
}
