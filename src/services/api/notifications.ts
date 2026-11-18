import { apiRequest } from "./client";
import type { NotificationParams, NotificationAction } from "./client";

// NOTIFICATIONS API
// =====================================================

export const notifications = {
  /**
   * Récupérer les notifications de l'utilisateur
   * @param {Object} params - { limit, skip }
   */
  getAll: async ({ token, limit = 20, skip = 0 }: NotificationParams) => {
    const queryString = new URLSearchParams({
      limit: limit.toString(),
      skip: skip.toString(),
    }).toString();
    return apiRequest("GET", `/notifications?${queryString}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Récupérer les notifications non lues
   */
  getUnread: async (token: string) => {
    return apiRequest("GET", "/notifications/unread", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Marquer une notification comme lue
   * @param {string|number} notificationId
   * @param {string} token
   */
  markAsRead: async ({ notificationId, token }: NotificationAction) => {
    return apiRequest("PATCH", `/notifications/${notificationId}/read`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Marquer toutes les notifications comme lues
   * @param {string} token
   */
  markAllAsRead: async (token: string) => {
    return apiRequest("PATCH", "/notifications/read-all", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Supprimer une notification
   * @param {string|number} notificationId
   * @param {string} token
   */
  delete: async ({ notificationId, token }: NotificationAction) => {
    return apiRequest("DELETE", `/notifications/${notificationId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Enregistrer une souscription push
   */
  subscribePush: async ({
    subscription,
    token,
  }: {
    subscription: PushSubscriptionJSON;
    token: string;
  }) => {
    return apiRequest("POST", "/notifications/push/subscribe", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { subscription },
    });
  },

  /**
   * Supprimer une souscription push
   */
  unsubscribePush: async ({
    endpoint,
    token,
  }: {
    endpoint: string;
    token: string;
  }) => {
    return apiRequest("POST", "/notifications/push/unsubscribe", {
      headers: { Authorization: `Bearer ${token}` },
      body: { endpoint },
    });
  },
};

// =====================================================
