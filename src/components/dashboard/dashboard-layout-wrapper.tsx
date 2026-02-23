import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
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

  // Strip non-serializable fields (Dates, symbols) before sending to client.
  const clientSession = {
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
