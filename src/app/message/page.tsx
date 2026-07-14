import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTokenFromCookie, getUser } from "@/actions/auth/authActions";
import { getEventById } from "@/actions/event";
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
    getUser(),
    getTokenFromCookie(),
    getEventById(eventId),
  ]);

  if (!userResponse?.user || !token) {
    redirect(`/auth/login?from=/message?eventId=${eventId}`);
  }

  if (!event) notFound();

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Conversation</p>
          <h1>{event.title}</h1>
        </div>
        <Link href={`/events/${event.id}`}>Voir l&apos;événement</Link>
      </header>

      <MessageClient
        key={event.id}
        eventId={event.id}
        token={token}
        currentUserId={userResponse.user.id}
        organizerId={event.organisateurId}
        initialMessages={event.messages || []}
      />
    </main>
  );
}
