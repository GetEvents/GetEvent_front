"use server";

import { cookies } from "next/headers";
import { refreshAccessToken } from "@/actions/auth/authActions";
import { paymentsFedapay, paymentsStripe } from "@/services/api";
import type { Refund, RefundStatus } from "@/actions/types/payement";

type StripeStatusResult = {
  success: boolean;
  message: string;
  isComplete?: boolean;
};

type StripeAccountLinkResult = {
  success: boolean;
  message: string;
  accountLinkUrl?: string;
};

type OrganizerBalanceResult = {
  success: boolean;
  message: string;
  balance?: number;
  reservedBalance?: number;
  availableBalance?: number;
  currency?: string;
  updatedAt?: string | null;
};

type PayoutResult = {
  success: boolean;
  message: string;
  amount?: number;
};

const getToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value || (await refreshAccessToken());
};

export async function getStripeOnboardingStatus(): Promise<StripeStatusResult> {
  const token = await getToken();

  if (!token) {
    return {
      success: false,
      message: "Votre session a expiré.",
    };
  }

  const response = await paymentsStripe.getStripeOnboardingStatus(token);

  if (!response.success) {
    return {
      success: false,
      message: response.error || "Impossible de vérifier le compte Stripe.",
    };
  }

  const payload = response.data as {
    message?: string;
    data?: {
      isComplete?: boolean;
      details_submitted?: boolean;
      charges_enabled?: boolean;
    };
  };

  return {
    success: true,
    message: payload.message || "Statut Stripe récupéré.",
    isComplete: Boolean(
      payload.data?.isComplete ||
      payload.data?.details_submitted ||
      payload.data?.charges_enabled,
    ),
  };
}

export async function createSellerAccountLink(): Promise<StripeAccountLinkResult> {
  const token = await getToken();

  if (!token) {
    return {
      success: false,
      message: "Votre session a expiré.",
    };
  }

  const response = await paymentsStripe.createSellerAccountLink(token);

  if (!response.success) {
    return {
      success: false,
      message: response.error || "Impossible de créer le lien Stripe.",
    };
  }

  const payload = response.data as {
    message?: string;
    data?: { accountLinkUrl?: string };
  };

  if (!payload.data?.accountLinkUrl) {
    return {
      success: false,
      message: "Le lien de configuration Stripe est indisponible.",
    };
  }

  return {
    success: true,
    message: payload.message || "Lien Stripe créé.",
    accountLinkUrl: payload.data.accountLinkUrl,
  };
}

export async function getOrganizerBalance(): Promise<OrganizerBalanceResult> {
  const token = await getToken();

  if (!token) {
    return {
      success: false,
      message: "Votre session a expiré.",
    };
  }

  const response = await paymentsFedapay.getOrganizerBalance(token);

  if (!response.success) {
    return {
      success: false,
      message: response.error || "Impossible de récupérer votre solde.",
    };
  }

  const payload = response.data as {
    message?: string;
    data?: {
      balance?: number;
      reservedBalance?: number;
      availableBalance?: number;
      currency?: string;
      updatedAt?: string | null;
    };
  };

  return {
    success: true,
    message: payload.message || "Solde récupéré.",
    balance: Number(payload.data?.balance ?? 0),
    reservedBalance: Number(payload.data?.reservedBalance ?? 0),
    availableBalance: Number(payload.data?.availableBalance ?? 0),
    currency: payload.data?.currency || "XOF",
    updatedAt: payload.data?.updatedAt ?? null,
  };
}

export async function requestPayout(amount: number): Promise<PayoutResult> {
  const token = await getToken();

  if (!token) {
    return {
      success: false,
      message: "Votre session a expiré.",
    };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      success: false,
      message: "Le montant du retrait doit être supérieur à 0.",
    };
  }

  const response = await paymentsFedapay.requestPayout({ amount, token });

  if (!response.success) {
    return {
      success: false,
      message: response.error || "Impossible d'effectuer ce retrait.",
    };
  }

  const payload = response.data as {
    message?: string;
    data?: { amount?: number };
  };

  return {
    success: true,
    message: payload.message || "Retrait effectué.",
    amount: Number(payload.data?.amount ?? amount),
  };
}

export async function getRefunds(status = "PENDING"): Promise<{
  success: boolean;
  message: string;
  refunds: Refund[];
}> {
  const token = await getToken();

  if (!token) {
    return { success: false, message: "Votre session a expiré.", refunds: [] };
  }

  const response = await paymentsFedapay.getRefunds(token, status);

  if (!response.success) {
    return {
      success: false,
      message: response.error || "Impossible de récupérer les remboursements.",
      refunds: [],
    };
  }

  const payload = response.data as { message?: string; data?: Refund[] };
  return {
    success: true,
    message: payload.message || "Remboursements récupérés.",
    refunds: Array.isArray(payload.data) ? payload.data : [],
  };
}

export async function getMyRefunds(): Promise<{
  success: boolean;
  message: string;
  refunds: Refund[];
}> {
  const token = await getToken();

  if (!token) {
    return { success: false, message: "Votre session a expiré.", refunds: [] };
  }

  const response = await paymentsFedapay.getMyRefunds(token);

  if (!response.success) {
    return {
      success: false,
      message: response.error || "Impossible de récupérer vos remboursements.",
      refunds: [],
    };
  }

  const payload = response.data as { message?: string; data?: Refund[] };
  return {
    success: true,
    message: payload.message || "Remboursements récupérés.",
    refunds: Array.isArray(payload.data) ? payload.data : [],
  };
}

export async function updateRefundStatus({
  id,
  status,
  providerRefundId,
}: {
  id: string;
  status: Exclude<RefundStatus, "PENDING">;
  providerRefundId?: string;
}): Promise<{ success: boolean; message: string; refund?: Refund }> {
  const token = await getToken();

  if (!token) {
    return { success: false, message: "Votre session a expiré." };
  }

  const response = await paymentsFedapay.updateRefundStatus({
    id,
    status,
    providerRefundId,
    token,
  });

  if (!response.success) {
    return {
      success: false,
      message: response.error || "Impossible de traiter ce remboursement.",
    };
  }

  const payload = response.data as { message?: string; data?: Refund };
  return {
    success: true,
    message: payload.message || "Remboursement mis à jour.",
    refund: payload.data,
  };
}
