import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

const FALLBACK_ADMIN_EMAILS = ["uam@ahmadx.dev"];

function getConfiguredAdminEmails() {
  const configured = process.env.ADMIN_EMAILS?.split(",") ?? FALLBACK_ADMIN_EMAILS;

  return configured
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return getConfiguredAdminEmails().includes(email.toLowerCase());
}

export async function getSessionFromCookies() {
  const cookieHeader = (await headers()).get("cookie") ?? undefined;

  return auth.api.getSession(
    cookieHeader ? { headers: { cookie: cookieHeader } } : undefined
  );
}

export async function requireAdminSession(callbackUrl = "/admin") {
  const session = await getSessionFromCookies();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  if (!session.user.emailVerified) {
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }

  if (!isAdminEmail(session.user.email)) {
    redirect("/dashboard");
  }

  return session;
}
