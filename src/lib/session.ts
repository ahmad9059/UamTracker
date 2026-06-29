import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const getSessionFromCookies = cache(async () => {
  const cookieHeader = (await headers()).get("cookie") ?? undefined;

  return auth.api.getSession(
    cookieHeader ? { headers: { cookie: cookieHeader } } : undefined
  );
});

export const getAuthenticatedUser = cache(async () => {
  const session = await getSessionFromCookies();

  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please log in to continue");
  }

  return session.user;
});

export const getUserOnboardingStatus = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true },
  });

  return user?.onboardingCompleted ?? false;
});
