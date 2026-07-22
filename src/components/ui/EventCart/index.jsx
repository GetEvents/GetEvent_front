"use client";
import styles from "./style.module.scss";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import DelectModal from "../../DelectModal";
import { useDeleteEvent } from "@/hooks/useEvents";
import React from "react";

import { useRouter } from "next/navigation";

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
            <span className={styles.skeletonTitle} />
            <div className={styles.skeletonMeta}>
              <span />
              <span />
            </div>
            <span className={styles.skeletonLocation} />
            <span className={styles.skeletonText} />
            <span className={styles.skeletonTextShort} />
            <div className={styles.skeletonActions}>
              <span />
              <span />
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
}) {
  const router = useRouter();
  const deleteEventMutation = useDeleteEvent();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTime] = useState(Date.now);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const formatTime = (timeString) => {
    if (!timeString) return "00:00";

    // Cas ISO (ex: 2026-02-15T01:01:00.000Z)
    if (timeString.includes("T")) {
      const date = new Date(timeString);
      if (!Number.isNaN(date.getTime())) {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`; // HH:MM (heure locale)
      }
    }

    // Cas HH:MM ou HH:MM:SS
    const [hour = "00", minute = "00"] = timeString.split(":");
    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
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
      if (response.redirect) {
        router.push("/events/my-events");
      }
      closeDeleteModal();
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.event_schow}>
      {message && show && (
        <div
          className={`${styles.btnDe} ${state?.error ? styles.error : styles.success}`}
        >
          {state?.message && show && <p>{state.message}</p>}
          {state?.message && show && (
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={handleClose}
            >
              X
            </button>
          )}
        </div>
      )}

      {loading ? (
        <EventCardSkeleton />
      ) : eventList != null && eventList.length > 0 ? (
        <div className={styles.events_schowdiv}>
          {eventList.map((event, index) => {
            const eventExpired = isEventExpired(event);
            const expiredMessage = "Impossible: cet evenement est termine";

            return (
              <div className={styles.events_schowdi} key={event.id}>
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
                      alt="event title"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 340px"
                      loading={index < 3 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                    />
                  )}
                </div>

                <div className={styles.events_info}>
                  <div className={styles.eventsinfodetaille}>
                    <h3>{event.title}</h3>

                    <div className={styles.events_infoh}>
                      <div className={styles.date}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857z" />
                          <path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
                        </svg>
                        <p>{formatDate(event.startDate)}</p>
                      </div>
                      <div className={styles.time}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
                        </svg>
                        <p>{formatTime(event.startTime)}</p>
                      </div>
                    </div>

                    <div className={styles.events_infod}>
                      <div className={styles.eventlocalise}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
                        </svg>
                        <p className={styles.localis}>{event.location}</p>
                      </div>
                    </div>

                    <div className={styles.events_description}>
                      <p>{event.description}</p>
                    </div>
                    <div className={styles.eventcreat}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10"
                        />
                      </svg>
                      <p>
                        Organisateur : {event.organisateur?.nom || "Inconnu"}
                      </p>
                    </div>
                  </div>
                  <div className={styles.eventactin}>
                    <div className={styles.detailview}>
                      <Link
                        href={`/events/${event.id}`}
                        aria-label={`Voir les details de ${event.title}`}
                      >
                        Plus détails
                      </Link>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"
                        />
                      </svg>
                    </div>
                    {current_user?.id &&
                      event.organisateur?.id &&
                      String(current_user.id) ===
                        String(event.organisateur.id) && (
                        <div className={styles.editdelect}>
                          <Link
                            className={styles.edit}
                            href={
                              eventExpired
                                ? "#"
                                : `/events/editEvent/${event.id}`
                            }
                            aria-disabled={eventExpired}
                            tabIndex={eventExpired ? -1 : 0}
                            title={eventExpired ? expiredMessage : "Modifier"}
                            onClick={(e) => {
                              if (eventExpired) e.preventDefault();
                            }}
                            style={
                              eventExpired
                                ? { opacity: 0.5, cursor: "not-allowed" }
                                : undefined
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                              fill="currentColor"
                            >
                              <path d="M36.4 353.2c4.1-14.6 11.8-27.9 22.6-38.7l181.2-181.2 33.9-33.9c16.6 16.6 51.3 51.3 104 104l33.9 33.9-33.9 33.9-181.2 181.2c-10.7 10.7-24.1 18.5-38.7 22.6L30.4 510.6c-8.3 2.3-17.3 0-23.4-6.2S-1.4 489.3 .9 481L36.4 353.2zm55.6-3.7c-4.4 4.7-7.6 10.4-9.3 16.6l-24.1 86.9 86.9-24.1c6.4-1.8 12.2-5.1 17-9.7L91.9 349.5zm354-146.1c-16.6-16.6-51.3-51.3-104-104L308 65.5C334.5 39 349.4 24.1 352.9 20.6 366.4 7 384.8-.6 404-.6S441.6 7 455.1 20.6l35.7 35.7C504.4 69.9 512 88.3 512 107.4s-7.6 37.6-21.2 51.1c-3.5 3.5-18.4 18.4-44.9 44.9z" />
                            </svg>
                          </Link>
                          <span
                            title={eventExpired ? expiredMessage : "Supprimer"}
                          >
                            <button
                              onClick={() => openDeleteModal(event)}
                              disabled={eventExpired}
                              aria-disabled={eventExpired}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                              </svg>
                            </button>
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <section id="page_404" className={styles.erreur}>
          <p>
            Il n&apos;y a encore aucun événement... Et si{" "}
            <span>prochain grand moment</span> venait de vous ? Soyez{" "}
            <span>l&apos;initiateur</span> et créez un événement inoubliable dès
            maintenant !
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
    </div>
  );
}
