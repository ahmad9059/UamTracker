import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";
import DashboardLayoutClient from "./dashboard-layout-client";

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // `headers()` is async in Next 16; grab the raw cookie header for Better Auth
  const cookieHeader = (await headers()).get("cookie") ?? undefined;
  const session = await auth.api.getSession(
    cookieHeader ? { headers: { cookie: cookieHeader } } : undefined
  );

  if (!session) {
    redirect("/login");
  }

  if (!session.user.emailVerified) {
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }

  // Check if user has completed onboarding
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });

  if (!dbUser?.onboardingCompleted) {
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
