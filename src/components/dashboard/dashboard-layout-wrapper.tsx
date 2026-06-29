import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { getSessionFromCookies, getUserOnboardingStatus } from "@/lib/session";
import DashboardLayoutClient from "./dashboard-layout-client";

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.emailVerified) {
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }

  const onboardingCompleted = await getUserOnboardingStatus(session.user.id);

  if (!onboardingCompleted) {
    redirect("/onboarding");
  }

  // Strip non-serializable fields (Dates, symbols) before sending to client.
  const clientSession = {
    isAdmin: isAdminEmail(session.user.email),
    user: {
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: session.user.image ?? null,
    },
  };

  return (
    <DashboardLayoutClient session={clientSession}>
      {children}
    </DashboardLayoutClient>
  );
}
