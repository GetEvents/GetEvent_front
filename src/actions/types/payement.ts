import { User } from "./auth";
import type { Event } from "./event";

export type PaymentProvider = "STRIPE" | "FEDAPAY";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export type TicketStatus = "VALID" | "USED" | "CANCELLED";

export type PayoutStatus = "PENDING" | "SENT" | "FAILED";

export type RefundStatus = "PENDING" | "COMPLETED" | "FAILED" | "REJECTED";

export interface Ticket {
  id: number;
  userId: number;
  eventId: number;
  qrCode: string;
  status: TicketStatus;
  createdAt: string;
  transactionId?: string | null;

  user?: User;
  event?: Event;
  transaction?: Transaction | null;
}

export interface Transaction {
  id: string;
  userId: number;
  eventId: number;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerId: string;
  providerTransactionId?: number | null;
  status: PaymentStatus;
  organizerCreditedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  user?: User;
  event?: Event;
  tickets?: Ticket[];
}

export interface OrganizerBalance {
  id: string;
  organizerId: number;
  balance: number;
  reservedBalance: number;
  updatedAt: string;

  organizer?: User;
}

export interface Refund {
  id: string;
  ticketId: number;
  transactionId: string;
  requestedById: number;
  amount: number;
  organizerAmount: number;
  currency: string;
  reason?: string | null;
  status: RefundStatus;
  providerRefundId?: string | null;
  createdAt: string;
  updatedAt: string;
  ticket?: Ticket;
  transaction?: Transaction;
  requestedBy?: User;
}

export interface PayoutHistory {
  id: string;
  organizerId: number;
  amount: number;
  status: PayoutStatus;
  fedapayPayoutId?: string | null;
  createdAt: string;
  updatedAt: string;

  organizer?: User;
}
