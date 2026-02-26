export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // If onboarding is already completed, redirect to dashboard
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });

  if (dbUser?.onboardingCompleted) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
