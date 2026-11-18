import { apiRequest } from "./client";
import type { PaymentParam } from "./client";

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
export const paymentsFedapay = {
  getOrganizerBalance: async (token: string) => {
    return apiRequest("GET", "/payments/fedapay/balance", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  requestPayout: async ({
    amount,
    token,
  }: {
    amount: number;
    token: string;
  }) => {
    return apiRequest("POST", "/payments/fedapay/payout", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { amount },
    });
  },

  getRefunds: async (token: string, status?: string) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiRequest("GET", `/payments/refunds${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  getMyRefunds: async (token: string) => {
    return apiRequest("GET", "/payments/refunds/my", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  updateRefundStatus: async ({
    id,
    status,
    providerRefundId,
    token,
  }: {
    id: string;
    status: string;
    providerRefundId?: string;
    token: string;
  }) => {
    return apiRequest("PATCH", `/payments/refunds/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { status, providerRefundId },
    });
  },

  /**
   * Créer une session de paiement pour la création d'événement
   */
  createPaymentSection: async ({ eventid, token }: PaymentParam) => {
    return apiRequest("POST", "/payments/fedapay/session", {
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
    return apiRequest("GET", `/payments/fedapay/call?session_id=${sessionId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

// =====================================================
