"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CirclePlus, LogOut, Pencil, Trash2 } from "lucide-react";
import { useDeleteEvent, useJoinEvent, useLeaveEvent } from "@/hooks/useEvents";
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const joinMutation = useJoinEvent();
  const leaveMutation = useLeaveEvent();
  const deleteMutation = useDeleteEvent();
  const isPending =
    joinMutation.isPending ||
    leaveMutation.isPending ||
    deleteMutation.isPending;

  const handleJoin = () =>
    joinMutation.mutate(eventId, {
      onSuccess: (result) => {
        if (result.error) return notify(result.message, "error");
        notify(result.message, "success");
        if (result.paymentUrl) return window.location.assign(result.paymentUrl);
        router.refresh();
      },
      onError: () => notify("Impossible de vous inscrire.", "error"),
    });

  const handleLeave = () => {
    if (!ticketId) return;
    leaveMutation.mutate(ticketId, {
      onSuccess: (result) => {
        notify(result.message, result.error ? "error" : "success");
        if (!result.error) router.refresh();
      },
      onError: () => notify("Impossible de vous désinscrire.", "error"),
    });
  };

  const handleDelete = () =>
    deleteMutation.mutate(eventId, {
      onSuccess: (result) => {
        if (result.error) return notify(result.message, "error");
        notify(result.message, "success");
        setIsDeleteModalOpen(false);
        router.push(result.redirect || "/events/my-events");
      },
      onError: () => notify("Impossible de supprimer l'événement.", "error"),
    });

  if (isOwner)
    return (
      <>
        <div className={styles.actionButtons}>
          <Link
            href={isExpired ? "#" : `/events/editEvent/${eventId}`}
            className={`${styles.button} ${styles.primary} ${isExpired ? styles.disabled : ""}`}
            aria-disabled={isExpired}
            onClick={(event) => {
              if (isExpired) event.preventDefault();
            }}
          >
            <Pencil /> Modifier l&apos;événement
          </Link>
          <button
            type="button"
            className={`${styles.button} ${styles.danger}`}
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isPending}
          >
            <Trash2 /> Supprimer l&apos;événement
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

  if (isRegistered)
    return (
      <button
        type="button"
        className={`${styles.button} ${styles.secondary}`}
        onClick={handleLeave}
        disabled={isPending}
      >
        <LogOut />{" "}
        {isPending ? "Désinscription..." : "Se désinscrire de l'événement"}
      </button>
    );

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
