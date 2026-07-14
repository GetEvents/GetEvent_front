import type { User } from "./auth";
import type { PaymentProvider } from "./payement";

export type TicketStatus = "VALID" | "USED" | "CANCELLED";

export interface EventTicket {
  id: number;
  userId: number;
  eventId: number;
  qrCode: string;
  status: TicketStatus;
  createdAt: string;
  transactionId?: string | null;
  user?: User;
}

export interface EventMessage {
  id: number;
  text: string;
  createdAt: string;
  senderId: number;
  eventId: number;
  sender?: User;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  image: string;
  startDate?: string | null;
  startTime?: string | null;
  endDate?: string | null;
  endTime?: string | null;
  location: string;
  category?: string | null;
  capacity: number;
  organisateurId: number;
  paymentPrice?: number | null;
  currency: string;
  priceId?: string | null;
  priceProvider?: PaymentProvider | null;
  paymentRequired: boolean;
  organisateur?: User;
  tickets?: EventTicket[];
  messages?: EventMessage[];
}

export interface EventFilters {
  page?: number;
  search?: string;
  location?: string;
  category?: string;
  filter?: "recent" | "popular" | "price-asc" | "price-desc";
}

export interface EventActionState {
  error: boolean;
  message: string;
  redirect?: string;
}
