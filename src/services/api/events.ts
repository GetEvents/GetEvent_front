import { API_BASE_URL, apiRequest } from "./client";
import type { IdTokenParam, FormTokenParam, GetAllParams } from "./client";

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
    try {
      const response = await fetch(url, {
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
    return apiRequest("DELETE", `/events/deleteEvent?id=${id}`, {
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

    if (params.page !== undefined) {
      queryString.set("page", params.page.toString());
    }

    if (params.search) {
      queryString.set("search", params.search);
    }

    if (params.location) queryString.set("location", params.location);
    if (params.category) queryString.set("category", params.category);
    if (params.filter) queryString.set("filter", params.filter);

    return apiRequest("GET", `/events/getAllEvent?${queryString.toString()}`);
  },

  /**
   * Récupérer les détails d'un événement
   * @param {number} id
   */
  getById: async ({ id, token }: { id: number; token?: string | null }) => {
    return apiRequest("GET", `/events/getEventById?id=${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
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
