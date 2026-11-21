import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTokenFromCookie } from "@/actions/auth/authActions";
import { getCurrentUser, getEventDetails } from "@/lib/server-data";
import ConversationHeader from "./ConversationHeader";
import MessageClient from "./MessageClient";
import styles from "./style.module.scss";

type MessagePageProps = {
  searchParams: Promise<{
    eventId?: string | string[];
  }>;
};

export default async function MessagePage({ searchParams }: MessagePageProps) {
  const eventIdParam = (await searchParams).eventId;
  const eventIdValue = Array.isArray(eventIdParam)
    ? eventIdParam[0]
    : eventIdParam;
  const eventId = Number(eventIdValue);

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return (
      <main className={styles.page}>
        <div className={styles.emptyState}>
          <h1>Messagerie</h1>
          <p>Sélectionnez un événement pour ouvrir sa conversation.</p>
          <Link href="/events">Voir les événements</Link>
        </div>
      </main>
    );
  }

  const [userResponse, token, event] = await Promise.all([
    getCurrentUser(),
    getTokenFromCookie(),
    getEventDetails(eventId),
  ]);

  if (!userResponse?.user || !token) {
    redirect(`/auth/login?from=/messages?eventId=${eventId}`);
  }

  if (!event) notFound();

  // Accès à la discussion, calculé ici (le serveur Socket.IO le revérifie) :
  // la page rejoint la conversation tout de suite, sans appel de plus.
  const user = userResponse.user;
  const canChat =
    user.role === "ADMIN" ||
    String(user.id) === String(event.organisateurId) ||
    (event.tickets || []).some(
      (ticket) =>
        String(ticket.userId) === String(user.id) &&
        ticket.status !== "CANCELLED",
    );

  return (
    <main className={styles.page}>
      <ConversationHeader eventId={event.id} title={event.title} />

      <MessageClient
        key={event.id}
        eventId={event.id}
        token={token}
        currentUserId={user.id}
        currentUser={{
          id: user.id,
          prenom: user.prenom,
          nom: user.nom,
          photo: user.photo,
        }}
        organizerId={event.organisateurId}
        canChat={canChat}
        initialMessages={event.messages || []}
      />
    </main>
  );
}
