"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { delectEvent } from "@/actions/event";
import styles from "./DeleteEventButton.module.scss";

export default function DeleteEventButton({ eventId }: { eventId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement cet événement ?")) return;

    setPending(true);
    setError("");
    const result = await delectEvent(eventId);

    if (result.error) {
      setError(result.message);
      setPending(false);
      return;
    }

    router.push(result.redirect || "/events/my-events");
    router.refresh();
  };

  return (
    <div>
      <button
        type="button"
        className={styles.button}
        onClick={handleDelete}
        disabled={pending}
      >
        {pending ? "Suppression..." : "Supprimer"}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
