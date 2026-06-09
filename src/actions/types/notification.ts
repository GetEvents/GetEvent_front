import { User } from "./auth";

export interface Notification {
  id: number;
  userId: number;
  type: string;
  relatedType: string;
  relatedId?: number | null;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;

  user?: User;
  userRelet?: User | null;
}
