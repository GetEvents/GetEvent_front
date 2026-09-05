"use client";

import { useEffect, useRef } from "react";
import { savePushSubscriptionAction } from "@/actions/notification";

// Helper pour convertir la clé VAPID base64 en Uint8Array requis par pushManager
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushNotificationManagerProps {
  isLoggedIn: boolean;
}

const setupPushSubscription = async (
  registration: ServiceWorkerRegistration,
) => {
  try {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) return;

    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
    } else if (Notification.permission !== "granted") {
      return;
    }

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    }

    if (subscription) {
      await savePushSubscriptionAction(subscription.toJSON());
    }
  } catch {
    // Ignorer les erreurs d'activation push en arrière-plan
  }
};

export default function PushNotificationManager({
  isLoggedIn,
}: PushNotificationManagerProps) {
  const isRegisteredRef = useRef(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (isLoggedIn && !isRegisteredRef.current) {
          isRegisteredRef.current = true;
          setupPushSubscription(registration);
        }
      })
      .catch(() => {});
  }, [isLoggedIn]);

  return null;
}
