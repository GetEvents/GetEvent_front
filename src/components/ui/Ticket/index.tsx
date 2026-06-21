"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
  QrCode,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { ParticipationTicket } from "@/actions/types/participation";
import styles from "./style.module.scss";

interface TicketProps {
  ticket: ParticipationTicket;
}

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

export default function Ticket({ ticket }: TicketProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsModalOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isModalOpen]);

  return (
    <>
      <article className={styles.ticket}>
        <button
          type="button"
          className={styles.ticket_open}
          onClick={() => setIsModalOpen(true)}
          aria-label={`Afficher le QR code pour ${ticket.event.title}`}
        >
          <span className={styles.ticket_image}>
            <Image
              src={ticket.event.image || "/images/ev1.jpg"}
              alt=""
              fill
              sizes="(max-width: 700px) 100vw, 420px"
            />
            <span className={styles.image_overlay} />
            <span className={styles.ticket_label}>GETEVENT · PASS</span>
            <span className={styles.qr_hint}>
              <QrCode aria-hidden="true" /> Voir le QR code
            </span>
          </span>

          <span className={styles.ticket_body}>
            <span className={styles.ticket_main}>
              <span className={styles.category}>
                {ticket.event.category || "Événement"}
              </span>
              <strong>{ticket.event.title}</strong>
              <span className={styles.ticket_meta}>
                <span>
                  <CalendarDays aria-hidden="true" />
                  {formatDate(ticket.event.startDate)}
                </span>
                <span>
                  <Clock3 aria-hidden="true" />
                  {formatTime(ticket.event.startTime)}
                </span>
                <span>
                  <MapPin aria-hidden="true" />
                  {ticket.event.location || "Lieu à confirmer"}
                </span>
              </span>
            </span>
            <span className={styles.ticket_stub} aria-hidden="true">
              <QrCode />
              <span>#{String(ticket.id).padStart(4, "0")}</span>
            </span>
          </span>
        </button>
        <Link href={`/events/${ticket.event.id}`} className={styles.event_link}>
          Voir l&apos;événement
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </article>

      {isModalOpen && (
        <div
          className={styles.modal_backdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsModalOpen(false);
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`ticket-title-${ticket.id}`}
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
            <p className={styles.modal_eyebrow}>Billet d’accès</p>
            <h2 id={`ticket-title-${ticket.id}`}>{ticket.event.title}</h2>
            {ticket.qrCode ? (
              <div className={styles.qr_code}>
                <QRCodeSVG
                  value={ticket.qrCode}
                  size={240}
                  level="H"
                  marginSize={2}
                  title={`QR code pour ${ticket.event.title}`}
                />
              </div>
            ) : (
              <p className={styles.qr_unavailable}>
                Le QR code de ce billet n’est pas encore disponible.
              </p>
            )}
            <div className={styles.modal_details}>
              <span>{formatDate(ticket.event.startDate)}</span>
              <span>·</span>
              <span>{formatTime(ticket.event.startTime)}</span>
            </div>
            <p className={styles.modal_hint}>
              Présentez ce code à l’entrée de l’événement.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
