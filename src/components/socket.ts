"use client";

import { io, type Socket } from "socket.io-client";
import type { Notification } from "@/actions/types/notification";

type Id = number | string;
type Unsubscribe = () => void;

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface SocketMessage {
  id: number;
  eventId: number;
  text: string;
  senderId: number;
  senderName: string;
  senderPhoto?: string | null;
  createdAt: string;
  /** Identifiant temporaire envoyé par l'expéditeur (affichage immédiat). */
  clientId?: string;
}

/** Accusé de réception de l'envoi d'un message. */
export type SendMessageAck =
  | { ok: true; message: SocketMessage }
  | { ok: false; error: string };

// Au-delà, l'envoi est considéré comme échoué (le message peut être renvoyé).
const SEND_ACK_TIMEOUT_MS = 10_000;

interface MessageSentPayload {
  messageId: number;
  timestamp: string;
}

interface MessageEditedPayload extends MessageSentPayload {
  text: string;
}

interface UserPresencePayload {
  userId: number;
  userName: string;
  timestamp: string;
}

interface UserTypingPayload {
  userId: number;
  userName?: string;
}

interface SocketErrorPayload {
  message: string;
}

interface NotificationUpdatedPayload {
  notificationId?: number;
  isRead?: boolean;
  allRead?: boolean;
  timestamp?: string;
}

interface NotificationDeletedPayload {
  notificationId: number;
  timestamp?: string;
}

/* eslint-disable no-unused-vars */
interface ServerToClientEvents {
  messageReceived: (message: SocketMessage) => void;
  messageSent: (payload: MessageSentPayload) => void;
  messageEdited: (payload: MessageEditedPayload) => void;
  messageDeleted: (payload: MessageSentPayload) => void;
  userJoined: (payload: UserPresencePayload) => void;
  userLeft: (payload: UserPresencePayload) => void;
  userTyping: (payload: UserTypingPayload) => void;
  userStoppedTyping: (payload: Pick<UserTypingPayload, "userId">) => void;
  "new-notification": (notification: Notification) => void;
  "notification-updated": (payload: NotificationUpdatedPayload) => void;
  "notification-deleted": (payload: NotificationDeletedPayload) => void;
  error: (error: SocketErrorPayload) => void;
}

interface ClientToServerEvents {
  joinEvent: (eventId: Id) => void;
  leaveEvent: (eventId: Id) => void;
  sendMessage: (
    payload: { eventId: Id; text: string; clientId?: string },
    ack: (response: SendMessageAck) => void,
  ) => void;
  editMessage: (payload: { messageId: Id; eventId: Id; text: string }) => void;
  deleteMessage: (payload: { messageId: Id; eventId: Id }) => void;
  startTyping: (eventId: Id) => void;
  stopTyping: (eventId: Id) => void;
  "subscribe-notifications": (userId: Id) => void;
  "unsubscribe-notifications": (userId: Id) => void;
  "notification:read": (payload: { notificationId: Id }) => void;
  "notification:read-all": () => void;
  "notification:delete": (payload: { notificationId: Id }) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

type ConnectionListener = (status: ConnectionStatus, error?: Error) => void;
type SocketEmitter = (client: AppSocket) => void;
/* eslint-enable no-unused-vars */

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_ENDPOINT ||
  "http://localhost:3001";

let socket: AppSocket | null = null;
let currentToken: string | null = null;
let connectionStatus: ConnectionStatus = "disconnected";

const connectionListeners = new Set<ConnectionListener>();
const joinedEvents = new Set<Id>();
const notificationSubscriptions = new Set<Id>();

const notifyConnectionListeners = (status: ConnectionStatus, error?: Error) => {
  connectionStatus = status;
  connectionListeners.forEach((listener) => listener(status, error));
};

const resubscribe = (client: AppSocket) => {
  joinedEvents.forEach((eventId) => client.emit("joinEvent", eventId));
  notificationSubscriptions.forEach((userId) =>
    client.emit("subscribe-notifications", userId),
  );
};

const configureSocket = (client: AppSocket) => {
  client.on("connect", () => {
    notifyConnectionListeners("connected");
    resubscribe(client);
  });

  client.on("disconnect", () => {
    notifyConnectionListeners("disconnected");
  });

  client.on("connect_error", (error) => {
    notifyConnectionListeners("error", error);
  });
};

const connect = (client: AppSocket) => {
  if (client.connected || client.active) return;
  notifyConnectionListeners("connecting");
  client.connect();
};

export const getSocket = (token?: string | null): AppSocket => {
  if (typeof window === "undefined") {
    throw new Error(
      "Le client Socket.IO est disponible uniquement côté client.",
    );
  }

  if (token !== undefined) currentToken = token;

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      auth: currentToken ? { token: currentToken } : {},
    });
    configureSocket(socket);
  } else if (token !== undefined) {
    socket.auth = currentToken ? { token: currentToken } : {};
  }

  connect(socket);
  return socket;
};

