"use client";

import { useEffect } from "react";
import { getTokenFromCookie } from "@/actions/auth/authActions";
import { useNotification } from "@/components/Notification/NotificationProvider";
import {
  getSocket,
  onConnectionStatusChange,
  onNotificationReceived,
  subscribeNotifications,
  unsubscribeNotifications,
  updateSocketAuth,
} from "@/components/socket";
import type { Notification } from "@/actions/types/notification";
import { NEW_NOTIFICATION_EVENT } from "./notification-events";

// Laisse passer d'abord les appels serveur de la page (Next.js les exécute
// l'un après l'autre) avant de demander le jeton pour le socket.
const CONNECT_DELAY_MS = 1500;
// Jeton expiré (15 min) : au plus un renouvellement par minute.
const TOKEN_REFRESH_INTERVAL_MS = 60_000;

const TOAST_TYPES = new Set(["success", "error", "info"]);

/**
 * Notifications en temps réel (Socket.IO) pour l'utilisateur connecté :
 * affiche un message à l'écran et prévient les pages qui listent les
 * notifications (événement NEW_NOTIFICATION_EVENT).
 */
export default function RealtimeNotifications({
  userId,
}: {
  userId?: number | null;
}) {
  const { notify } = useNotification() as {
    // eslint-disable-next-line no-unused-vars
    notify: (message: string, type?: string, duration?: number) => void;
  };

  useEffect(() => {
    if (!userId) return undefined;

    let active = true;
    let lastTokenRefresh = 0;
    const cleanups: Array<() => void> = [];

    // Le jeton est dans un cookie httpOnly : on le demande au serveur.
    const refreshToken = async () => {
      lastTokenRefresh = Date.now();
      const token = await getTokenFromCookie();
      return token ?? null;
    };

    const start = async () => {
      const token = await refreshToken();
      if (!active || !token) return;

      getSocket(token);
      subscribeNotifications(userId, token);

      cleanups.push(
        onNotificationReceived((notification: Notification) => {
          const text = [notification.title, notification.message]
            .filter(Boolean)
            .join(" — ");
          notify(
            text,
            TOAST_TYPES.has(notification.type) ? notification.type : "info",
            6000,
          );
          window.dispatchEvent(
            new CustomEvent(NEW_NOTIFICATION_EVENT, { detail: notification }),
          );
        }),
      );

      // Reconnexion refusée (jeton expiré) : nouveau jeton puis reconnexion.
      cleanups.push(
        onConnectionStatusChange((status) => {
          if (
            status !== "error" ||
            Date.now() - lastTokenRefresh < TOKEN_REFRESH_INTERVAL_MS
          ) {
            return;
          }
          void refreshToken().then((fresh) => {
            if (active && fresh) updateSocketAuth(fresh);
          });
        }),
      );
    };

    const timer = window.setTimeout(() => void start(), CONNECT_DELAY_MS);

    return () => {
      active = false;
      window.clearTimeout(timer);
      cleanups.forEach((cleanup) => cleanup());
      unsubscribeNotifications(userId);
    };
  }, [userId, notify]);

  return null;
}
