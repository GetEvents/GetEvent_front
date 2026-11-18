import { apiRequest } from "./client";
import type { PaginationParams } from "./client";

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
   * Supprimer tous les messages d'un événement (ADMIN)
   * @param {number} eventId
   */
  deleteEventMessages: async (eventId: number) => {
    return apiRequest("DELETE", `/messages/event/${eventId}`);
  },
};

// =====================================================