const emitWhenConnected = (
  emitter: SocketEmitter,
  token?: string | null,
): boolean => {
  const client = getSocket(token);

  if (client.connected) {
    emitter(client);
    return true;
  }

  client.once("connect", () => emitter(client));
  return true;
};

export const isSocketConnected = () => Boolean(socket?.connected);

export const getConnectionStatus = () => connectionStatus;

export const onConnectionStatusChange = (
  callback: ConnectionListener,
): Unsubscribe => {
  connectionListeners.add(callback);
  callback(connectionStatus);
  return () => connectionListeners.delete(callback);
};

export const joinEvent = (eventId: Id): boolean => {
  if (!eventId) return false;
  joinedEvents.add(eventId);
  const client = getSocket();
  if (client.connected) client.emit("joinEvent", eventId);
  return true;
};

export const leaveEvent = (eventId: Id): boolean => {
  if (!eventId) return false;
  joinedEvents.delete(eventId);
  if (socket?.connected) socket.emit("leaveEvent", eventId);
  return true;
};

/**
 * Envoie un message. `onAck` reçoit la réponse du serveur (message
 * enregistré, ou erreur), ou une erreur après SEND_ACK_TIMEOUT_MS.
 */
export const sendMessage = ({
  eventId,
  text,
  clientId,
  onAck,
  socket: providedSocket,
}: {
  eventId: Id;
  text: string;
  clientId?: string;
  // eslint-disable-next-line no-unused-vars
  onAck?: (response: SendMessageAck) => void;
  socket?: AppSocket;
}): boolean => {
  const content = text.trim();
  if (!eventId || !content) return false;

  // Une seule réponse par envoi, au plus tard SEND_ACK_TIMEOUT_MS après
  // l'appel, même si la connexion n'est jamais établie.
  const startedAt = Date.now();
  let settled = false;
  const settle = (response: SendMessageAck) => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timer);
    onAck?.(response);
  };
  const timer = window.setTimeout(
    () =>
      settle({
        ok: false,
        error: "Le serveur ne répond pas. Réessayez.",
      }),
    SEND_ACK_TIMEOUT_MS,
  );

  const emit = (client: AppSocket) => {
    // Délai déjà écoulé avant la connexion : on n'envoie plus (le message
    // est marqué « non envoyé », l'utilisateur peut le renvoyer).
    if (settled) return;
    const remaining = Math.max(
      1000,
      SEND_ACK_TIMEOUT_MS - (Date.now() - startedAt),
    );
    client
      .timeout(remaining)
      .emit(
        "sendMessage",
        { eventId, text: content, clientId },
        (error: Error | null, response: SendMessageAck) => {
          settle(
            error
              ? { ok: false, error: "Le serveur ne répond pas. Réessayez." }
              : response,
          );
        },
      );
  };

  if (providedSocket?.connected) {
    emit(providedSocket);
    return true;
  }

  return emitWhenConnected(emit);
};

export const editMessage = (
  messageId: Id,
  eventId: Id,
  text: string,
): boolean => {
  const content = text.trim();
  if (!messageId || !eventId || !content) return false;
  return emitWhenConnected((client) =>
    client.emit("editMessage", { messageId, eventId, text: content }),
  );
};

