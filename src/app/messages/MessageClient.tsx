"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { RotateCcw, Send } from "lucide-react";
import type { EventMessage } from "@/actions/types/event";
import type { User } from "@/actions/types/auth";
import {
  getSocket,
  joinEvent,
  leaveEvent,
  onMessageReceived,
  onSocketError,
  onUserJoined,
  sendMessage,
  type SendMessageAck,
  type SocketMessage,
} from "@/socket";
import styles from "./style.module.scss";

type ChatSender = Pick<User, "id" | "nom" | "prenom" | "photo">;

type ChatMessage = {
  id: number | string;
  text: string;
  senderId?: number;
  sender?: Partial<ChatSender>;
  createdAt: string;
  self?: boolean;
  isSystem?: boolean;
  /** Identifiant temporaire du navigateur (message envoyé depuis ici). */
  clientId?: string;
  /** pending : affiché tout de suite, en attente du serveur ; failed : échec. */
  status?: "pending" | "failed";
};

type MessageClientProps = {
  eventId: number;
  token: string;
  currentUserId: number;
  currentUser?: Partial<ChatSender>;
  organizerId: number;
  /** Accès vérifié côté serveur (organisateur, admin ou billet valide). */
  canChat: boolean;
  initialMessages: EventMessage[];
};

const mapInitialMessages = (
  initialMessages: EventMessage[],
  currentUserId: number,
): ChatMessage[] =>
  initialMessages.map((message) => ({
    id: message.id,
    text: message.text,
    senderId: message.senderId,
    sender: message.sender,
    self: String(message.senderId) === String(currentUserId),
    createdAt: message.createdAt,
  }));

