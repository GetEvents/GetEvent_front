"use client";

import { QrCode } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Ticket, { TicketSkeleton } from "@/components/ui/Ticket";
import { getMyRefunds } from "@/actions/payment";
import { useAuth } from "@/hooks/useAuth";
import { useTicketsByUser } from "@/hooks/useParticipants";
import style from "./style.module.scss";

export default function ParticipationsPage() {
  const { user, loading: authLoading } = useAuth();
  const ticketsQuery = useTicketsByUser(
    user?.id,
    !authLoading && Boolean(user),
  );
  const tickets = ticketsQuery.data || [];
  const refundsQuery = useQuery({
    queryKey: ["payments", "refunds", "mine", user?.id],
    queryFn: getMyRefunds,
    enabled: !authLoading && Boolean(user),
  });
  const refunds = refundsQuery.data?.refunds || [];
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
          <div>
            <p className={style.eyebrow}>Votre portefeuille</p>
            <h1 className={style.main_title}>Mes billets</h1>
            <p className={style.description}>
              Retrouvez vos accès et présentez leur QR code à l’entrée.
            </p>
          </div>
          <div
            className={style.event_badge}
            aria-label={`${tickets.length} billets`}
          >
            <span className={style.badge_number}>{tickets.length}</span>
            <span className={style.badge_text}>
              Billet{tickets.length > 1 ? "s" : ""}
            </span>
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
        ) : tickets.length === 0 ? (
          <div className={style.state}>
            <QrCode aria-hidden="true" />
            <h2>Aucun billet pour le moment</h2>
            <p>Vos prochaines inscriptions apparaîtront ici.</p>
          </div>
        ) : (
          <div className={style.ticket_grid}>
            {tickets.map((ticket) => (
              <Ticket key={ticket.id} ticket={ticket} />
            ))}
          </div>
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
