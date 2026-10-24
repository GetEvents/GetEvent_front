"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  Clock,
  Eye,
  MapPin,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { useDeleteEvent, useJoinEvent } from "@/hooks/useEvents";
import { useTicketsByUser } from "@/hooks/useParticipants";
import { useNotification } from "@/components/Notification/NotificationProvider";
import DelectModal from "../../DelectModal";
import TicketPurchaseModal from "../TicketPurchaseModal";
import styles from "./style.module.scss";

export function EventCardSkeleton({ count = 6 }) {
  return (
    <div
      className={styles.events_schowdiv}
      aria-busy="true"
      aria-label="Chargement des événements"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          className={`${styles.events_schowdi} ${styles.skeletonCard}`}
          key={index}
          aria-hidden="true"
        >
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonMeta} />
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonLocation} />
            <div className={styles.skeletonFooter}>
              <div className={styles.skeletonEye} />
              <div className={styles.skeletonBtn} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EventCard({
  message,
  eventList,
  loading,
  current_user,
  state,
  show,
  handleClose,
  emptyMessage,
}) {
  const router = useRouter();
  const deleteEventMutation = useDeleteEvent();
  const joinEventMutation = useJoinEvent();
  const { notify } = useNotification();
  const userTicketsQuery = useTicketsByUser(
    current_user?.id,
    Boolean(current_user?.id),
  );

  const registeredEventIds = useMemo(() => {
    const tickets = userTicketsQuery.data || [];
    return new Set(
      tickets
        .filter((t) => t.status !== "CANCELLED")
        .map((t) => t.event?.id)
        .filter(Boolean),
    );
  }, [userTicketsQuery.data]);

  const isUserRegistered = (event) => {
    if (!current_user?.id) return false;
    if (registeredEventIds.has(event.id)) return true;
    if (Array.isArray(event.tickets)) {
      return event.tickets.some(
        (t) =>
          t.status !== "CANCELLED" &&
          Number(t.userId || t.user?.id) === Number(current_user.id),
      );
    }
    return false;
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [purchaseModalEvent, setPurchaseModalEvent] = useState(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [joiningEventId, setJoiningEventId] = useState(null);
  const [currentTime] = useState(Date.now);

  const getUserTicketCountForEvent = (eventId) => {
    if (!current_user?.id) return 0;
    const tickets = userTicketsQuery.data || [];
    return tickets.filter(
      (t) =>
        t.status !== "CANCELLED" && Number(t.event?.id) === Number(eventId),
    ).length;
  };

  const openPurchaseModal = (event) => {
    if (!current_user) {
      router.push(`/auth/login?redirect=/events/${event.id}`);
      return;
    }

    if (isEventExpired(event)) return;

    setPurchaseModalEvent(event);
    setIsPurchaseModalOpen(true);
  };

  const closePurchaseModal = () => {
    if (joiningEventId) return;
    setIsPurchaseModalOpen(false);
    setPurchaseModalEvent(null);
  };

  const handleConfirmPurchase = (quantity) => {
    if (!purchaseModalEvent) return;

    const event = purchaseModalEvent;
    setJoiningEventId(event.id);
    joinEventMutation.mutate(
      { eventId: event.id, quantity },
      {
        onSuccess: (result) => {
          setJoiningEventId(null);
          closePurchaseModal();
          if (result.error) {
            const isAlready =
              typeof result.message === "string" &&
              result.message.toLowerCase().includes("déjà inscrit");
            notify(
              result.message || "Vous êtes déjà inscrit à cet événement !",
              isAlready ? "info" : "error",
            );
            return;
          }
          notify(
            result.message ||
              (quantity > 1
                ? `${quantity} billets confirmés !`
                : "Inscription confirmée !"),
            result.paymentUrl ? "info" : "success",
          );
          if (result.paymentUrl) {
            window.location.assign(result.paymentUrl);
            return;
          }
          router.refresh();
        },
        onError: (err) => {
          setJoiningEventId(null);
          const msg = err?.message || "";
          const isAlready = msg.toLowerCase().includes("déjà inscrit");
          notify(
            isAlready
              ? "Vous êtes déjà inscrit à cet événement !"
              : msg || "Impossible de vous inscrire.",
            isAlready ? "info" : "error",
          );
        },
      },
    );
  };

  const isEventExpired = (event) => {
    if (!event?.endDate) return false;

    const endDate = new Date(event.endDate);
    if (Number.isNaN(endDate.getTime())) return false;

    const endDateTime = new Date(endDate);
    if (event?.endTime) {
      const [hours = "00", minutes = "00"] = String(event.endTime).split(":");
      endDateTime.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
    }

    return endDateTime.getTime() < currentTime;
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return "Date à confirmer";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Date à confirmer";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "00:00";
    if (timeString.includes("T")) {
      const date = new Date(timeString);
      if (!Number.isNaN(date.getTime())) {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      }
    }
    const [hour = "00", minute = "00"] = timeString.split(":");
    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  };

  const formatPrice = (event) => {
    if (
      !event.paymentRequired ||
      !event.paymentPrice ||
      Number(event.paymentPrice) === 0
    ) {
      return "Gratuit";
    }
    return `${Number(event.paymentPrice).toLocaleString("fr-FR")} ${
      event.currency || "XOF"
    }`;
  };

  const openDeleteModal = (event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete?.id || isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await deleteEventMutation.mutateAsync(eventToDelete.id);
      if (response?.redirect) {
        router.push("/events/my-events");
      }
      closeDeleteModal();
    } catch {
      // handled by mutation state
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.event_schow}>
      {message && show && (
        <div
          className={`${styles.btnDe} ${
            state?.error ? styles.error : styles.success
          }`}
        >
          {state?.message && <p>{state.message}</p>}
          <button
            type="button"
            className="btn-close"
            aria-label="Fermer"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <EventCardSkeleton />
      ) : eventList != null && eventList.length > 0 ? (
        <div className={styles.events_schowdiv}>
          {eventList.map((event, index) => {
            const eventExpired = isEventExpired(event);
            const expiredMessage = "Impossible : cet événement est terminé";
            const priceText = formatPrice(event);
            const isFree = priceText === "Gratuit";
            const organizerName = event.organisateur
              ? `${event.organisateur.prenom || ""} ${
                  event.organisateur.nom || ""
                }`.trim()
              : null;
            const isOwner =
              current_user?.id &&
              event.organisateur?.id &&
              String(current_user.id) === String(event.organisateur.id);
            const isJoining =
              joiningEventId === event.id && joinEventMutation.isPending;
            const isRegistered = isUserRegistered(event);

            return (
              <article className={styles.events_schowdi} key={event.id}>
                {/* Image bord-à-bord avec dégradé de fondu progressif */}
                <div className={styles.events_image}>
                  {event.image ? (
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 340px"
                      loading={index < 3 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                    />
                  ) : (
                    <Image
                      src="/images/ev1.jpg"
                      alt="Image d'événement"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 340px"
                      loading={index < 3 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                    />
                  )}

                  {/* Badge Catégorie flottant */}
                  <span className={styles.badgeCategory}>
                    {event.category || "Événement"}
                  </span>

                  {/* Badges en haut à droite : Statut ou Tarif */}
                  <div className={styles.badgesRight}>
                    {eventExpired ? (
                      <span
                        className={`${styles.badgeStatus} ${styles.expired}`}
                      >
                        Terminé
                      </span>
                    ) : (
                      <>
                        {isRegistered && (
                          <span className={styles.badgeRegistered}>
                            <Check size={12} aria-hidden="true" />
                            <span>Inscrit</span>
                          </span>
                        )}
                        <span
                          className={`${styles.badgePrice} ${
                            isFree ? styles.free : styles.paid
                          }`}
                        >
                          {priceText}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Corps de carte émergeant naturellement du fondu */}
                <div className={styles.events_info}>
                  <div className={styles.dateTimeRow}>
                    <span className={styles.metaItem}>
                      <CalendarDays size={14} aria-hidden="true" />
                      <span>{formatEventDate(event.startDate)}</span>
                    </span>
                    {event.startTime && (
                      <span className={styles.metaItem}>
                        <Clock size={14} aria-hidden="true" />
                        <span>{formatTime(event.startTime)}</span>
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/events/${event.id}`}
                    className={styles.titleLink}
                  >
                    <h3 className={styles.eventTitle} title={event.title}>
                      {event.title}
                    </h3>
                  </Link>

                  <div className={styles.locationRow}>
                    <MapPin size={14} aria-hidden="true" />
                    <span>{event.location || "Lieu à confirmer"}</span>
                  </div>

                  {organizerName && (
                    <div className={styles.organizerSnippet}>
                      <User size={13} aria-hidden="true" />
                      <span>Organisé par {organizerName}</span>
                    </div>
                  )}
                </div>

                {/* Pied de carte : Détails (Œil) & Action principale (Participer / Réserver / Déjà inscrit) */}
                <div className={styles.eventactin}>
                  <div className={styles.leftActions}>
                    {isOwner && (
                      <div className={styles.editdelect}>
                        <Link
                          className={styles.actionBtn}
                          href={
                            eventExpired ? "#" : `/events/editEvent/${event.id}`
                          }
                          aria-disabled={eventExpired}
                          tabIndex={eventExpired ? -1 : 0}
                          title={eventExpired ? expiredMessage : "Modifier"}
                          onClick={(e) => {
                            if (eventExpired) e.preventDefault();
                          }}
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.delete}`}
                          onClick={() => openDeleteModal(event)}
                          disabled={eventExpired}
                          title={eventExpired ? expiredMessage : "Supprimer"}
                          aria-label="Supprimer cet événement"
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>

                  {isOwner ? (
                    <Link
                      href={`/events/${event.id}`}
                      className={styles.ctaPrimaryBtn}
                    >
                      <span>Gérer</span>
                    </Link>
                  ) : isRegistered ? (
                    <button
                      type="button"
                      className={`${styles.ctaPrimaryBtn} ${styles.registered}`}
                      onClick={() => openPurchaseModal(event)}
                      title="Vous êtes déjà inscrit. Cliquez pour réserver des places supplémentaires pour des proches."
                      aria-label="Vous êtes déjà inscrit. Cliquez pour réserver des places supplémentaires."
                    >
                      <Check size={15} aria-hidden="true" />
                      <span>Inscrit • + Places</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`${styles.ctaPrimaryBtn} ${
                        eventExpired ? styles.disabled : ""
                      }`}
                      onClick={() => openPurchaseModal(event)}
                      disabled={eventExpired || isJoining}
                      title={
                        eventExpired
                          ? "Cet événement est terminé"
                          : isFree
                            ? "Participer à l'événement"
                            : "Réserver votre place"
                      }
                      aria-label={
                        isFree
                          ? "Participer à l'événement"
                          : "Réserver votre place"
                      }
                    >
                      <span>
                        {isJoining
                          ? "Inscription..."
                          : eventExpired
                            ? "Terminé"
                            : isFree
                              ? "Participer"
                              : "Réserver"}
                      </span>
                    </button>
                  )}
                  {!isOwner && (
                    <Link
                      href={`/events/${event.id}`}
                      className={styles.eyeBtn}
                      title="Voir les détails"
                      aria-label={`Voir les détails de ${event.title}`}
                    >
                      <Eye size={18} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section id="page_404" className={styles.erreur}>
          <p>
            {emptyMessage || (
              <>
                Il n&apos;y a encore aucun événement... Et si{" "}
                <span>le prochain grand moment</span> venait de vous ? Soyez{" "}
                <span>l&apos;initiateur</span> et créez un événement inoubliable
                dès maintenant !
              </>
            )}
          </p>
        </section>
      )}

      <DelectModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        eventTitle={eventToDelete?.title}
        isLoading={isDeleting}
      />

      <TicketPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={closePurchaseModal}
        onConfirm={handleConfirmPurchase}
        event={purchaseModalEvent}
        isLoading={Boolean(joiningEventId)}
        alreadyRegisteredCount={
          purchaseModalEvent
            ? getUserTicketCountForEvent(purchaseModalEvent.id)
            : 0
        }
      />
    </div>
  );
}
