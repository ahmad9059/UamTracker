"use server";

import { revalidatePath } from "next/cache";

import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/dashboard-notifications";
import { getAuthenticatedUser } from "@/lib/session";

export async function markDashboardNotificationRead(notificationId: string) {
  try {
    const user = await getAuthenticatedUser();
    await markNotificationRead(user.id, notificationId);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark notification as read",
    };
  }
}

export async function markAllDashboardNotificationsRead() {
  try {
    const user = await getAuthenticatedUser();
    await markAllNotificationsRead(user.id);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark notifications as read",
    };
  }
}
