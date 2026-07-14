"use server";
import { cookies } from "next/headers";
import { participations, payments } from "../../services/api";
export async function addParticipant({ id, event, paymentMethod = "card" }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  try {
    if (!token?.value) {
      return {
        error: true,
        message: "Utilisateur non authentifié",
      };
    }

    // Vérifier si l'événement est payant
    if (event?.paymentRequired) {
      const paymentResponse = await payments.createPaymentPartSection({
        eventid: id,
        token: token.value,
        paymentMethod,
      });

      if (paymentResponse.success && paymentResponse.data?.data) {
        return {
          error: false,
          requiresPayment: true,
          paymentUrl: paymentResponse.data.data,
          message: "Redirection vers le paiement...",
        };
      }

      return {
        error: true,
        message:
          paymentResponse.error ||
          "Erreur lors de la création de la session de paiement",
      };
    }

    // // Si l'événement est gratuit, inscrire directement le participant
    const response = await participations.create({
      eventId: id,
      token: token.value,
    });

    if (!response.success) {
      return {
        error: true,
        message: response.error || "Erreur lors de l'inscription",
      };
    }

    return {
      error: false,
      message: response.data?.message || "Inscription réussie",
      redirect: "/events",
    };
  } catch (error) {
    return {
      error: true,
      message: `Error: ${error?.message || error}`,
    };
  }
}

export async function getParticipantByEventId(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  try {
    let response = await participations.getByEvent({
      eventId: id,
      token: token.value,
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
export async function getAllParticipantByUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  try {
    let response = await participations.getMyParticipationsId({
      token: token.value,
    });

    if (response.error) {
      return null;
    } else {
      return {
        error: false,
        message: response.message,
        participant: response.data.data,
      };
    }
  } catch {
    return null;
  }
}
export async function getParticipantId(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  try {
    let response = await participations.getById({
      eventId: id,
      token: token.value,
    });

    if (response.error) {
      return null;
    } else {
      return {
        error: false,
        message: response.data.message,
        participant: response.data,
      };
    }
  } catch {
    return null;
  }
}

export async function delectParticipant(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  try {
    let response = await participations.delete({ id: id, token: token.value });

    if (!response.success) {
      return null;
    } else {
      return {
        error: false,
        message: response.data?.message || "Participation supprimée",
        redirect: "/events",
      };
    }
  } catch {
    return null;
  }
}

export async function isRegistered(eventId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

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
        isRegistered: response.data.data.isRegistered,
      };
    }
  } catch {
    return null;
  }
}

export async function addParticipantWithPayment(sessionId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  try {
    if (!token?.value) {
      return {
        error: true,
        message: "Utilisateur non authentifié",
      };
    }

    // Récupérer les détails de la session de paiement
    const paymentResponse = await payments.retrieveCheckoutSession(
      sessionId,
      token.value,
    );
    if (!paymentResponse.success || !paymentResponse.data) {
      return {
        error: true,
        message: "Impossible de vérifier le paiement",
      };
    }

    // Extraire l'eventId depuis les métadonnées de la session
    const eventId = paymentResponse.data.data.session.metadata.eventId;

    if (!eventId) {
      return {
        error: true,
        message: "Informations de l'évènement manquantes",
      };
    }

    // Créer la participation avec le sessionId comme preuve de paiement
    const response = await participations.create({
      eventId: parseInt(eventId),
      token: token.value,
      sessionId: sessionId,
    });

    if (!response.success || !response.data) {
      const errorText = response.error;
      return {
        error: true,
        message: errorText || "Erreur lors de l'inscription",
      };
    }

    if (response.error) {
      return {
        error: true,
        message: response.message || "Erreur lors de l'inscription",
      };
    }

    return {
      error: false,
      message: "Inscription réussie",
      redirect: "/participations",
    };
  } catch (error) {
    return {
      error: true,
      message: `Erreur: ${error.message}`,
    };
  }
}
