"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteEvent } from "@/hooks/useEvents";
import DelectModal from "@/components/DelectModal";
import { useNotification } from "@/components/Notification/NotificationProvider";
import styles from "./DeleteEventButton.module.scss";

interface DeleteEventButtonProps {
  eventId: number;
  eventTitle: string;
}

export default function DeleteEventButton({
  eventId,
  eventTitle,
}: DeleteEventButtonProps) {
  const router = useRouter();
  const { notify } = useNotification() as {
    // eslint-disable-next-line no-unused-vars
    notify: (message: string, type?: "success" | "error" | "info") => void;
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const deleteMutation = useDeleteEvent();

  const handleDelete = () =>
    deleteMutation.mutate(eventId, {
      onSuccess: (result) => {
        if (result.error) return notify(result.message, "error");
        notify(result.message, "success");
        setIsModalOpen(false);
        router.refresh();
      },
      onError: () => notify("Impossible de supprimer l'événement.", "error"),
    });

  return (
    <>
      <button
        type="button"
        className={styles.button}
        onClick={() => setIsModalOpen(true)}
        disabled={deleteMutation.isPending}
      >
        {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
      </button>
      <DelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        eventTitle={eventTitle}
        message="Voulez-vous vraiment supprimer cet événement ?"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
