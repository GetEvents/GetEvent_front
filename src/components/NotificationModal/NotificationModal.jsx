"use client";

import { useEffect } from "react";
import {
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/actions/notification";
import styles from "./NotificationModal.module.scss";

export default function NotificationModal({
  isOpen,
  onClose,
  notifications,
  setNotifications,
  setNotificationCount,
}) {
  const notificationsData = Array.isArray(notifications) ? notifications : [];

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const updateParent = (nextNotifications) => {
    setNotifications?.(nextNotifications);
    setNotificationCount?.(
      nextNotifications.filter((notification) => !notification.isRead).length,
    );
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

  const formatTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
        aria-label="Fermer les notifications"
      />
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
      >
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <div className={styles.headerTitle}>
              <span aria-hidden="true">!</span>
              <h2 id="notifications-title">
                Notifications ({notificationsData.length})
              </h2>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>

          <div className={styles.modalBody}>
            {notificationsData.length ? (
              <div className={styles.notificationsList}>
                {notificationsData.map((notification) => (
                  <article
                    key={notification.id}
                    className={`${styles.notificationItem} ${
                      styles[notification.type || "info"] || styles.info
                    } ${notification.isRead ? styles.read : styles.unread}`}
                  >
                    <div className={styles.notificationIcon}>i</div>
                    <div className={styles.notificationContent}>
                      <h4>{notification.title || "Notification"}</h4>
                      <p>{notification.message}</p>
                      <span className={styles.notificationTime}>
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <div className={styles.notificationActions}>
                      {!notification.isRead && (
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Marquer comme lue"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(notification.id)}
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Aucune notification</p>
                <span>Vous êtes à jour.</span>
              </div>
            )}
          </div>

          {notificationsData.length > 0 && (
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.markAllBtn}
                onClick={handleMarkAllAsRead}
              >
                Marquer tout comme lu
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
