"use server";

import { cookies } from "next/headers";
import { notifications } from "@/services/api";
import { refreshAccessToken } from "@/actions/auth/authActions";
import type { Notification } from "@/actions/types/notification";

const getToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value || (await refreshAccessToken());
};

export async function fetchGetNotifications(limit = 20, skip = 0) {
  const token = await getToken();
  if (!token) {
    return { success: false, notifications: [] as Notification[] };
  }

  const response = await notifications.getAll({ token, limit, skip });
  if (!response.success) {
    return {
      success: false,
      notifications: [] as Notification[],
      error: response.error,
    };
  }

  const payload = response.data as {
    data?: { notifications?: Notification[] } | Notification[];
    notifications?: Notification[];
  };
  const nestedData = payload.data;
  const notificationList = Array.isArray(nestedData)
    ? nestedData
    : nestedData?.notifications || payload.notifications || [];

  return { success: true, notifications: notificationList };
}

export async function markNotificationAsRead(notificationId: number) {
  const token = await getToken();
  if (!token) return { success: false, error: "Non authentifié." };
  return notifications.markAsRead({ notificationId, token });
}

export async function markAllNotificationsAsRead() {
  const token = await getToken();
  if (!token) return { success: false, error: "Non authentifié." };
  return notifications.markAllAsRead(token);
}

export async function deleteNotification(notificationId: number) {
  const token = await getToken();
  if (!token) return { success: false, error: "Non authentifié." };
  return notifications.delete({ notificationId, token });
}
