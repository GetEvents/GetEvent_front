import type { Event, EventTicket, TicketStatus } from "./event";

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
  eventId?: number;
  userId?: number;
  qrCode?: string;
  status?: TicketStatus;
  paymentMethod?: "card" | "paypal" | string;
};

export type ParticipationTicket = {
  id: number | string;
  event: Event;
  qrCode: string;
  status?: TicketStatus;
};

export type ParticipationTicketRecord = Partial<EventTicket> & {
  id?: number | string;
  event?: Event;
  title?: string;
  tickets?: EventTicket[];
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
