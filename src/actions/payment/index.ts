"use server";

import { cookies } from "next/headers";
import { refreshAccessToken } from "@/actions/auth/authActions";
import { paymentsStripe } from "@/services/api";

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
