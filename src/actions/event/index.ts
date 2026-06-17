"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { events, participations } from "@/services/api";
import type {
  Event,
  EventActionState,
  EventFilters,
} from "@/actions/types/event";

const getToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value || null;
};

const requireToken = async (): Promise<string> => {
  const token = await getToken();
  if (!token) redirect("/auth/login");
  return token;
};

const getString = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const buildEventFormData = (formData: FormData): FormData => {
  const payload = new FormData();
  const fields = [
    "id",
    "title",
    "description",
    "startDate",
    "startTime",
    "endDate",
    "endTime",
    "location",
    "category",
    "capacity",
    "paymentPrice",
    "isFree",
  ];

  for (const field of fields) {
    const value = getString(formData, field);
    if (value) payload.set(field, value);
  }

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) payload.set("photo", photo);
  return payload;
};

const validateEvent = (
  formData: FormData,
  requireImage: boolean,
): string | null => {
  const requiredFields = [
    "title",
    "description",
    "startDate",
    "startTime",
    "endDate",
    "endTime",
    "location",
    "category",
    "capacity",
  ];

  if (requiredFields.some((field) => !getString(formData, field))) {
    return "Veuillez remplir tous les champs obligatoires.";
  }

  const capacity = Number(getString(formData, "capacity"));
  if (!Number.isInteger(capacity) || capacity < 1) {
    return "La capacité doit être un entier supérieur à zéro.";
  }

  const start = new Date(
    `${getString(formData, "startDate")}T${getString(formData, "startTime")}`,
  );
  const end = new Date(
    `${getString(formData, "endDate")}T${getString(formData, "endTime")}`,
  );

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "La date ou l’heure est invalide.";
  }
  if (end <= start) {
    return "La fin de l’événement doit être postérieure à son début.";
  }

  const isFree = getString(formData, "isFree") === "true";
  const paymentPrice = Number(getString(formData, "paymentPrice"));
  if (!isFree && (!Number.isFinite(paymentPrice) || paymentPrice <= 0)) {
    return "Le prix doit être supérieur à zéro pour un événement payant.";
  }

  const photo = formData.get("photo");
  console.log("Photo validation:", { photo, requireImage });
  if (requireImage && (!(photo instanceof File) || photo.size === 0)) {
    return "Une image de couverture est obligatoire.";
  }

  return null;
};

export async function getAllEvent(
  filters: EventFilters = {},
): Promise<{ events: Event[]; error?: string }> {
  const response = await events.getAll(filters);
  if (!response.success) return { events: [], error: response.error };
  return {
    events: (response.data as { events?: Event[] }).events || [],
  };
}

export async function getEventById(id: number | string): Promise<Event | null> {
  const token = await requireToken();
  const response = await events.getById({ id: Number(id), token });
  if (!response.success) return null;
  return (response.data as { event?: Event }).event || null;
}

export async function getEventByUser(): Promise<Event[]> {
  const token = await requireToken();
  const response = await events.getMyCreated(token);
  if (!response.success) return [];
  return (response.data as { events?: Event[] }).events || [];
}

export async function addEvent(
  _state: EventActionState | null,
  formData: FormData,
): Promise<EventActionState> {
  console.log("addEvent called with formData:", formData);
  const error = validateEvent(formData, true);
  if (error) return { error: true, message: error };

  const token = await requireToken();
  const response = await events.create({
    token,
    formData: buildEventFormData(formData),
  });

  return response.success
    ? {
        error: false,
        message: "Événement créé avec succès.",
        redirect: "/events/my-events",
      }
    : {
        error: true,
        message: response.error || "Impossible de créer l’événement.",
      };
}

export async function editeEvent(
  _state: EventActionState | null,
  formData: FormData,
): Promise<EventActionState> {
  const error = validateEvent(formData, false);
  if (error) return { error: true, message: error };

  const id = getString(formData, "id");
  if (!id) return { error: true, message: "Identifiant manquant." };

  const token = await requireToken();
  const response = await events.update({
    token,
    formData: buildEventFormData(formData),
  });

  return response.success
    ? {
        error: false,
        message: "Événement modifié avec succès.",
        redirect: `/events/${id}`,
      }
    : {
        error: true,
        message: response.error || "Impossible de modifier l’événement.",
      };
}

export async function delectEvent(id: number): Promise<EventActionState> {
  const token = await requireToken();
  const response = await events.delete({ id, token });
  return response.success
    ? {
        error: false,
        message: "Événement supprimé avec succès.",
        redirect: "/events/my-events",
      }
    : {
        error: true,
        message: response.error || "Impossible de supprimer l’événement.",
      };
}

export async function joinEvent(
  id: number,
): Promise<EventActionState & { paymentUrl?: string }> {
  const token = await requireToken();
  const response = await participations.create({ eventId: id, token });

  if (!response.success) {
    return {
      error: true,
      message: response.error || "Impossible de vous inscrire.",
    };
  }

  const payload = response.data as {
    message?: string;
    data?: { paymentUrl?: string };
  };

  return {
    error: false,
    message: payload.message || "Inscription réussie.",
    paymentUrl: payload.data?.paymentUrl,
  };
}

export async function leaveEvent(ticketId: number): Promise<EventActionState> {
  const token = await requireToken();
  const response = await participations.delete({ id: ticketId, token });

  return response.success
    ? { error: false, message: "Désinscription effectuée." }
    : {
        error: true,
        message: response.error || "Impossible de vous désinscrire.",
      };
}