const newClientId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function MessageClient({
  eventId,
  token,
  currentUserId,
  currentUser,
  organizerId,
  canChat,
  initialMessages,
}: MessageClientProps) {
  const [message, setMessage] = useState("");
  const [socketError, setSocketError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    mapInitialMessages(initialMessages, currentUserId),
  );
  const chatRef = useRef<HTMLDivElement>(null);
  const announcedJoinedUsersRef = useRef<Set<string>>(new Set());

  // Connexion (réutilisée si déjà ouverte, par exemple pour les
  // notifications) puis entrée dans la discussion, sans attendre.
  useEffect(() => {
    getSocket(token);
  }, [token]);

  useEffect(() => {
    if (!canChat) return;

    joinEvent(eventId);

    return () => {
      leaveEvent(eventId);
    };
  }, [canChat, eventId]);

  // Message confirmé par le serveur : remplace sa version provisoire (même
  // clientId) ou s'ajoute, sans doublon.
  const upsertServerMessage = useCallback(
    (received: SocketMessage) => {
      setMessages((currentMessages) => {
        const confirmed: ChatMessage = {
          id: received.id,
          text: received.text,
          senderId: received.senderId,
          self: String(received.senderId) === String(currentUserId),
          sender: {
            id: received.senderId,
            prenom: received.senderName?.trim().split(/\s+/)[0] || "",
            nom: received.senderName?.trim().split(/\s+/).slice(1).join(" "),
            photo: received.senderPhoto,
          },
          createdAt: received.createdAt,
        };

        if (
          received.clientId &&
          currentMessages.some((item) => item.clientId === received.clientId)
        ) {
          return currentMessages
            .filter(
              (item) =>
                item.clientId === received.clientId ||
                String(item.id) !== String(received.id),
            )
            .map((item) =>
              item.clientId === received.clientId
                ? // clientId conservé : même clé React, pas de clignotement.
                  { ...confirmed, clientId: received.clientId }
                : item,
            );
        }

        if (
          currentMessages.some(
            (item) => String(item.id) === String(received.id),
          )
        ) {
          return currentMessages;
        }

        return [...currentMessages, confirmed];
      });
    },
    [currentUserId],
  );

  useEffect(() => {
    if (!canChat) return;

    const unsubscribeMessage = onMessageReceived((receivedMessage) => {
      if (String(receivedMessage.eventId) !== String(eventId)) return;
      upsertServerMessage(receivedMessage);
    });

    const unsubscribeUserJoined = onUserJoined((data) => {
      const joinedUserId = String(data.userId);
      const joinMessage = `${data.userName} a rejoint la conversation`;

      if (
        joinedUserId === String(currentUserId) ||
        announcedJoinedUsersRef.current.has(joinedUserId)
      ) {
        return;
      }

      announcedJoinedUsersRef.current.add(joinedUserId);

      setMessages((currentMessages) => {
        const joinAlreadyDisplayed = currentMessages.some(
          (currentMessage) =>
            currentMessage.isSystem && currentMessage.text === joinMessage,
        );

        if (joinAlreadyDisplayed) return currentMessages;

        return [
          ...currentMessages,
          {
            id: `join-${joinedUserId}`,
            text: joinMessage,
            isSystem: true,
            createdAt: data.timestamp,
          },
        ];
      });
    });

    return () => {
      unsubscribeMessage();
      unsubscribeUserJoined();
    };
  }, [canChat, currentUserId, eventId, upsertServerMessage]);

  useEffect(() => {
    return onSocketError((error) => {
      setSocketError(error.message || "Une erreur est survenue.");
    });
  }, []);

  // Défile en bas à chaque nouveau message, et quand le dernier change
  // d'état (« Non envoyé · Réessayer » ajoute une ligne sous la bulle).
  const lastMessageState = `${messages.length}:${messages.at(-1)?.status ?? ""}`;
  useEffect(() => {
    const chat = chatRef.current;
    if (!chat) return;
    chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
  }, [lastMessageState, socketError]);

  // Envoi d'un message déjà affiché (nouveau ou renvoi après échec).
  const deliver = useCallback(
    (clientId: string, text: string) => {
      const handleAck = (response: SendMessageAck) => {
        if (response.ok) {
          upsertServerMessage(response.message);
          return;
        }
        setMessages((currentMessages) =>
          currentMessages.map((item) =>
            item.clientId === clientId ? { ...item, status: "failed" } : item,
          ),
        );
        setSocketError(response.error);
      };

      const sent = sendMessage({
        eventId,
        text,
        clientId,
        onAck: handleAck,
      });
      if (!sent) handleAck({ ok: false, error: "Message invalide." });
    },
    [eventId, upsertServerMessage],
  );

  const handleSendMessage = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const content = message.trim();
      if (!content || !canChat) return;

      // Affichage immédiat, confirmé ensuite par le serveur.
      const clientId = newClientId();
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `local-${clientId}`,
          clientId,
          text: content,
          senderId: currentUserId,
          sender: currentUser,
          self: true,
          createdAt: new Date().toISOString(),
          status: "pending",
        },
      ]);
      setMessage("");
      setSocketError("");
      deliver(clientId, content);
    },
    [canChat, currentUser, currentUserId, deliver, message],
  );

  const handleRetry = (failedMessage: ChatMessage) => {
    if (!failedMessage.clientId) return;
    setSocketError("");
    setMessages((currentMessages) =>
      currentMessages.map((item) =>
        item.clientId === failedMessage.clientId
          ? { ...item, status: "pending" }
          : item,
      ),
    );
    deliver(failedMessage.clientId, failedMessage.text);
  };

  const formatTime = (date: string) => {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className={styles.container} aria-label="Conversation">
      <div ref={chatRef} className={styles.chatBox} aria-live="polite">
        {canChat && messages.length === 0 && (
          <p className={styles.noMessages}>Aucun message pour le moment.</p>
        )}

        {canChat &&
          messages.map((chatMessage) => (
            <article
              key={chatMessage.clientId || chatMessage.id}
              className={`${styles.message} ${
                chatMessage.isSystem
                  ? styles.systemMessage
                  : chatMessage.self
                    ? styles.myMessage
                    : styles.otherMessage
              } ${chatMessage.status === "pending" ? styles.pending : ""} ${
                chatMessage.status === "failed" ? styles.failed : ""
              }`}
            >
              {!chatMessage.self && !chatMessage.isSystem && (
                <div className={styles.senderInfo}>
                  <span className={styles.senderName}>
                    {[chatMessage.sender?.prenom, chatMessage.sender?.nom]
                      .filter(Boolean)
                      .join(" ") || "Participant"}
                  </span>
                  {String(chatMessage.sender?.id || chatMessage.senderId) ===
                    String(organizerId) && (
                    <span className={styles.creatorBadge}>Organisateur</span>
                  )}
                </div>
              )}

              <p className={styles.text}>{chatMessage.text}</p>

              {!chatMessage.isSystem && chatMessage.status === "failed" ? (
                <button
                  type="button"
                  className={styles.retryButton}
                  onClick={() => handleRetry(chatMessage)}
                >
                  <RotateCcw size={13} aria-hidden="true" />
                  Non envoyé · Réessayer
                </button>
              ) : (
                !chatMessage.isSystem && (
                  <time
                    className={styles.date}
                    dateTime={chatMessage.createdAt}
                  >
                    {chatMessage.status === "pending"
                      ? "Envoi…"
                      : formatTime(chatMessage.createdAt)}
                  </time>
                )
              )}
            </article>
          ))}
      </div>

      <div className={styles.inputBox}>
        {socketError && (
          <p className={styles.errorMessage} role="alert">
            {socketError}
          </p>
        )}
        {canChat ? (
          <form onSubmit={handleSendMessage}>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Écrivez votre message..."
              aria-label="Votre message"
              autoComplete="off"
              maxLength={2000}
            />
            <span className={styles.characterCount} aria-live="polite">
              {message.length}/2000
            </span>
            <button
              type="submit"
              disabled={!message.trim()}
              aria-label="Envoyer le message"
              title="Envoyer"
            >
              <span className={styles.buttonText}>Envoyer</span>
              <Send className={styles.buttonIcon} aria-hidden="true" />
            </button>
          </form>
        ) : (
          <p className={styles.accessMessage}>
            Vous devez participer à cet événement pour envoyer des messages.
          </p>
        )}
      </div>
    </section>
  );
}
