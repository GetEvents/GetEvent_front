/**
 * API Client - Gestion centralisée de toutes les requêtes API.
 * Point d'entrée unique : `import { events } from "@/services/api"`.
 */
import { auth } from "./auth";
import { events } from "./events";
import { messages } from "./messages";
import { notifications } from "./notifications";
import { participations } from "./participations";
import { paymentsFedapay, paymentsStripe } from "./payments";

export { auth, events, messages, notifications, participations };
export { paymentsFedapay, paymentsStripe };
export type { ApiResponse } from "./client";

const api = {
  auth,
  events,
  messages,
  participations,
  notifications,
  paymentsStripe,
};

export default api;
