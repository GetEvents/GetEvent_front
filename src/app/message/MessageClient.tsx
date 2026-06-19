"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Send } from "lucide-react";
import { isRegistered } from "@/actions/participant";
import type { EventMessage } from "@/actions/types/event";
import type { User } from "@/actions/types/auth";
import {
  getSocket,
  joinEvent,
  leaveEvent,
  onMessageReceived,
  onUserJoined,
  sendMessage,
  updateSocketAuth,
} from "@/socket";
import styles from "./style.module.scss";

type ChatSender = Pick<User, "id" | "nom" | "prenom" | "email" | "photo">;

type ChatMessage = {
  id: number | string;
  text: string;
  senderId?: number;
  sender?: Partial<ChatSender>;
  createdAt: string;
  self?: boolean;
  isSystem?: boolean;
};

type MessageClientProps = {
  eventId: number;
  token: string;
  currentUserId: number;
  organizerId: number;
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

export default function MessageClient({
  eventId,
  token,
  currentUserId,
  organizerId,
  initialMessages,
}: MessageClientProps) {
  const isOrganizer = String(currentUserId) === String(organizerId);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    mapInitialMessages(initialMessages, currentUserId),
  );
  const [canChat, setCanChat] = useState(isOrganizer);
  const [accessChecked, setAccessChecked] = useState(isOrganizer);
  const chatRef = useRef<HTMLDivElement>(null);
  const announcedJoinedUsersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    getSocket(token);
    updateSocketAuth(token);
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    if (isOrganizer) {
      joinEvent(eventId);
      return () => {
        leaveEvent(eventId);
      };
    }

    void isRegistered(eventId)
      .then((response) => {
        if (cancelled) return;

        const registrationValue = response?.isRegistered;
        const registered =
          typeof registrationValue === "object" && registrationValue !== null
            ? Boolean(
                "isRegistered" in registrationValue
                  ? registrationValue.isRegistered
                  : registrationValue,
              )
            : Boolean(registrationValue);

        setCanChat(registered);
        setAccessChecked(true);
        if (registered) joinEvent(eventId);
      })
      .catch(() => {
        if (!cancelled) {
          setCanChat(false);
          setAccessChecked(true);
        }
      });

    return () => {
      cancelled = true;
      leaveEvent(eventId);
    };
  }, [eventId, isOrganizer]);

  useEffect(() => {
    if (!canChat) return;

    const unsubscribeMessage = onMessageReceived((receivedMessage) => {
      if (String(receivedMessage.eventId) !== String(eventId)) return;

      setMessages((currentMessages) => {
        if (
          currentMessages.some(
            (currentMessage) =>
              String(currentMessage.id) === String(receivedMessage.id),
          )
        ) {
          return currentMessages;
        }

        const senderNameParts = receivedMessage.senderName?.trim().split(/\s+/);

        return [
          ...currentMessages,
          {
            id: receivedMessage.id,
            text: receivedMessage.text,
            senderId: receivedMessage.senderId,
            self: String(receivedMessage.senderId) === String(currentUserId),
            sender: {
              id: receivedMessage.senderId,
              prenom: senderNameParts?.[0] || "",
              nom: senderNameParts?.slice(1).join(" ") || "",
              email: receivedMessage.senderEmail || "",
              photo: receivedMessage.senderPhoto,
            },
            createdAt: receivedMessage.createdAt,
          },
        ];
      });
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
  }, [canChat, currentUserId, eventId]);

  useEffect(() => {
    const chat = chatRef.current;
    if (!chat) return;
    chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const content = message.trim();
      if (!content || !canChat) return;

      if (sendMessage({ eventId, text: content })) {
        setMessage("");
      }
    },
    [canChat, eventId, message],
  );

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
        {accessChecked && canChat && messages.length === 0 && (
          <p className={styles.noMessages}>Aucun message pour le moment.</p>
        )}

        {canChat &&
          messages.map((chatMessage) => (
            <article
              key={chatMessage.id}
              className={`${styles.message} ${
                chatMessage.isSystem
                  ? styles.systemMessage
                  : chatMessage.self
                    ? styles.myMessage
                    : styles.otherMessage
              }`}
            >
              {!chatMessage.self && !chatMessage.isSystem && (
                <div className={styles.senderInfo}>
                  <span className={styles.email}>
                    {chatMessage.sender?.email || "Participant"}
                  </span>
                  {String(chatMessage.sender?.id || chatMessage.senderId) ===
                    String(organizerId) && (
                    <span className={styles.creatorBadge}>Organisateur</span>
                  )}
                </div>
              )}

              <p className={styles.text}>{chatMessage.text}</p>

              {!chatMessage.isSystem && (
                <time className={styles.date} dateTime={chatMessage.createdAt}>
                  {formatTime(chatMessage.createdAt)}
                </time>
              )}
            </article>
          ))}
      </div>

      <div className={styles.inputBox}>
        {!accessChecked ? (
          <p className={styles.accessMessage}>Vérification de votre accès...</p>
        ) : canChat ? (
          <form onSubmit={handleSendMessage}>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Écrivez votre message..."
              aria-label="Votre message"
              autoComplete="off"
            />
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
