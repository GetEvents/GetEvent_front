"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  CheckCircle2,
  X,
  XCircle,
} from "lucide-react";
import {
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/actions/notification";
import styles from "./NotificationModal.module.scss";

// Icône et libellé selon le type de notification.
const TYPE_META = {
  success: { Icon: CheckCircle2, label: "Confirmation" },
  info: { Icon: Bell, label: "Information" },
  warning: { Icon: AlertTriangle, label: "Attention" },
  error: { Icon: XCircle, label: "Problème" },
};

const toDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

// « Aujourd'hui », « Hier », puis « lundi 6 juillet ».
function dayLabel(value) {
  const date = toDate(value);
  if (!date) return "Plus tôt";
  const days = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) / 86_400_000,
  );
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

// « à l'instant », « il y a 5 minutes », « il y a 2 heures », puis l'heure.
function formatRelative(value) {
  const date = toDate(value);
  if (!date) return "";
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  return new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" }).format(date);
}

function formatFullDate(value) {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

/**
 * Centre de notifications : panneau latéral (bas d'écran sur mobile),
 * filtres « Toutes / Non lues », notifications groupées par jour.
 */
export default function NotificationModal({
  isOpen,
  onClose,
  notifications,
  setNotifications,
  setNotificationCount,
}) {
  const notificationsData = Array.isArray(notifications) ? notifications : [];
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const updateParent = (nextNotifications) => {
    const unread = nextNotifications.filter(
      (notification) => !notification.isRead,
    ).length;
    setNotifications?.(nextNotifications);
    setNotificationCount?.(unread);

    // Mettre à jour ou effacer le badge sur l'icône de l'app PWA
    if (typeof window !== "undefined" && "setAppBadge" in navigator) {
      if (unread > 0) {
        navigator.setAppBadge(unread).catch(() => {});
      } else {
        navigator.clearAppBadge().catch(() => {});
      }
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    const updated = notificationsData.map((notification) =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification,
    );
    updateParent(updated);

    const response = await markNotificationAsRead(notificationId);
    if (!response.success) {
      updateParent(notificationsData);
    }
  };

  const handleDelete = async (notificationId) => {
    const updated = notificationsData.filter(
      (notification) => notification.id !== notificationId,
    );
    updateParent(updated);

    const response = await deleteNotification(notificationId);
    if (!response.success) {
      updateParent(notificationsData);
    }
  };

  const handleMarkAllAsRead = async () => {
    const updated = notificationsData.map((notification) => ({
      ...notification,
      isRead: true,
    }));
    updateParent(updated);

    const response = await markAllNotificationsAsRead();
    if (!response.success) {
      updateParent(notificationsData);
    }
  };

  const unreadCount = notificationsData.filter(
    (notification) => !notification.isRead,
  ).length;

  const visibleNotifications =
    filter === "unread"
      ? notificationsData.filter((notification) => !notification.isRead)
      : notificationsData;

  // Regroupement par jour (liste courte : pas besoin de mémoïser, le
  // React Compiler s'en charge de toute façon).
  const groups = [];
  visibleNotifications.forEach((notification) => {
    const label = dayLabel(notification.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(notification);
    else groups.push({ label, items: [notification] });
  });

  if (!isOpen) return null;

  const tabs = [
    { id: "all", label: "Toutes", count: notificationsData.length },
    { id: "unread", label: "Non lues", count: unreadCount },
  ];

  return (
    <>
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
        aria-label="Fermer les notifications"
      />
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
      >
        {/* ---- En-tête sombre ---- */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <p className={styles.kicker}>
                <Bell size={13} aria-hidden="true" />
                Centre de notifications
              </p>
              <h2 id="notifications-title" className={styles.title}>
                Notifications
              </h2>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Fermer"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className={styles.tabs} role="tablist" aria-label="Filtrer">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={filter === tab.id}
                className={`${styles.tab} ${
                  filter === tab.id ? styles.tabActive : ""
                }`}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
                <span className={styles.tabCount}>{tab.count}</span>
              </button>
            ))}
          </div>
        </header>

        {/* ---- Liste ---- */}
        <div className={styles.body}>
          {groups.length ? (
            groups.map((group) => (
              <section key={group.label} className={styles.group}>
                <h3 className={styles.groupLabel}>{group.label}</h3>
                <ul className={styles.list}>
                  {group.items.map((notification) => {
                    const type = TYPE_META[notification.type]
                      ? notification.type
                      : "info";
                    const { Icon, label } = TYPE_META[type];
                    return (
                      <li
                        key={notification.id}
                        className={`${styles.item} ${styles[type]} ${
                          notification.isRead ? styles.read : styles.unread
                        }`}
                      >
                        <span className={styles.icon} aria-hidden="true">
                          <Icon size={18} />
                        </span>
                        <div className={styles.content}>
                          <p className={styles.itemTitle}>
                            {!notification.isRead && (
                              <span className={styles.dot} title="Non lue" />
                            )}
                            {notification.title || "Notification"}
                          </p>
                          {notification.message && (
                            <p className={styles.itemMessage}>
                              {notification.message}
                            </p>
                          )}
                          <p className={styles.meta}>
                            <span className={styles.typeLabel}>{label}</span>
                            <time
                              dateTime={notification.createdAt}
                              title={formatFullDate(notification.createdAt)}
                            >
                              {formatRelative(notification.createdAt)}
                            </time>
                          </p>
                        </div>
                        <div className={styles.actions}>
                          {!notification.isRead && (
                            <button
                              type="button"
                              className={styles.actionBtn}
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="Marquer comme lue"
                              aria-label="Marquer comme lue"
                            >
                              <Check size={16} aria-hidden="true" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDelete(notification.id)}
                            title="Supprimer"
                            aria-label="Supprimer"
                          >
                            <X size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon} aria-hidden="true">
                <BellOff size={26} />
              </span>
              <p>
                {filter === "unread" && notificationsData.length
                  ? "Aucune notification non lue"
                  : "Aucune notification"}
              </p>
              <span>Vous êtes à jour.</span>
            </div>
          )}
        </div>

        {/* ---- Pied ---- */}
        {unreadCount > 0 && (
          <footer className={styles.footer}>
            <button
              type="button"
              className={styles.markAllBtn}
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck size={17} aria-hidden="true" />
              Marquer tout comme lu
            </button>
          </footer>
        )}
      </div>
    </>
  );
}
