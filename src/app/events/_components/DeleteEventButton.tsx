"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { delectEvent } from "@/actions/event";
import type { EventActionState } from "@/actions/types/event";
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
  const queryClient = useQueryClient();
  const { notify } = useNotification() as {
    // eslint-disable-next-line no-unused-vars
    notify: (message: string, type?: "success" | "error" | "info") => void;
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  const deleteMutation = useMutation<EventActionState, Error, number>({
    mutationFn: delectEvent,
    onSuccess: (result) => {
      if (result.error) {
        notify(result.message, "error");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["events"] });
      notify(result.message, "success");
      setIsModalOpen(false);
      router.refresh();
    },
    onError: () => {
      notify("Impossible de supprimer l'événement.", "error");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(eventId);
  };

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
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
