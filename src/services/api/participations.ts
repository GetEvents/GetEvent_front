import type { MyParticipationsApiPayload } from "@/actions/types/participation";
import { apiRequest } from "./client";
import type {
  UnsubscribeParticipantParam,
  EventTokenParam,
  QrCodeTokenParam,
} from "./client";

// PARTICIPATIONS API
// =====================================================

export const participations = {
  /**
   * S'inscrire à un événement
   * @param {number} eventId
   */
  create: async ({ eventId, quantity = 1, token }: EventTokenParam) => {
    const body = {
      eventId: eventId,
      quantity: quantity,
    };

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
  delete: async ({
    id,
    token,
    eventId,
    reason,
  }: UnsubscribeParticipantParam) => {
    return apiRequest("DELETE", `/participations/id?id=${id}`, {
      body:
        eventId !== undefined || reason
          ? {
              eventId,
              reason,
            }
          : undefined,
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
    return apiRequest<MyParticipationsApiPayload>("GET", `/participations/my`, {
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

  validateQrCode: async ({ token, qrCode, eventId }: QrCodeTokenParam) => {
    return apiRequest("POST", "/participations/qr-code/validate", {
      body: { qrCode, eventId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// =====================================================
