"use server";
import { cookies } from "next/headers";
import { participations, paymentsFedapay } from "../../services/api";
import { refreshAccessToken } from "@/actions/auth/authActions";
import { ParticipantsApiResponse } from "../types/participation";

const getToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value || (await refreshAccessToken());
};

export async function getParticipantByEventId(
  id: number,
): Promise<ParticipantsApiResponse | null> {
  const token = await getToken();

  if (!token) {
    return null;
  }

  try {
    const response = (await participations.getByEvent({
      eventId: id,
      token,
    })) as ParticipantsApiResponse;

    if (response.error) {
      return null;
    }

    return {
      error: false,
      message: response.message,
      participant: response.data,
    };
  } catch {
    return null!;
  }
}
export async function getAllParticipantByUser() {
  const token = await getToken();
  if (!token) {
    return null;
  }
  try {
    const response = await participations.getMyParticipationsId(token);
    if (!response.success) {
      return null;
    }

    return {
      error: false,
      message: response.message,
      participant: response.data.data,
    };
  } catch {
    return null;
  }
}

export async function addParticipantWithPayment(
  sessionId: string,
): Promise<{ error: boolean; message: string }> {
  const token = await getToken();

  if (!token) {
    return {
      error: true,
      message: "Vous devez être connecté pour finaliser l'inscription.",
    };
  }

  if (!sessionId.trim()) {
    return {
      error: true,
      message: "Session de paiement invalide.",
    };
  }

  try {
    const response = await paymentsFedapay.retrieveCheckoutSession({
      sessionId,
      token,
    });

    if (!response.success) {
      return {
        error: true,
        message: response.error || "Impossible de finaliser votre inscription.",
      };
    }

    const payload = response.data as {
      message?: string;
      data?: { message?: string };
    };

    return {
      error: false,
      message:
        payload.message ||
        payload.data?.message ||
        "Votre inscription est confirmée.",
    };
  } catch {
    return {
      error: true,
      message: "Une erreur est survenue lors de la finalisation.",
    };
  }
}

export async function getParticipantId(id: number) {
  const token = await getToken();

  if (!token) {
    return null;
  }

  try {
    let response = await participations.getById({
      eventId: id,
      token,
    });

    if (response.error) {
      return null;
    } else {
      return {
        error: false,
        message: response.message,
        participant: response.data,
      };
    }
  } catch {
    return null;
  }
}

export async function delectParticipant(id: number) {
  const token = await getToken();
  if (!token) {
    return null;
  }

  try {
    let response = await participations.delete({ id: id, token });

    if (!response.success) {
      return null;
    } else {
      return {
        error: false,
        message: response.message || "Participation supprimée",
        redirect: "/events",
      };
    }
  } catch {
    return null;
  }
}

export type UnsubscribeParticipantInput = {
  participantId: number;
  eventId: number;
  reason: string;
};

export type UnsubscribeParticipantResult = {
  error: boolean;
  message: string;
  refundRequired?: boolean;
  refundStatus?: string | null;
};

export async function unsubscribeParticipant({
  participantId,
  eventId,
  reason,
}: UnsubscribeParticipantInput): Promise<UnsubscribeParticipantResult> {
  const token = await getToken();
  const normalizedReason = reason.trim();

  if (!token) {
    return {
      error: true,
      message: "Vous devez être connecté pour retirer un participant.",
    };
  }

  if (!participantId || !eventId) {
    return {
      error: true,
      message: "Le participant, l'événement et la raison sont obligatoires.",
    };
  }

  try {
    const response = await participations.delete({
      id: participantId,
      eventId,
      reason: normalizedReason,
      token,
    });

    if (!response.success) {
      return {
        error: true,
        message: response.error || "Impossible de désinscrire ce participant.",
      };
    }

    const payload = response.data as {
      message?: string;
      data?: {
        message?: string;
        refundRequired?: boolean;
        refundStatus?: string | null;
      };
    };

    return {
      error: false,
      message:
        payload.data?.message ||
        payload.message ||
        "Le participant a bien été désinscrit.",
      refundRequired: Boolean(payload.data?.refundRequired),
      refundStatus: payload.data?.refundStatus ?? null,
    };
  } catch {
    return {
      error: true,
      message: "Une erreur est survenue pendant la désinscription.",
    };
  }
}

export async function isRegistered(eventId: number) {
  const token = await getToken();
  if (!token) {
    return null;
  }

  try {
    let response = await participations.isRegistered({
      token,
      eventId: eventId,
    });

    if (response.error) {
      return null;
    } else {
      return {
        error: false,
        message: response.message,
        isRegistered: response.data,
      };
    }
  } catch {
    return null;
  }
}

export async function validateTicketQrCode(
  qrCode: string,
  eventId: number,
): Promise<{ error: boolean; message: string }> {
  const normalizedQrCode = qrCode.trim();

  if (!normalizedQrCode || !Number.isInteger(eventId) || eventId <= 0) {
    return { error: true, message: "QR code ou événement invalide." };
  }

  const token = await getToken();

  if (!token) {
    return {
      error: true,
      message: "Vous devez être connecté pour valider un billet.",
    };
  }

  const response = await participations.validateQrCode({
    qrCode: normalizedQrCode,
    eventId,
    token,
  });

  if (!response.success) {
    return { error: true, message: response.error };
  }

  const payload = response.data as { message?: string };

  return {
    error: false,
    message: payload.message || "Entrée validée.",
  };
}
