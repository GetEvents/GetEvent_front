import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Check, Info, MapPin, Tag, Users } from "lucide-react";
import { getEventById } from "@/actions/event";
import { getUser } from "@/actions/auth/authActions";
import EventMap from "@/utils/map";
import EventActions from "./EventActions";
import styles from "./style.module.scss";

const formatDate = (value?: string | null) => {
  if (!value) return "À confirmer";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "À confirmer";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const getEventEnd = (date?: string | null, time?: string | null) => {
  if (!date) return null;
  const end = new Date(date);
  if (Number.isNaN(end.getTime())) return null;
  if (time) {
    const [hours = "0", minutes = "0"] = time.split(":");
    end.setHours(Number(hours), Number(minutes), 0, 0);
  }
  return end;
};

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  const [event, userResponse] = await Promise.all([
    getEventById(id),
    getUser(),
  ]);

  if (!event) notFound();

  const currentUser = userResponse?.user;
  const tickets = event.tickets || [];
  const isOwner = currentUser?.id === event.organisateurId;
  const currentTicket = tickets.find(
    (ticket) => ticket.userId === currentUser?.id,
  );
  const remainingPlaces = Math.max(0, event.capacity - tickets.length);
  const eventEnd = getEventEnd(event.endDate, event.endTime);
  // The request-time comparison intentionally decides whether server actions are available.
  // eslint-disable-next-line react-hooks/purity
  const isExpired = eventEnd ? eventEnd.getTime() < Date.now() : false;
  const organizer = event.organisateur;
  const organizerName = organizer
    ? `${organizer.prenom} ${organizer.nom}`
    : "Organisateur";
  const safeImage = (value: string) => value.replaceAll('"', "%22");

  return (
    <main className={styles.container}>
      <section
        className={styles.hero}
        style={{
          backgroundImage: `url("${safeImage(event.image)}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroInner}>
            <span className={styles.categoryBadge}>
              <Tag />
              {event.category || "Événement"}
            </span>
            <h1>{event.title}</h1>
            <div className={styles.heroBadges}>
              <span className={styles.badge}>
                <CalendarDays />
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </span>
              <span className={styles.badge}>
                <MapPin />
                {event.location}
              </span>
              <span className={styles.badge}>
                <Users />
                {tickets.length} participant(s)
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <div className={styles.grid}>
          <div className={styles.mainContent}>
            <section className={styles.card}>
              <header className={styles.cardHeader}>
                <h2>
                  <MapPin />
                  Localisation
                </h2>
              </header>
              <div className={styles.cardBody}>
                <EventMap title={event.title} location={event.location} />
              </div>
            </section>

            <section className={styles.card}>
              <header className={styles.cardHeader}>
                <h2>
                  <Info />À propos
                </h2>
              </header>
              <div className={styles.cardBody}>
                <p>{event.description}</p>
              </div>
            </section>

            {isOwner && (
              <section className={styles.card}>
                <header className={`${styles.cardHeader} ${styles.withBadge}`}>
                  <h2>
                    <Users />
                    Participants ({tickets.length})
                  </h2>
                  <span className={styles.capacityBadge}>
                    {remainingPlaces} / {event.capacity} places
                  </span>
                </header>
                <div className={styles.cardBody}>
                  {tickets.length ? (
                    <div className={styles.participantsList}>
                      {tickets.map((ticket) => {
                        const name = ticket.user
                          ? `${ticket.user.prenom} ${ticket.user.nom}`
                          : `Participant #${ticket.userId}`;
                        return (
                          <div
                            key={ticket.id}
                            className={styles.participantItem}
                          >
                            <div className={styles.participantInfo}>
                              <div
                                className={styles.participantAvatar}
                                style={
                                  ticket.user?.photo
                                    ? {
                                        backgroundImage: `url("${safeImage(ticket.user.photo)}")`,
                                        backgroundPosition: "center",
                                        backgroundSize: "cover",
                                      }
                                    : undefined
                                }
                              >
                                {!ticket.user?.photo && (
                                  <span className={styles.avatarLetter}>
                                    {name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div className={styles.participantDetails}>
                                <p className={styles.participantName}>{name}</p>
                                <p className={styles.participantEmail}>
                                  {ticket.user?.email || ticket.status}
                                </p>
                              </div>
                            </div>
                            <span className={styles.ticketStatus}>
                              {ticket.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <Users />
                      <p>Aucun participant inscrit pour cet événement.</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          <aside className={styles.sidebar}>
            <section className={styles.sidebarCard}>
              <header className={styles.sidebarHeader}>
                <h3>Billetterie</h3>
              </header>
              <div className={styles.sidebarBody}>
                <div
                  className={`${styles.priceSection} ${
                    event.paymentRequired ? "" : styles.free
                  }`}
                >
                  <p className={styles.priceLabel}>Pass standard</p>
                  <h2 className={styles.priceAmount}>
                    {event.paymentRequired
                      ? `${event.paymentPrice || 0} €`
                      : "Gratuit"}
                  </h2>
                  <p className={styles.priceNote}>
                    {event.paymentRequired
                      ? "Prix par participant"
                      : "Inscription libre"}
                  </p>
                </div>

                <div className={styles.features}>
                  <span className={styles.feature}>
                    <Check /> Confirmation immédiate
                  </span>
                  <span className={styles.feature}>
                    <Check /> Accès à l&apos;événement
                  </span>
                  <span className={styles.feature}>
                    <Check /> Billet personnel
                  </span>
                </div>

                <EventActions
                  eventId={event.id}
                  eventTitle={event.title}
                  isOwner={isOwner}
                  isRegistered={Boolean(currentTicket)}
                  ticketId={currentTicket?.id}
                  isExpired={isExpired}
                  isFull={remainingPlaces === 0}
                />

                <div className={styles.organizerInfo}>
                  <p className={styles.labelOrg}>Organisateur</p>
                  <div className={styles.organizerDetailsAvatar}>
                    <div
                      className={styles.organizerAvatar}
                      style={
                        organizer?.photo
                          ? {
                              backgroundImage: `url("${safeImage(organizer.photo)}")`,
                              backgroundPosition: "center",
                              backgroundSize: "cover",
                            }
                          : undefined
                      }
                    >
                      {!organizer?.photo && (
                        <span className={styles.avatarLetter}>
                          {organizerName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className={styles.organizerDetails}>
                      <p className={styles.organizerName}>{organizerName}</p>
                      {organizer?.email && (
                        <p className={styles.organizerEmail}>
                          {organizer.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.infoCards}>
                  <div className={styles.infoCard}>
                    <p className={styles.label}>Places disponibles</p>
                    <p className={styles.value}>
                      {remainingPlaces}
                      <span>/{event.capacity}</span>
                    </p>
                  </div>
                  <div className={styles.infoCard}>
                    <p className={styles.label}>Adresse</p>
                    <p className={styles.address}>{event.location}</p>
                  </div>
                </div>

                <Link href="/events" className={styles.backLink}>
                  Retour aux événements
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
