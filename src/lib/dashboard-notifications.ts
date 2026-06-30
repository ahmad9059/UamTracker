import { unstable_cache, updateTag } from "next/cache";

import { prisma } from "@/lib/db";

export type DashboardNotification = {
  id: string;
  title: string;
  description: string;
  href: string;
  createdAt: string;
  readAt: string | null;
  tone: "info" | "warning" | "success";
};

type NotificationInput = {
  userId: string;
  title: string;
  description: string;
  href: string;
  tone?: DashboardNotification["tone"];
  sourceKey?: string;
};

function toClientNotification(notification: {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: string;
  createdAt: Date;
  readAt: Date | null;
}): DashboardNotification {
  return {
    id: notification.id,
    title: notification.title,
    description: notification.description,
    href: notification.href,
    tone:
      notification.tone === "warning" || notification.tone === "success"
        ? notification.tone
        : "info",
    createdAt: notification.createdAt.toISOString(),
    readAt: notification.readAt?.toISOString() ?? null,
  };
}

function invalidateNotifications() {
  updateTag("dashboard-notifications");
}

const getCachedDashboardNotifications = unstable_cache(
  async (userId: string) => {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return notifications.map(toClientNotification);
  },
  ["dashboard-notifications"],
  { revalidate: 300, tags: ["dashboard-notifications"] }
);

export async function getDashboardNotifications(userId: string) {
  await ensureBaselineNotifications(userId);
  return getCachedDashboardNotifications(userId);
}

export async function createNotification(input: NotificationInput) {
  const tone = input.tone ?? "info";

  if (input.sourceKey) {
    await prisma.notification.upsert({
      where: {
        userId_sourceKey: {
          userId: input.userId,
          sourceKey: input.sourceKey,
        },
      },
      create: {
        userId: input.userId,
        title: input.title,
        description: input.description,
        href: input.href,
        tone,
        sourceKey: input.sourceKey,
      },
      update: {
        title: input.title,
        description: input.description,
        href: input.href,
        tone,
      },
    });
  } else {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        description: input.description,
        href: input.href,
        tone,
      },
    });
  }

  invalidateNotifications();
}

export async function markNotificationRead(userId: string, notificationId: string) {
  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  invalidateNotifications();
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  invalidateNotifications();
}

async function ensureBaselineNotifications(userId: string) {
  const semesterCount = await prisma.semester.count({ where: { userId } });

  if (semesterCount === 0) {
    const existing = await prisma.notification.findUnique({
      where: {
        userId_sourceKey: {
          userId,
          sourceKey: "welcome-create-semester",
        },
      },
      select: { id: true },
    });

    if (existing) return;

    await createNotification({
      userId,
      sourceKey: "welcome-create-semester",
      title: "Create your first semester",
      description: "Start tracking your GPA by adding a semester and your courses.",
      href: "/dashboard",
      tone: "info",
    });
  }
}
