"use client";

import { useEffect, useRef, useState } from "react";
import { savePushSubscriptionAction } from "@/actions/notification";
import styles from "./PushNotificationManager.module.scss";

const DISMISSED_KEY = "getevent-push-notification-dismissed";

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

const subscribeSilently = async (reg: ServiceWorkerRegistration) => {
  try {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
    }
    if (sub) {
      // eslint-disable-next-line no-console
      console.log(
        "[Push] Envoi de la souscription au serveur...",
        sub.endpoint,
      );
      const res = await savePushSubscriptionAction(sub.toJSON());
      // eslint-disable-next-line no-console
      console.log("[Push] Résultat serveur:", res);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[Push] Erreur d'enregistrement push:", err);
  }
};

export default function PushNotificationManager({
  isLoggedIn,
}: PushNotificationManagerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registrationRef.current = reg;

        // Si la permission a déjà été accordée par le passé
        if (Notification.permission === "granted") {
          subscribeSilently(reg);
          return;
        }

        // Si l'utilisateur est connecté et que la permission est 'default' (non encore demandée)
        const isDismissed = sessionStorage.getItem(DISMISSED_KEY) === "true";
        if (
          isLoggedIn &&
          Notification.permission === "default" &&
          !isDismissed
        ) {
          const timer = setTimeout(() => setShowBanner(true), 2000);
          return () => clearTimeout(timer);
        }
      })
      .catch(() => {});
  }, [isLoggedIn]);

  const handleRequestPermission = async () => {
    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      setShowBanner(false);

      if (permission === "granted" && registrationRef.current) {
        await subscribeSilently(registrationRef.current);
      }
    } catch {
      setShowBanner(false);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DISMISSED_KEY, "true");
    }
  };

  if (!showBanner) return null;

  return (
    <aside
      className={styles.banner}
      aria-label="Autorisation des notifications"
    >
      <div className={styles.content}>
        <div className={styles.icon} aria-hidden="true">
          🔔
        </div>
        <div className={styles.text}>
          <h3 className={styles.title}>Activer les notifications</h3>
          <p className={styles.description}>
            Recevez vos billets, rappels d&apos;événements et alertes en direct.
          </p>
        </div>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.enableButton}
          onClick={handleRequestPermission}
          disabled={isSubscribing}
        >
          {isSubscribing ? "Activation..." : "Activer"}
        </button>
        <button
          type="button"
          className={styles.dismissButton}
          onClick={handleDismiss}
        >
          Plus tard
        </button>
      </div>
    </aside>
  );
}
