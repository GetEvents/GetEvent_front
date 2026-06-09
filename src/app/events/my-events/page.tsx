import Link from "next/link";
import { redirect } from "next/navigation";
import { getEventByUser } from "@/actions/event";
import { getUser } from "@/actions/auth/authActions";
import DeleteEventButton from "../_components/DeleteEventButton";
import styles from "./style.module.scss";

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("fr-FR") : "À confirmer";

export default async function MyEventsPage() {
  const userResponse = await getUser();
  if (!userResponse?.user) redirect("/auth/login");

  const events = await getEventByUser();

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p>Organisation</p>
            <h1>Mes événements</h1>
            <span>{events.length} événement(s) créé(s)</span>
          </div>
          <Link href="/events/createvent">Créer un événement</Link>
        </header>

        {events.length > 0 ? (
          <div className={styles.list}>
            {events.map((event) => {
              const ticketCount = event.tickets?.length || 0;

              return (
                <article key={event.id} className={styles.card}>
                  <img src={event.image} alt={event.title} />
                  <div className={styles.body}>
                    <div className={styles.titleRow}>
                      <div>
                        <p>{event.category || "Événement"}</p>
                        <h2>{event.title}</h2>
                      </div>
                      <strong>
                        {event.paymentRequired
                          ? `${event.paymentPrice || 0} €`
                          : "Gratuit"}
                      </strong>
                    </div>

                    <dl>
                      <div>
                        <dt>Date</dt>
                        <dd>{formatDate(event.startDate)}</dd>
                      </div>
                      <div>
                        <dt>Lieu</dt>
                        <dd>{event.location}</dd>
                      </div>
                      <div>
                        <dt>Participants</dt>
                        <dd>
                          {ticketCount} / {event.capacity}
                        </dd>
                      </div>
                    </dl>

                    <div className={styles.actions}>
                      <Link href={`/events/${event.id}`}>Voir</Link>
                      <Link href={`/events/editEvent/${event.id}`}>
                        Modifier
                      </Link>
                      <DeleteEventButton eventId={event.id} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <section className={styles.empty}>
            <h2>Vous n’avez encore créé aucun événement</h2>
            <p>Commencez par publier votre premier événement.</p>
            <Link href="/events/createvent">Créer maintenant</Link>
          </section>
        )}
      </div>
    </main>
  );
}
