"use server";
import { cookies } from "next/headers";
import { participations, paymentsFedapay } from "../../services/api";
import { ParticipantsApiResponse } from "../types/participation";

export async function getParticipantByEventId(
  id: number,
): Promise<ParticipantsApiResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

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
  } catch (error) {
    console.error("Error fetching participant by event ID:", error);
    return null!;
  }
}
export async function getAllParticipantByUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
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
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

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
    console.log("response25", response);

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
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

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
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) {
    return null;
  }

  try {
    let response = await participations.delete({ id: id, token: token.value });

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

export async function isRegistered(eventId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) {
    return null;
  }

  try {
    let response = await participations.isRegistered({
      token: token.value,
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
