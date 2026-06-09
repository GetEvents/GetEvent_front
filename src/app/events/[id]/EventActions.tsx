"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CirclePlus, LogOut, Pencil, Trash2 } from "lucide-react";
import { delectEvent, joinEvent, leaveEvent } from "@/actions/event";
import DelectModal from "@/components/DelectModal";
import { useNotification } from "@/components/Notification/NotificationProvider";
import styles from "./style.module.scss";

interface EventActionsProps {
  eventId: number;
  eventTitle: string;
  isOwner: boolean;
  isRegistered: boolean;
  ticketId?: number;
  isExpired: boolean;
  isFull: boolean;
}

export default function EventActions({
  eventId,
  eventTitle,
  isOwner,
  isRegistered,
  ticketId,
  isExpired,
  isFull,
}: EventActionsProps) {
  const router = useRouter();
  const { notify } = useNotification() as {
    // eslint-disable-next-line no-unused-vars
    notify: (message: string, type?: "success" | "error" | "info") => void;
  };
  const [isPending, startTransition] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleJoin = () => {
    startTransition(async () => {
      const result = await joinEvent(eventId);
      if (result.error) {
        notify(result.message, "error");
        return;
      }
      if (result.paymentUrl) {
        window.location.assign(result.paymentUrl);
        return;
      }
      notify(result.message, "success");
      router.refresh();
    });
  };

  const handleLeave = () => {
    if (!ticketId) return;
    startTransition(async () => {
      const result = await leaveEvent(ticketId);
      notify(result.message, result.error ? "error" : "success");
      if (!result.error) router.refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await delectEvent(eventId);
      notify(result.message, result.error ? "error" : "success");
      if (!result.error) {
        router.push(result.redirect || "/events/my-events");
        router.refresh();
      }
      setIsDeleteModalOpen(false);
    });
  };

  if (isOwner) {
    return (
      <>
        <div className={styles.actionButtons}>
          <Link
            href={isExpired ? "#" : `/events/editEvent/${eventId}`}
            className={`${styles.button} ${styles.primary} ${
              isExpired ? styles.disabled : ""
            }`}
            aria-disabled={isExpired}
            onClick={(event) => {
              if (isExpired) event.preventDefault();
            }}
          >
            <Pencil />
            Modifier l&apos;événement
          </Link>
          <button
            type="button"
            className={`${styles.button} ${styles.danger}`}
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isPending}
          >
            <Trash2 />
            Supprimer l&apos;événement
          </button>
        </div>
        <DelectModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          eventTitle={eventTitle}
          isLoading={isPending}
        />
      </>
    );
  }

  if (isRegistered) {
    return (
      <button
        type="button"
        className={`${styles.button} ${styles.secondary}`}
        onClick={handleLeave}
        disabled={isPending}
      >
        <LogOut />
        {isPending ? "Désinscription..." : "Se désinscrire de l'événement"}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${styles.success}`}
      onClick={handleJoin}
      disabled={isPending || isExpired || isFull}
    >
      <CirclePlus />
      {isPending
        ? "Inscription..."
        : isExpired
          ? "Événement terminé"
          : isFull
            ? "Événement complet"
            : "S'inscrire à l'événement"}
    </button>
  );
}
