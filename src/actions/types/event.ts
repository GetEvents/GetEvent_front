import { User } from "./auth";
import { PaymentProvider } from "./payement";

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
  priceId?: string | null;
  priceProvider?: PaymentProvider | null;
  paymentRequired: boolean;

  organisateur?: User;
}
