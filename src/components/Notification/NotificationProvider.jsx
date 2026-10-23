"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import styles from "./NotificationProvider.module.scss";
import React from "react";

const NotificationContext = createContext(null);

const TYPE_STYLES = {
  success: styles.success,
  error: styles.error,
  info: styles.info,
};

const renderIcon = (type) => {
  switch (type) {
    case "success":
      return <CheckCircle size={18} aria-hidden="true" />;
    case "error":
      return <AlertCircle size={18} aria-hidden="true" />;
    default:
      return <Info size={18} aria-hidden="true" />;
  }
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
            <span className={styles.icon}>{renderIcon(notification.type)}</span>
            <p className={styles.message}>{notification.message}</p>
            <button
              type="button"
              onClick={() => removeNotification(notification.id)}
              className={styles.closeButton}
              aria-label="Fermer la notification"
            >
              <X size={16} aria-hidden="true" />
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