export const deleteMessage = (messageId: Id, eventId: Id): boolean => {
  if (!messageId || !eventId) return false;
  return emitWhenConnected((client) =>
    client.emit("deleteMessage", { messageId, eventId }),
  );
};

export const startTyping = (eventId: Id): boolean => {
  if (!eventId) return false;
  return emitWhenConnected((client) => client.emit("startTyping", eventId));
};

export const stopTyping = (eventId: Id): boolean => {
  if (!eventId) return false;
  return emitWhenConnected((client) => client.emit("stopTyping", eventId));
};

const addListener = <EventName extends keyof ServerToClientEvents>(
  eventName: EventName,
  callback: ServerToClientEvents[EventName],
): Unsubscribe => {
  const client = getSocket();
  client.on(eventName, callback as never);
  return () => client.off(eventName, callback as never);
};

export const onMessageReceived = (
  callback: ServerToClientEvents["messageReceived"],
) => addListener("messageReceived", callback);

export const onMessageSent = (callback: ServerToClientEvents["messageSent"]) =>
  addListener("messageSent", callback);

export const onMessageEdited = (
  callback: ServerToClientEvents["messageEdited"],
) => addListener("messageEdited", callback);

export const onMessageDeleted = (
  callback: ServerToClientEvents["messageDeleted"],
) => addListener("messageDeleted", callback);

export const onUserJoined = (callback: ServerToClientEvents["userJoined"]) =>
  addListener("userJoined", callback);

export const onUserLeft = (callback: ServerToClientEvents["userLeft"]) =>
  addListener("userLeft", callback);

export const onUserTyping = (callback: ServerToClientEvents["userTyping"]) =>
  addListener("userTyping", callback);

export const onUserStoppedTyping = (
  callback: ServerToClientEvents["userStoppedTyping"],
) => addListener("userStoppedTyping", callback);

export const onSocketError = (callback: ServerToClientEvents["error"]) =>
  addListener("error", callback);

export const subscribeNotifications = (
  userId: Id,
  token?: string | null,
): boolean => {
  if (!userId) return false;
  notificationSubscriptions.add(userId);
  const client = getSocket(token);
  if (client.connected) client.emit("subscribe-notifications", userId);
  return true;
};

export const unsubscribeNotifications = (userId: Id): boolean => {
  if (!userId) return false;
  notificationSubscriptions.delete(userId);
  if (socket?.connected) socket.emit("unsubscribe-notifications", userId);
  return true;
};

export const onNotificationReceived = (
  callback: ServerToClientEvents["new-notification"],
) => addListener("new-notification", callback);

export const onNotificationUpdated = (
  callback: ServerToClientEvents["notification-updated"],
) => addListener("notification-updated", callback);

export const onNotificationDeleted = (
  callback: ServerToClientEvents["notification-deleted"],
) => addListener("notification-deleted", callback);

export const markNotificationReadRealtime = (notificationId: Id): boolean => {
  if (!notificationId) return false;
  return emitWhenConnected((client) =>
    client.emit("notification:read", { notificationId }),
  );
};

export const markAllNotificationsReadRealtime = (): boolean =>
  emitWhenConnected((client) => client.emit("notification:read-all"));

export const deleteNotificationRealtime = (notificationId: Id): boolean => {
  if (!notificationId) return false;
  return emitWhenConnected((client) =>
    client.emit("notification:delete", { notificationId }),
  );
};

export const updateSocketAuth = (token: string | null): void => {
  const tokenChanged = token !== currentToken;
  currentToken = token;
  const client = getSocket(token);

  // Même jeton et déjà connecté : rien à refaire (une reconnexion retarderait
  // la discussion et les notifications).
  if (!tokenChanged && client.connected) return;

  if (client.connected) client.disconnect();
  connect(client);
};

export const reconnectSocket = (): void => {
  connect(getSocket(currentToken));
};

export const disconnectSocket = (): void => {
  if (!socket) return;

  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  currentToken = null;
  joinedEvents.clear();
  notificationSubscriptions.clear();
  notifyConnectionListeners("disconnected");
};
