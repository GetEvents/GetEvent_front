"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Ticket, { TicketSkeleton } from "@/components/ui/Ticket";
import { getMyRefunds } from "@/actions/payment";
import { useAuth } from "@/hooks/useAuth";
import { useTicketsByUser } from "@/hooks/useParticipants";
import style from "./style.module.scss";

type TicketList = NonNullable<ReturnType<typeof useTicketsByUser>["data"]>;
type TicketGroup = { event: TicketList[number]["event"]; tickets: TicketList };

/** Fin de l'événement (dernier jour, 23:59) : passé ce moment, il est terminé. */
const eventEndTime = (event: TicketGroup["event"]) => {
  const value = event?.endDate || event?.startDate;
  if (!value) return Number.POSITIVE_INFINITY;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY;
  date.setHours(23, 59, 59, 999);
  return date.getTime();
};

const eventStartTime = (event: TicketGroup["event"]) => {
  const time = event?.startDate ? new Date(event.startDate).getTime() : NaN;
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
};

export default function ParticipationsPage() {
  const { user, loading: authLoading } = useAuth();
  const ticketsQuery = useTicketsByUser(
    user?.id,
    !authLoading && Boolean(user),
  );
  const ticketsData = ticketsQuery.data;

  const refundsQuery = useQuery({
    queryKey: ["payments", "refunds", "mine", user?.id],
    queryFn: getMyRefunds,
    enabled: !authLoading && Boolean(user),
  });
  const refundsData = refundsQuery.data?.refunds;
  const refunds = useMemo(() => refundsData || [], [refundsData]);

  // Un billet annulé ou ayant une demande de remboursement (en attente,
  // remboursé…) n'est plus un billet utilisable : il n'apparaît ni dans les
  // billets à venir ni dans les passés, seulement dans « Mes remboursements ».
  // Le backend les exclut déjà ; ce filtre couvre une liste en cache pas
  // encore rafraîchie après la demande.
  const refundedTicketIds = useMemo(
    () => new Set(refunds.map((refund) => String(refund.ticketId))),
    [refunds],
  );
  const tickets = useMemo(
    () =>
      (ticketsData || []).filter(
        (t) =>
          t.status?.toUpperCase() !== "CANCELLED" &&
          !refundedTicketIds.has(String(t.id)),
      ),
    [ticketsData, refundedTicketIds],
  );

  // Heure de référence fixée à l'ouverture de la page.
  const [now] = useState(() => Date.now());

  // Billets groupés par événement, puis répartis entre « à venir » (le plus
  // proche d'abord) et « passés » (le plus récent d'abord).
  const { upcoming, past } = useMemo(() => {
    const map = new Map<number | string, TicketGroup>();
    for (const t of tickets) {
      const eventId = t.event?.id;
      if (!eventId) continue;
      if (!map.has(eventId)) {
        map.set(eventId, { event: t.event, tickets: [] });
      }
      map.get(eventId)!.tickets.push(t);
    }
    const groups = Array.from(map.values());
    return {
      upcoming: groups
        .filter((g) => eventEndTime(g.event) >= now)
        .sort((a, b) => eventStartTime(a.event) - eventStartTime(b.event)),
      past: groups
        .filter((g) => eventEndTime(g.event) < now)
        .sort((a, b) => eventStartTime(b.event) - eventStartTime(a.event)),
    };
  }, [tickets, now]);
  const [timeline, setTimeline] = useState<"upcoming" | "past">("upcoming");
  const shownGroups = timeline === "past" ? past : upcoming;
  // Même chiffre que l'onglet « À venir » : des événements, pas des places
  // (un achat de 3 places pour un événement compte pour 1).
  const upcomingCount = upcoming.length;

  const loading = authLoading || ticketsQuery.isPending;

  const refundStatusLabels = {
    PENDING: "En attente",
    COMPLETED: "Remboursé",
    FAILED: "Échec",
    REJECTED: "Refusé",
  };

  return (
    <main className={style.parent_container}>
      <header className={style.header_section}>
        <div className={style.header_content}>
          <div className={style.header_text}>
            <p className={style.eyebrow}>Votre portefeuille</p>
            <h1 className={style.main_title}>Mes billets</h1>
            <p className={style.description}>
              Retrouvez vos accès et présentez leur QR code à l’entrée.
            </p>
          </div>
          <div
            className={style.event_badge}
            aria-label={`${upcomingCount} événement${upcomingCount > 1 ? "s" : ""} à venir`}
          >
            <span className={style.badge_number}>{upcomingCount}</span>
            <span className={style.badge_text}>À venir</span>
          </div>
        </div>
      </header>

      <section className={style.content_section} aria-live="polite">
        {loading ? (
          <div
            className={style.ticket_grid}
            aria-busy="true"
            aria-label="Chargement de vos billets"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <TicketSkeleton key={index} />
            ))}
          </div>
        ) : ticketsQuery.isError ? (
          <div className={`${style.state} ${style.error}`}>
            Impossible de charger vos billets.
          </div>
        ) : upcoming.length + past.length === 0 ? (
          <div className={style.state}>
            <QrCode aria-hidden="true" />
            <h2>Aucun billet pour le moment</h2>
            <p>Vos prochaines inscriptions apparaîtront ici.</p>
            <Link href="/events" className={style.state_action}>
              Découvrir les événements
            </Link>
          </div>
        ) : (
          <section className={style.group} aria-labelledby="tickets-title">
            {/* En-tête comme la page Événements : titre + onglets côte à côte. */}
            <div className={style.section_header}>
              <div>
                <h2 id="tickets-title" className={style.section_title}>
                  {timeline === "past" ? "Billets passés" : "Billets à venir"}
                </h2>
                <p className={style.section_subtitle}>
                  {shownGroups.length} événement
                  {shownGroups.length > 1 ? "s" : ""}{" "}
                  {timeline === "past"
                    ? `terminé${shownGroups.length > 1 ? "s" : ""}`
                    : "à venir"}
                </p>
              </div>
              <div
                className={style.timeline_toggle}
                role="group"
                aria-label="Période"
              >
                <button
                  type="button"
                  className={`${style.timeline_btn} ${
                    timeline === "upcoming" ? style.active : ""
                  }`}
                  aria-pressed={timeline === "upcoming"}
                  onClick={() => setTimeline("upcoming")}
                >
                  À venir
                  <span className={style.timeline_count}>
                    {upcoming.length}
                  </span>
                </button>
                <button
                  type="button"
                  className={`${style.timeline_btn} ${
                    timeline === "past" ? style.active : ""
                  }`}
                  aria-pressed={timeline === "past"}
                  onClick={() => setTimeline("past")}
                >
                  Passés
                  <span className={style.timeline_count}>{past.length}</span>
                </button>
              </div>
            </div>

            {shownGroups.length > 0 ? (
              <div className={style.ticket_grid}>
                {shownGroups.map((group) => (
                  <Ticket
                    key={group.event.id}
                    tickets={group.tickets}
                    isPast={timeline === "past"}
                  />
                ))}
              </div>
            ) : (
              <div className={`${style.state} ${style.state_compact}`}>
                <p>
                  {timeline === "past"
                    ? "Aucun événement passé."
                    : "Aucun événement à venir."}
                </p>
                {timeline === "upcoming" && (
                  <Link href="/events" className={style.state_action}>
                    Découvrir les événements
                  </Link>
                )}
              </div>
            )}
          </section>
        )}

        {!refundsQuery.isPending && refunds.length > 0 && (
          <section className={style.refunds_section}>
            <h2>Mes remboursements</h2>
            <div className={style.refunds_list}>
              {refunds.map((refund) => (
                <article className={style.refund_card} key={refund.id}>
                  <div>
                    <h3>{refund.ticket?.event?.title || "Événement"}</h3>
                    <p>{refund.reason || "Aucun motif renseigné"}</p>
                  </div>
                  <strong>
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: refund.currency || "XOF",
                      maximumFractionDigits: 0,
                    }).format(refund.amount)}
                  </strong>
                  <span
                    className={style[`refund_${refund.status.toLowerCase()}`]}
                  >
                    {refundStatusLabels[refund.status] || refund.status}
                  </span>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
