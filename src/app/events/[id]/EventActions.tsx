"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CirclePlus, LogOut, Pencil, Trash2 } from "lucide-react";
import { useDeleteEvent, useJoinEvent, useLeaveEvent } from "@/hooks/useEvents";
import DelectModal from "@/components/DelectModal";
import TicketPurchaseModal from "@/components/ui/TicketPurchaseModal";
import { useNotification } from "@/components/Notification/NotificationProvider";
import styles from "./style.module.scss";

interface EventActionsProps {
  eventId: number;
  eventTitle: string;
  isOwner: boolean;
  isRegistered: boolean;
  ticketId?: number;
  paymentRequired: boolean;
  isExpired: boolean;
  isFull: boolean;
  event?: any;
}

export default function EventActions({
  eventId,
  eventTitle,
  isOwner,
  isRegistered,
  ticketId,
  paymentRequired,
  isExpired,
  isFull,
  event,
}: EventActionsProps) {
  const router = useRouter();
  const { notify } = useNotification() as {
    // eslint-disable-next-line no-unused-vars
    notify: (message: string, type?: "success" | "error" | "info") => void;
  };
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const joinMutation = useJoinEvent();
  const leaveMutation = useLeaveEvent();
  const deleteMutation = useDeleteEvent();
  const isPending =
    joinMutation.isPending ||
    leaveMutation.isPending ||
    deleteMutation.isPending;

  const handleJoin = (quantity: number = 1) =>
    joinMutation.mutate(
      { eventId, quantity },
      {
        onSuccess: (result) => {
          setIsPurchaseModalOpen(false);
          if (result.error) {
            const isAlready = result.message
              ?.toLowerCase()
              .includes("déjà inscrit");
            return notify(
              result.message || "Vous êtes déjà inscrit à cet événement !",
              isAlready ? "info" : "error",
            );
          }
          notify(result.message, result.paymentUrl ? "info" : "success");
          if (result.paymentUrl)
            return window.location.assign(result.paymentUrl);
          router.refresh();
        },
        onError: (err: any) => {
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

  const handleLeave = () => {
    if (!ticketId) return;
    leaveMutation.mutate(ticketId, {
      onSuccess: (result) => {
        notify(
          result.message,
          result.error ? "error" : result.refundRequired ? "info" : "success",
        );
        if (!result.error) {
          setIsLeaveModalOpen(false);
          router.refresh();
        }
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
          message={""}
        />
      </>
    );

  if (isRegistered)
    return (
      <>
        <div className={styles.actionButtons}>
          <button
            type="button"
            className={`${styles.button} ${styles.success}`}
            onClick={() => setIsPurchaseModalOpen(true)}
            disabled={isPending || isExpired || isFull}
          >
            <CirclePlus /> Réserver d&apos;autres places
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.secondary}`}
            onClick={() => setIsLeaveModalOpen(true)}
            disabled={isPending}
          >
            <LogOut /> Se désinscrire de l&apos;événement
          </button>
        </div>

        <DelectModal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          onConfirm={handleLeave}
          isLoading={leaveMutation.isPending}
          eventTitle={eventTitle}
          title="Confirmer la désinscription"
          message={
            paymentRequired
              ? "Cet événement est payant. Votre désinscription créera une demande de remboursement en attente de traitement."
              : "Voulez-vous vraiment vous désinscrire de cet événement ?"
          }
          confirmLabel="Se désinscrire"
          loadingLabel="Désinscription..."
        />

        <TicketPurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          onConfirm={(qty: number) => handleJoin(qty)}
          event={
            event || {
              id: eventId,
              title: eventTitle,
              paymentRequired,
            }
          }
          isLoading={joinMutation.isPending}
          alreadyRegisteredCount={1}
        />
      </>
    );

  return (
    <>
      <button
        type="button"
        className={`${styles.button} ${styles.success}`}
        onClick={() => setIsPurchaseModalOpen(true)}
        disabled={isPending || isExpired || isFull}
      >
        <CirclePlus />
        {isPending
          ? "Inscription..."
          : isExpired
            ? "Événement terminé"
            : isFull
              ? "Événement complet"
              : "S'inscrire / Réserver des places"}
      </button>

      <TicketPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onConfirm={(qty: number) => handleJoin(qty)}
        event={
          event || {
            id: eventId,
            title: eventTitle,
            paymentRequired,
          }
        }
        isLoading={joinMutation.isPending}
      />
    </>
  );
}
