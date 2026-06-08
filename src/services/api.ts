/**
 * API Client - Gestion centralisée de toutes les requêtes API
 * À utiliser côté frontend (React/Next.js)
 */

import type {
  AuthApiResponse,
  ProfileApiResponse,
  UsersApiResponse,
} from "@/actions/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_ENDPOINT ||
  "http://localhost:3001";

// Helper pour les requêtes
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestOptions {
  headers?: Record<string, string>;
  body?: unknown;
  fetchOptions?: RequestInit;
}
type ApiResponse<T = unknown> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

// interface string {
//   token: string;
// }

interface IdTokenParam {
  id: number;
  token: string;
}

interface EventTokenParam {
  eventId: number;
  token: string;
}

interface FormTokenParam {
  formData: FormData;
  token: string;
}

interface GetAllParams {
  skip?: number;
  take?: number;
  search?: string;
}
interface NotificationParams {
  token: string;
  limit?: number;
  skip?: number;
}
interface NotificationAction {
  notificationId: string | number;
  token: string;
}

interface PaymentParam {
  eventid: number;
  token: string;
}

interface PaginationParams {
  skip?: number;
  take?: number;
}

const apiRequest = async <T = unknown>(
  method: HttpMethod,
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}/api${endpoint}`;

  const headers =
    options.body instanceof FormData
      ? {
          ...options.headers,
        }
      : {
          "Content-Type": "application/json",
          ...options.headers,
        };

  try {
    const response = await fetch(url, {
      method,
      headers,
      credentials: "include",
      body:
        options.body instanceof FormData
          ? options.body
          : options.body
            ? JSON.stringify(options.body)
            : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur API");
    }

    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";

    return {
      success: false,
      error: message,
    };
  }
};

// =====================================================
// AUTH API
// =====================================================

export const auth = {
  /**
   * Enregistrer un nouvel utilisateur
   * @param {FormData} formData - FormData avec nom, prenom, email, password, role, date_naissance, photo
   */
  register: async (
    formData: FormData,
  ): Promise<ApiResponse<AuthApiResponse>> => {
    const url = `${API_BASE_URL}/api/auth/register`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData, // FormData, pas JSON
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur enregistrement");
      }

      // Sauvegarder le token
      if (data.data?.token || data.token) {
        const token = data.data?.token || data.token;
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
        }
      }

      return { success: true, data: data as AuthApiResponse };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";

      return {
        success: false,
        error: message,
      };
    }
  },

  /**
   * Se connecter
   * @param {string} email
   * @param {string} password
   */
  login: async (email: string, password: string) => {
    const result = await apiRequest<AuthApiResponse>("POST", "/auth/login", {
      body: { email, password },
    });

    return result;
  },

  /**
   * Vérifier l'email
   */
  verifyEmail: async (token: string) => {
    return apiRequest("GET", "/auth/emailVerify", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Demander réinitialisation de mot de passe
   * @param {string} email
   */
  forgotPassword: async (email: string) => {
    return apiRequest("POST", "/auth/password/forgot", {
      body: { email },
    });
  },

  /**
   * Réinitialiser le mot de passe
   * @param {Object} params - { email, newPassword, token }
   */
  resetPassword: async (email: string, newPassword: string, token: string) => {
    return apiRequest("PATCH", "/auth/password/reset", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { email, newPassword, token: token },
    });
  },

  /**
   * Changer le mot de passe (authentifié)
   * @param {Object} params - { oldPassword, newPassword }
   */
  changePassword: async (oldPassword: string, newPassword: string) => {
    return apiRequest("POST", "/auth/change-password", {
      body: { oldPassword, newPassword },
    });
  },

  /**
   * Récupérer mon profil
   */
  getProfile: async (token: string) => {
    return apiRequest<ProfileApiResponse>("GET", "/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Mettre à jour le profil
   * @param {FormData} formData
   */
  updateProfile: async ({
    formData,
    token,
  }: FormTokenParam): Promise<ApiResponse<unknown>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/editProfil`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur mise à jour");
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";

      return {
        success: false,
        error: message,
      };
    }
  },

  /**
   * Récupérer tous les utilisateurs (admin)
   */
  getAllUsers: async (token: string) => {
    return apiRequest<UsersApiResponse>("GET", "/auth/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * Supprimer mon compte
   */
  deleteAccount: async (token: string) => {
    return apiRequest("DELETE", "/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Se déconnecter
   */
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    return { success: true };
  },
};

// =====================================================
// EVENTS API
// =====================================================

export const events = {
  /**
   * Créer un événement
   * @param {FormData} formData - FormData avec title, description, date, location, price, photo
   */
  create: async ({ formData, token }: FormTokenParam) => {
    const url = `${API_BASE_URL}/api/events/createEvent`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur création");
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      };
    }
  },

  /**
   * Mettre à jour un événement
   * @param {FormData} formData
   */
  update: async ({ formData, token }: FormTokenParam) => {
    const url = `${API_BASE_URL}/api/events/editEvent`;
    console.log("formData", formData);

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });

      console.log("response", response);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur mise à jour");
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      };
    }
  },

  /**
   * Supprimer un événement
   * @param {number} id
   */
  delete: async ({ id, token }: IdTokenParam) => {
    return apiRequest("DELETE", `/events/delectEvent?id=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * Récupérer tous les événements
   * @param {Object} params - { skip, take, search }
   */
  getAll: async (params: GetAllParams = {}) => {
    const queryString = new URLSearchParams();

    if (params.skip !== undefined) {
      queryString.set("skip", params.skip.toString());
    }

    if (params.take !== undefined) {
      queryString.set("take", params.take.toString());
    }

    if (params.search) {
      queryString.set("search", params.search);
    }

    return apiRequest("GET", `/events/getAllEvent?${queryString.toString()}`);
  },

  /**
   * Récupérer les détails d'un événement
   * @param {number} id
   */
  getById: async ({ id, token }: IdTokenParam) => {
    return apiRequest("GET", `/events/getEventById?id=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * Récupérer mes événements créés
   */
  getMyCreated: async (token: string) => {
    return apiRequest("GET", "/events/getEventByUser", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * Récupérer les événements auxquels je suis inscrit
   */
  getMyRegistered: async (token: string) => {
    return apiRequest("GET", "/events/my/registered", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * Récupérer mes statistiques d'événements
   */
  getMyStats: async (token: string) => {
    return apiRequest("GET", "/events/my/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// =====================================================
//  MESSAGES API
// =====================================================

export const messages = {
  /**
   * Créer un message
   * @param {Object} params - { eventId, text }
   */
  create: async (eventId: number, text: string) => {
    return apiRequest("POST", "/messages", {
      body: { eventId, text },
    });
  },

  /**
   * Récupérer un message
   * @param {number} id
   */
  getById: async (id: number) => {
    return apiRequest("GET", `/messages/${id}`);
  },

  /**
   * Récupérer tous les messages d'un événement
   * @param {number} eventId
   * @param {Object} params - { skip, take }
   */
  getByEvent: async (eventId: number, params: PaginationParams = {}) => {
    const query = new URLSearchParams();

    if (params.skip !== undefined) {
      query.set("skip", params.skip.toString());
    }

    if (params.take !== undefined) {
      query.set("take", params.take.toString());
    }
    return apiRequest("GET", `/messages/event/${eventId}?${query.toString()}`);
  },

  /**
   * Récupérer les messages d'un utilisateur
   * @param {number} userId
   * @param {Object} params - { skip, take }
   */
  getByUser: async (userId: number, params: PaginationParams = {}) => {
    const query = new URLSearchParams();

    if (params.skip !== undefined) {
      query.set("skip", params.skip.toString());
    }

    if (params.take !== undefined) {
      query.set("take", params.take.toString());
    }
    return apiRequest("GET", `/messages/user/${userId}?${query.toString()}`);
  },

  /**
   * Chercher des messages
   * @param {number} eventId
   * @param {string} searchText
   * @param {Object} params - { skip, take }
   */
  search: async (
    eventId: number,
    searchText: string,
    params: PaginationParams = {},
  ) => {
    const queryParams = { q: searchText, ...params };
    const query = new URLSearchParams();

    if (queryParams.skip !== undefined) {
      query.set("skip", queryParams.skip.toString());
    }

    if (queryParams.take !== undefined) {
      query.set("take", queryParams.take.toString());
    }
    return apiRequest(
      "GET",
      `/messages/event/${eventId}/search?${query.toString()}`,
    );
  },

  /**
   * Récupérer les statistiques
   * @param {number} eventId
   */
  getStats: async (eventId: number) => {
    return apiRequest("GET", `/messages/event/${eventId}/stats`);
  },

  /**
   * Mettre à jour un message
   * @param {number} id
   * @param {string} text
   */
  update: async (id: number, text: string) => {
    return apiRequest("PUT", `/messages/${id}`, {
      body: { text },
    });
  },

  /**
   * Supprimer un message
   * @param {number} id
   */
  delete: async (id: number) => {
    return apiRequest("DELETE", `/messages/${id}`);
  },

  /**
   * Supprimer tous les messages d'un événement (admin)
   * @param {number} eventId
   */
  deleteEventMessages: async (eventId: number) => {
    return apiRequest("DELETE", `/messages/event/${eventId}`);
  },
};

// =====================================================
// PARTICIPATIONS API
// =====================================================

export const participations = {
  /**
   * S'inscrire à un événement
   * @param {number} eventId
   */
  create: async ({ eventId, token }: EventTokenParam) => {
    console.log(eventId, token);

    const body = {
      eventId: eventId,
    };
    console.log("eventId", body);

    return apiRequest("POST", "/participations/", {
      body,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * Se désinscrire
   * @param {number} id
   */
  delete: async ({ id, token }: IdTokenParam) => {
    return apiRequest("DELETE", `/participations/id?id=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * Récupérer les participants d'un événement
   * @param {number} eventId
   */
  getByEvent: async ({ eventId, token }: EventTokenParam) => {
    return apiRequest(
      "GET",
      `/participations/event/eventId?eventId=${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  /**
   * Récupérer mes inscriptions
   */
  getMyParticipations: async (token: string) => {
    return apiRequest("GET", "/participations/my", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Récupérer un participant par ID d'événement
   * @param {number} eventId
   */
  getById: async ({ eventId, token }: EventTokenParam) => {
    return apiRequest(
      "GET",
      `/participations/event/eventId/me?eventId=${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },
  /**
   * Récupérer des participants par ID d'événement
   * @param {number} eventId
   */
  getMyParticipationsId: async (token: string) => {
    return apiRequest("GET", `/participations/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * Compter les participants
   * @param {number} eventId
   */
  count: async ({ token, eventId }: EventTokenParam) => {
    return apiRequest(
      "GET",
      `/participations/event/eventId/count?eventId=${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  /**
   * Vérifier si je suis inscrit
   * @param {number} eventId
   */
  isRegistered: async ({ token, eventId }: EventTokenParam) => {
    return apiRequest(
      "GET",
      `/participations/event/eventId/is-registered?eventId=${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },
};

// =====================================================
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
   * Supprimer toutes les notifications
   * @param {string} token
   */
  deleteAll: async (token: string) => {
    return apiRequest("DELETE", "/notifications/delete-all", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

// =====================================================
// PAYMENTS API
// =====================================================

export const paymentsStripe = {
  /**
   * Obtenir/créer un client Stripe
   */
  getOrCreateStripeCustomer: async (token: string) => {
    return apiRequest("POST", "/payments/getOrCreateStripeCustomer", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Alias rétrocompatible
   */
  getStripeCustomer: async (token: string) => {
    return apiRequest("POST", "/payments/getOrCreateStripeCustomer", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Créer une session de paiement pour la création d'événement
   */
  createPaymentSection: async ({ eventid, token }: PaymentParam) => {
    return apiRequest("POST", "/payments/createPaymentSection", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { eventid },
    });
  },

  /**
   * Alias rétrocompatible
   */
  createCheckoutSession: async ({
    eventid,
    token,
  }: {
    eventid: number;
    token: string;
  }) => {
    return apiRequest("POST", "/payments/createPaymentSection", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { eventid },
    });
  },

  /**
   * Récupérer une session de paiement
   */
  retrieveCheckoutSession: async ({
    sessionId,
    token,
  }: {
    sessionId: string;
    token: string;
  }) => {
    return apiRequest(
      "GET",
      `/payments/retrieveCheckoutSession?session_id=${sessionId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
  },

  /**
   * Créer un lien d'onboarding vendeur
   */
  createSellerAccountLink: async (token: string) => {
    return apiRequest("POST", "/payments/createSellerAccountLink", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Créer un lien de login Stripe Connect
   */
  createLoginLink: async (token: string) => {
    return apiRequest("POST", "/payments/createLoginLink", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Créer une session de paiement pour un participant
   */
  createPaymentPartSection: async ({
    eventid,
    token,
    paymentMethod = "card",
  }: {
    eventid: number;
    token: string;
    paymentMethod?: string;
  }) => {
    return apiRequest("POST", "/payments/createPaymentPartSection", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { eventid, paymentMethod },
    });
  },

  /**
   * Vérifier si l'onboarding Stripe est terminé
   */
  getStripeOnboardingStatus: async (token: string) => {
    return apiRequest("GET", "/payments/stripeOnboardingStatus", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

// =====================================================
// UTILITAIRES
// =====================================================

/**
 * Vérifier si le token est valide
 */
export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
};

/**
 * Obtenir le token
 */
export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

/**
 * Effacer le token
 */
export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

export default {
  auth,
  events,
  messages,
  participations,
  notifications,
  paymentsStripe,
  isAuthenticated,
  getToken,
  clearToken,
};
