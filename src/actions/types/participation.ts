import type { Event } from "./event";

export type User = {
  id?: string | number;
  prenom?: string;
  nom?: string;
  email?: string;
  [key: string]: any;
};

export type Participant = {
  id: number;
  event: Event;
  paymentMethod?: "card" | "paypal" | string;
};

export type MyParticipationsApiPayload = {
  data: Participant[];
};

export type ParticipantsApiResponse = {
  error?: boolean;
  message?: string;
  participant?: { data: Participant[] } | Participant[];
  data?: any;
};

export type CreateParticipationResult = {
  success?: boolean;
  data?: any;
  error?: any;
  requiresPayment?: boolean;
  paymentUrl?: string;
  message?: string;
  redirect?: string;
};
