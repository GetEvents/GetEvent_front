"use client";

import { useEffect, useState, React } from "react";
import styles from "./NotificationModal.module.scss";
import {
  subscribeNotifications,
  onNotificationReceived,
  onNotificationUpdated,
  onNotificationDeleted,
} from "@/socket";
import {
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
} from "@/actions/notification";
import { getUser } from "@/actions/auth";

export default function NotificationModal({
  isOpen,
  onClose,
  notifications,
  setNotifications,
  setNotificationCount,
}) {
  const [notificationsData, setNotificationsData] = useState(
    notifications || [],
  );
  const [userId, setUserId] = useState(null);

  // ✅ Synchroniser avec les props quand elles changent
  useEffect(() => {
    if (notifications) {
      setNotificationsData(notifications);
    }
  }, [notifications]);

  // ✅ Initialiser les sockets et écouter les mises à jour
  useEffect(() => {
    if (!isOpen) return;

    let unsubNewNotif;
    let unsubUpdated;
    let unsubDeleted;

    const initNotifications = async () => {
      try {
        // ✅ Récupérer l'utilisateur via getUser()
        const userResponse = await getUser();
        const currentUserId = userResponse?.user?.id;

        if (currentUserId) {
          setUserId(currentUserId);
          subscribeNotifications(currentUserId);
        }
        // Écouter les nouvelles notifications
        unsubNewNotif = onNotificationReceived((notification) => {
          console.log("🔔 Nouvelle notification reçue:", notification);
          setNotificationsData((prev) => [notification, ...prev]);
        });

        // Écouter les mises à jour (lues/non lues)
        unsubUpdated = onNotificationUpdated((data) => {
          console.log("✏️ Notification mise à jour:", data);
          if (data.allRead) {
            setNotificationsData((prev) =>
              prev.map((n) => ({ ...n, isRead: true })),
            );
          } else if (data.notificationId) {
            setNotificationsData((prev) =>
              prev.map((n) =>
                n.id === data.notificationId ? { ...n, isRead: true } : n,
              ),
            );
          }
        });

        // Écouter les suppressions
        unsubDeleted = onNotificationDeleted((data) => {
          console.log("🗑️ Notification supprimée:", data.notificationId);
          setNotificationsData((prev) =>
            prev.filter((n) => n.id !== data.notificationId),
          );
        });
      } catch (error) {
        console.error("❌ Erreur init notifications:", error);
      }
    };

    initNotifications();

    return () => {
      unsubNewNotif?.();
      unsubUpdated?.();
      unsubDeleted?.();
    };
  }, [isOpen]);

  // ✅ Marquer une notification comme lue (Mise à jour optimiste)
  const handleMarkAsRead = async (notificationId) => {
    // Mise à jour optimiste immédiate
    setNotificationsData((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );

    // Mettre à jour le parent aussi
    if (setNotifications) {
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n,
        );
        if (setNotificationCount) {
          setNotificationCount(updated.filter((n) => !n?.isRead).length);
        }
        return updated;
      });
    }

    try {
      const response = await markNotificationAsRead(notificationId);
      if (!response?.success) {
        // Annuler la mise à jour en cas d'erreur
        setNotificationsData((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: false } : n,
          ),
        );
        if (setNotifications) {
          setNotifications((prev) => {
            const updated = prev.map((n) =>
              n.id === notificationId ? { ...n, isRead: false } : n,
            );
            if (setNotificationCount) {
              setNotificationCount(updated.filter((n) => !n?.isRead).length);
            }
            return updated;
          });
        }
        console.error("❌ Erreur lors du marquage:", response?.error);
      }
    } catch (error) {
      // Annuler la mise à jour en cas d'erreur
      setNotificationsData((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: false } : n,
        ),
      );
      if (setNotifications) {
        setNotifications((prev) => {
          const updated = prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: false } : n,
          );
          if (setNotificationCount) {
            setNotificationCount(updated.filter((n) => !n?.isRead).length);
          }
          return updated;
        });
      }
      console.error("❌ Erreur lors du marquage:", error);
    }
  };

  // ✅ Supprimer une notification (Mise à jour optimiste)
  const handleDelete = async (notificationId) => {
    // Stocker la notification en cas de besoin d'annulation
    const deletedNotification = notificationsData.find(
      (n) => n.id === notificationId,
    );

    // Mise à jour optimiste immédiate
    setNotificationsData((prev) => prev.filter((n) => n.id !== notificationId));

    // Mettre à jour le parent aussi
    if (setNotifications && setNotificationCount) {
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== notificationId);
        setNotificationCount(updated.filter((n) => !n?.isRead).length);
        return updated;
      });
    }

    try {
      const response = await deleteNotification(notificationId);
      if (!response?.success) {
        // Annuler la suppression en cas d'erreur
        if (deletedNotification) {
          setNotificationsData((prev) => [deletedNotification, ...prev]);
          if (setNotifications && setNotificationCount) {
            setNotifications((prev) => {
              const updated = [deletedNotification, ...prev];
              setNotificationCount(updated.filter((n) => !n?.isRead).length);
              return updated;
            });
          }
        }
        console.error("❌ Erreur lors de la suppression:", response?.error);
      }
    } catch (error) {
      // Annuler la suppression en cas d'erreur
      if (deletedNotification) {
        setNotificationsData((prev) => [deletedNotification, ...prev]);
        if (setNotifications && setNotificationCount) {
          setNotifications((prev) => {
            const updated = [deletedNotification, ...prev];
            setNotificationCount(updated.filter((n) => !n?.isRead).length);
            return updated;
          });
        }
      }
      console.error("❌ Erreur lors de la suppression:", error);
    }
  };

  // ✅ Marquer toutes les notifications comme lues
  const handleMarkAllAsRead = async () => {
    // Mise à jour optimiste
    setNotificationsData((prev) => prev.map((n) => ({ ...n, isRead: true })));

    if (setNotifications) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }

    if (setNotificationCount) {
      setNotificationCount(0);
    }

    try {
      const response = await markAllNotificationsAsRead();
      if (!response?.success) {
        console.error("❌ Erreur lors du marquage de tout:", response?.error);
      }
    } catch (error) {
      console.error("❌ Erreur lors du marquage de tout:", error);
    }
  };

  // Fermer avec Échap
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Formater la date
  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins}m`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;

    return notifDate.toLocaleDateString("fr-FR");
  };

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Modal */}
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <div className={styles.headerTitle}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <h2>Notifications ({notificationsData.length})</h2>
            </div>
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Fermer"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className={styles.modalBody}>
            {notificationsData && notificationsData.length > 0 ? (
              <div className={styles.notificationsList}>
                {notificationsData.map((notification) => (
                  <div
                    key={notification.id}
                    className={`${styles.notificationItem} ${styles[notification.type || "info"]} ${
                      notification.isRead ? styles.read : styles.unread
                    }`}
                  >
                    <div className={styles.notificationIcon}>
                      {notification.type === "error" && (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                      )}
                      {notification.type === "success" && (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      )}
                      {notification.type === "warning" && (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                        </svg>
                      )}
                      {(!notification.type || notification.type === "info") && (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                        </svg>
                      )}
                    </div>
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
                          className={styles.actionBtn}
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Marquer comme lue"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                      )}
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(notification.id)}
                        title="Supprimer"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <p>Aucune notification</p>
                <span>Vous êtes à jour ! 🎉</span>
              </div>
            )}
          </div>

          {/* Footer */}
          {notificationsData && notificationsData.length > 0 && (
            <div className={styles.modalFooter}>
              <button
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
