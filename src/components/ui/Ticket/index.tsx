"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Layers,
  MapPin,
  QrCode,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { ParticipationTicket } from "@/actions/types/participation";
import styles from "./style.module.scss";

interface TicketProps {
  ticket?: ParticipationTicket;
  tickets?: ParticipationTicket[];
}

const emptySubscribe = () => () => {};

export function TicketSkeleton() {
  return (
    <div className={`${styles.ticket} ${styles.skeleton}`} aria-hidden="true">
      <div className={styles.skeleton_image} />
      <div className={styles.skeleton_body}>
        <div className={styles.skeleton_main}>
          <span className={styles.skeleton_category} />
          <span className={styles.skeleton_title} />
          <span className={styles.skeleton_line} />
          <span className={styles.skeleton_line_short} />
          <span className={styles.skeleton_button} />
        </div>
        <div className={styles.skeleton_stub} />
      </div>
    </div>
  );
}

const formatDate = (value?: string | null) => {
  if (!value) return "Date à confirmer";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date à confirmer";
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatTime = (value?: string | null) => {
  if (!value) return "Heure à confirmer";
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Heure à confirmer";
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function Ticket({ ticket, tickets }: TicketProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const ticketList = useMemo(() => {
    if (tickets && tickets.length > 0) return tickets;
    if (ticket) return [ticket];
    return [];
  }, [ticket, tickets]);

  const totalTickets = ticketList.length;
  const currentTicket = ticketList[currentIndex] || ticketList[0];
  const event = currentTicket?.event;

  const validatedCount = useMemo(
    () =>
      ticketList.filter((t) => t.status && t.status.toUpperCase() === "USED")
        .length,
    [ticketList],
  );
  const allValidated = totalTickets > 0 && validatedCount === totalTickets;
  const isCurrentValidated = Boolean(
    currentTicket?.status && currentTicket.status.toUpperCase() === "USED",
  );

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalTickets - 1));
  }, [totalTickets]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalTickets - 1 ? prev + 1 : 0));
  }, [totalTickets]);

  // Gestuelle swipe pour mobile
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, handlePrev, handleNext]);

  if (!event || totalTickets === 0) {
    return null;
  }

  const handleOpenModal = () => {
    // Si certains billets ne sont pas encore validés, ouvrir directement sur le premier à scanner
    const firstPendingIndex = ticketList.findIndex(
      (t) => t.status?.toUpperCase() !== "USED",
    );
    setCurrentIndex(firstPendingIndex >= 0 ? firstPendingIndex : 0);
    setIsModalOpen(true);
  };

  const modalContent = (
    <div
      className={styles.modal_backdrop}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setIsModalOpen(false);
      }}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`ticket-title-${event.id}`}
      >
        <button
          type="button"
          className={styles.modal_close}
          onClick={() => setIsModalOpen(false)}
          aria-label="Fermer"
          autoFocus
        >
          <X aria-hidden="true" />
        </button>

        <p className={styles.modal_eyebrow}>
          {totalTickets > 1 ? "Portefeuille de billets" : "Billet d’accès"}
        </p>
        <h2 id={`ticket-title-${event.id}`}>{event.title}</h2>

        {/* Badge d'état unique, épuré et raffiné */}
        <div className={styles.status_row}>
          {isCurrentValidated ? (
            <span className={styles.status_pill_used}>
              <CheckCircle2 aria-hidden="true" />
              <span>Validé</span>
              {totalTickets > 1 && (
                <>
                  <span className={styles.pill_divider}>·</span>
                  <span>
                    Place {currentIndex + 1}/{totalTickets}
                  </span>
                </>
              )}
              <span className={styles.pill_divider}>·</span>
              <span className={styles.pill_ref}>
                #{String(currentTicket.id).padStart(4, "0")}
              </span>
            </span>
          ) : (
            <span className={styles.status_pill_valid}>
              <span>Prêt à scanner</span>
              {totalTickets > 1 && (
                <>
                  <span className={styles.pill_divider}>·</span>
                  <span>
                    Place {currentIndex + 1}/{totalTickets}
                  </span>
                </>
              )}
              <span className={styles.pill_divider}>·</span>
              <span className={styles.pill_ref}>
                #{String(currentTicket.id).padStart(4, "0")}
              </span>
            </span>
          )}
        </div>

        {/* Carousel de cartes */}
        <div
          className={styles.carousel_wrapper}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {totalTickets > 1 && (
            <button
              type="button"
              className={`${styles.nav_arrow} ${styles.prev_arrow}`}
              onClick={handlePrev}
              aria-label="Billet précédent"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
          )}

          <div className={styles.card_slide} key={currentTicket.id}>
            {currentTicket.qrCode ? (
              <div
                className={`${styles.qr_code} ${isCurrentValidated ? styles.qr_code_used : ""}`}
              >
                <QRCodeSVG
                  value={currentTicket.qrCode}
                  size={220}
                  level="H"
                  marginSize={2}
                  title={`QR code place ${currentIndex + 1} sur ${totalTickets}`}
                />
              </div>
            ) : (
              <p className={styles.qr_unavailable}>
                Le QR code de ce billet n’est pas encore disponible.
              </p>
            )}
            {totalTickets === 1 && (
              <p className={styles.single_ref}>
                #{String(currentTicket.id).padStart(4, "0")}
              </p>
            )}
          </div>

          {totalTickets > 1 && (
            <button
              type="button"
              className={`${styles.nav_arrow} ${styles.next_arrow}`}
              onClick={handleNext}
              aria-label="Billet suivant"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Indicateurs de pagination */}
        {totalTickets > 1 && (
          <div
            className={styles.pagination_dots}
            role="tablist"
            aria-label="Sélection du billet"
          >
            {ticketList.map((t, idx) => {
              const isUsed = t.status === "USED";
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === currentIndex}
                  aria-label={`Aller au billet ${idx + 1}${isUsed ? " (déjà validé)" : ""}`}
                  className={`${styles.dot} ${idx === currentIndex ? styles.dot_active : ""} ${
                    isUsed ? styles.dot_used : ""
                  }`}
                  onClick={() => setCurrentIndex(idx)}
                />
              );
            })}
          </div>
        )}

        {/* Bouton d'action rapide pour passer à la carte suivante */}
        {totalTickets > 1 && (
          <button
            type="button"
            className={styles.deck_action_btn}
            onClick={handleNext}
          >
            {currentIndex < totalTickets - 1 ? (
              <>
                <span>
                  Billet suivant ({currentIndex + 2}/{totalTickets})
                </span>
                <ChevronRight aria-hidden="true" />
              </>
            ) : (
              <>
                <span>Revenir au premier billet (1/{totalTickets})</span>
                <ChevronRight aria-hidden="true" />
              </>
            )}
          </button>
        )}

        <div className={styles.modal_details}>
          <span>{formatDate(event.startDate)}</span>
          <span>·</span>
          <span>{formatTime(event.startTime)}</span>
        </div>
        <p className={styles.modal_hint}>
          {isCurrentValidated
            ? currentTicket.validatedAt
              ? `Entrée validée le ${formatDate(currentTicket.validatedAt)} à ${formatTime(currentTicket.validatedAt)}`
              : "Entrée enregistrée pour ce billet"
            : "Présentez ce QR code à l’entrée de l’événement."}
        </p>
      </section>
    </div>
  );

  return (
    <>
      <article className={styles.ticket}>
        <button
          type="button"
          className={styles.ticket_open}
          onClick={handleOpenModal}
          aria-label={`Afficher les QR codes pour ${event.title}`}
        >
          <span className={styles.ticket_image}>
            <Image
              src={event.image || "/images/ev1.jpg"}
              alt=""
              fill
              sizes="(max-width: 700px) 100vw, 420px"
            />
            <span className={styles.image_overlay} />
            <span className={styles.ticket_label}>GETEVENT · PASS</span>
            {allValidated ? (
              <span className={styles.validated_badge}>
                <CheckCircle2 aria-hidden="true" />
                <span>Déjà validé</span>
              </span>
            ) : validatedCount > 0 ? (
              <span className={styles.partially_validated_badge}>
                <CheckCircle2 aria-hidden="true" />
                <span>
                  {validatedCount}/{totalTickets} validés
                </span>
              </span>
            ) : totalTickets > 1 ? (
              <span className={styles.quantity_badge}>
                <Layers aria-hidden="true" />
                <span>{totalTickets} billets</span>
              </span>
            ) : null}
            <span className={styles.qr_hint}>
              <QrCode aria-hidden="true" />
              {allValidated
                ? "Voir le pass"
                : totalTickets > 1
                  ? "Scanner les billets"
                  : "Voir le QR code"}
            </span>
          </span>

          <span className={styles.ticket_body}>
            <span className={styles.ticket_main}>
              <span className={styles.category}>
                {event.category || "Événement"}
              </span>
              <strong>{event.title}</strong>
              <span className={styles.ticket_meta}>
                <span>
                  <CalendarDays aria-hidden="true" />
                  {formatDate(event.startDate)}
                </span>
                <span>
                  <Clock3 aria-hidden="true" />
                  {formatTime(event.startTime)}
                </span>
                <span>
                  <MapPin aria-hidden="true" />
                  {event.location || "Lieu à confirmer"}
                </span>
              </span>
            </span>
            <span className={styles.ticket_stub} aria-hidden="true">
              <QrCode />
              {allValidated ? (
                <div className={styles.stub_validated}>
                  <CheckCircle2 aria-hidden="true" />
                  <span className={styles.stub_val_text}>VALIDÉ</span>
                </div>
              ) : validatedCount > 0 ? (
                <div className={styles.stub_multi}>
                  <span className={styles.stub_qty}>
                    {validatedCount}/{totalTickets}
                  </span>
                  <span className={styles.stub_label}>
                    validé{validatedCount > 1 ? "s" : ""}
                  </span>
                </div>
              ) : totalTickets > 1 ? (
                <div className={styles.stub_multi}>
                  <span className={styles.stub_qty}>×{totalTickets}</span>
                  <span className={styles.stub_label}>places</span>
                </div>
              ) : (
                <span>#{String(ticketList[0].id).padStart(4, "0")}</span>
              )}
            </span>
          </span>
        </button>
        <Link href={`/events/${event.id}`} className={styles.event_link}>
          Voir l&apos;événement
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </article>

      {isMounted && isModalOpen && createPortal(modalContent, document.body)}
    </>
  );
}
