import { User } from "./auth";

export interface Message {
  id: number;
  text: string;
  createdAt: string;
  senderId: number;
  eventId: number;

  sender?: User;
  event?: Event;
}
