import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Info,
  MapPin,
  MessageCircle,
  Tag,
  Users,
} from "lucide-react";
import { getEventById } from "@/actions/event";
import { getTokenFromCookie, getUser } from "@/actions/auth/authActions";
import MessageClient from "@/app/message/MessageClient";
import EventMap from "@/utils/map";
import EventActions from "./EventActions";
import TicketQRCode from "./TicketQRCode";
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

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return {
      title: "Événement introuvable - GetEvent",
    };
  }

  const title = `${event.title} - GetEvent`;
  const description =
    event.description?.slice(0, 160) ||
    "Découvrez et participez à cet événement sur GetEvent.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: event.image ? [{ url: event.image }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: event.image ? [event.image] : [],
    },
  };
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  const [event, userResponse, tokenAuth] = await Promise.all([
    getEventById(id),
    getUser(),
    getTokenFromCookie(),
  ]);

  if (!event) notFound();

  const currentUser = userResponse?.user;
  const tickets = event.tickets || [];
  const isOwner = currentUser?.id === event.organisateurId;
  const activeTickets = tickets.filter(
    (ticket) => ticket.status !== "CANCELLED",
  );
  const userTickets = currentUser
    ? activeTickets.filter((ticket) => ticket.userId === currentUser.id)
    : [];
  const userTicketsCount = userTickets.length;
  const isRegistered = userTicketsCount > 0;
  const currentTicket = userTickets[0];
  const canAccessMessages = Boolean(
    currentUser && tokenAuth && (isRegistered || isOwner),
  );
  const remainingPlaces = Math.max(0, event.capacity - activeTickets.length);
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
      <section className={styles.hero}>
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className={styles.heroFallback} />
        )}
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroInner}>
            <div className={styles.heroTopRow}>
              <Link href="/events" className={styles.heroBackBtn}>
                <ArrowLeft size={16} aria-hidden="true" />
                <span>Retour aux événements</span>
              </Link>
              <span className={styles.categoryBadge}>
                <Tag size={14} aria-hidden="true" />
                {event.category || "Événement"}
              </span>
            </div>
            <h1>{event.title}</h1>
            <div className={styles.heroBadges}>
              <span className={styles.badge}>
                <CalendarDays size={18} aria-hidden="true" />
                <span>
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </span>
              </span>
              <span className={styles.badge}>
                <MapPin size={18} aria-hidden="true" />
                <span>{event.location}</span>
              </span>
              <span className={styles.badge}>
                <Users size={18} aria-hidden="true" />
                <span>
                  {activeTickets.length} participant
                  {activeTickets.length > 1 ? "s" : ""}
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <div className={styles.grid}>
          <div className={styles.mainContent}>
            {isRegistered && (
              <div className={styles.registeredBanner}>
                <div className={styles.registeredBannerIcon}>
                  <CheckCircle2 size={24} aria-hidden="true" />
                </div>
                <div className={styles.registeredBannerText}>
                  <p className={styles.registeredBannerTitle}>
                    Vous participez à cet événement !
                  </p>
                  <p className={styles.registeredBannerSubtitle}>
                    {userTicketsCount > 1
                      ? `Vous avez ${userTicketsCount} places réservées. Retrouvez vos billets et QR codes d'accès.`
                      : "Votre place est réservée. Présentez votre QR code d'accès à l'entrée."}
                  </p>
                </div>
                <Link
                  href="/participations"
                  className={styles.registeredBannerBtn}
                >
                  <span>Mes billets ({userTicketsCount})</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}

            <section className={styles.card}>
              <header className={styles.cardHeader}>
                <h2>
                  <Info aria-hidden="true" />À propos de l&apos;événement
                </h2>
              </header>
              <div className={styles.cardBody}>
                <p className={styles.eventDescription}>
                  {event.description ||
                    "Aucune description renseignée pour cet événement."}
                </p>
              </div>
            </section>

            <section className={styles.card}>
              <header className={styles.cardHeader}>
                <h2>
                  <MapPin aria-hidden="true" />
                  Localisation & Accès
                </h2>
              </header>
              <div className={styles.cardBody}>
                <EventMap title={event.title} location={event.location} />
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
            {canAccessMessages && currentUser && tokenAuth && (
              <section className={styles.card}>
                <header className={styles.cardHeader}>
                  <h2>
                    <MessageCircle />
                    Messagerie
                  </h2>
                </header>

                <div className={styles.cardBody}>
                  <MessageClient
                    key={event.id}
                    eventId={event.id}
                    token={tokenAuth}
                    currentUserId={currentUser.id}
                    organizerId={event.organisateurId}
                    initialMessages={event.messages || []}
                  />
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
                {!isRegistered && (
                  <div
                    className={`${styles.priceSection} ${
                      event.paymentRequired ? "" : styles.free
                    }`}
                  >
                    <p className={styles.priceLabel}>
                      Accès à l&apos;événement
                    </p>
                    <h2 className={styles.priceAmount}>
                      {event.paymentRequired
                        ? `${new Intl.NumberFormat("fr-FR").format(event.paymentPrice || 0)} FCFA`
                        : "Gratuit"}
                    </h2>
                    <p className={styles.priceNote}>
                      {event.paymentRequired
                        ? "Prix par participant"
                        : "Inscription libre et gratuite"}
                    </p>
                  </div>
                )}

                {isRegistered && currentTicket?.qrCode && (
                  <div className={styles.ticketBoxWrapper}>
                    <TicketQRCode
                      value={currentTicket.qrCode}
                      status={currentTicket.status}
                    />
                    {userTicketsCount > 1 && (
                      <div className={styles.multiTicketsNotice}>
                        <p>
                          Vous disposez de{" "}
                          <strong>{userTicketsCount} billets</strong> au total.
                        </p>
                        <Link
                          href="/participations"
                          className={styles.multiTicketsLink}
                        >
                          Voir tous mes billets & QR codes →
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.features}>
                  <span className={styles.feature}>
                    <Check /> Confirmation immédiate
                  </span>
                  <span className={styles.feature}>
                    <Check /> Accès à l&apos;événement
                  </span>
                  <span className={styles.feature}>
                    <Check /> Billet personnel avec QR code
                  </span>
                </div>

                <EventActions
                  eventId={event.id}
                  eventTitle={event.title}
                  isOwner={isOwner}
                  isRegistered={isRegistered}
                  ticketId={currentTicket?.id}
                  paymentRequired={event.paymentRequired}
                  isExpired={isExpired}
                  isFull={remainingPlaces === 0}
                  event={event}
                  userTicketsCount={userTicketsCount}
                />

                <div className={styles.organizerInfo}>
                  <p className={styles.labelOrg}>Organisé par</p>
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
                      <div className={styles.organizerNameRow}>
                        <p className={styles.organizerName}>{organizerName}</p>
                        <span
                          className={styles.verifiedOrganizerBadge}
                          title="Organisateur vérifié"
                        >
                          <Check size={11} aria-hidden="true" />
                        </span>
                      </div>
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
