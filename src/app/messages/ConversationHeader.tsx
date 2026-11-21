import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import styles from "./style.module.scss";

/** En-tête sombre de la page de discussion d'un événement. */
export default function ConversationHeader({
  eventId,
  title,
}: {
  eventId: number;
  title: string;
}) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.headerText}>
        <p className={styles.eyebrow}>
          <MessageCircle size={14} aria-hidden="true" />
          Conversation
        </p>
        <h1 className={styles.headerTitle}>{title}</h1>
        <p className={styles.headerHint}>
          Échangez avec l&apos;organisateur et les participants.
        </p>
      </div>
      <Link href={`/events/${eventId}`} className={styles.headerLink}>
        Voir l&apos;événement
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </header>
  );
}
