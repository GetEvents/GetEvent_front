"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import styles from "./NotificationProvider.module.scss";
import React from "react";

const NotificationContext = createContext(null);

const TYPE_STYLES = {
  success: styles.success,
  error: styles.error,
  info: styles.info,
};

const ICONS = {
  success: "fa-circle-check",
  error: "fa-circle-xmark",
  info: "fa-circle-info",
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  const notify = useCallback(
    (message, type = "info", duration = 3500) => {
      if (!message) return;

      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      setNotifications((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    [removeNotification],
  );

  const value = useMemo(
    () => ({ notify, removeNotification }),
    [notify, removeNotification],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <div className={styles.container}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`${styles.notification} ${
              TYPE_STYLES[notification.type] || TYPE_STYLES.info
            }`}
            role="status"
            aria-live="polite"
          >
            <span className={styles.icon}>
              <i
                className={`fa-solid ${ICONS[notification.type] || ICONS.info}`}
                aria-hidden="true"
              />
            </span>
            <p className={styles.message}>{notification.message}</p>
            <button
              type="button"
              onClick={() => removeNotification(notification.id)}
              className={styles.closeButton}
              aria-label="Fermer la notification"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification doit être utilisé dans NotificationProvider",
    );
  }

  return context;
}
