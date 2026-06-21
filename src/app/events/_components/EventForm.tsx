"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Event } from "@/actions/types/event";
import { useCreateEvent, useUpdateEvent } from "@/hooks/useEvents";
import styles from "./EventForm.module.scss";

const toDateInput = (value?: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

export default function EventForm({ event }: { event?: Event }) {
  const router = useRouter();
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const mutation = event ? updateMutation : createMutation;
  const state = mutation.data;
  const [isFree, setIsFree] = useState(event ? !event.paymentRequired : true);

  const handleSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    mutation.mutate(new FormData(submitEvent.currentTarget), {
      onSuccess: (result) => {
        if (!result.error && result.redirect) router.push(result.redirect);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {event && <input type="hidden" name="id" value={event.id} />}

      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            {event ? "Modification" : "Nouvel événement"}
          </p>
          <h1>{event ? event.title : "Créer un événement"}</h1>
          <p>
            Les champs correspondent directement au modèle Event du schéma
            Prisma.
          </p>
        </div>
      </div>

      <section className={styles.section}>
        <h2>Informations générales</h2>
        <div className={styles.grid}>
          <label className={styles.full}>
            <span>Titre</span>
            <input
              name="title"
              type="text"
              maxLength={100}
              defaultValue={event?.title}
              required
            />
          </label>

          <label>
            <span>Catégorie</span>
            <input
              name="category"
              type="text"
              maxLength={50}
              defaultValue={event?.category || ""}
              placeholder="Musique, sport, technologie..."
              required
            />
          </label>

          <label>
            <span>Capacité</span>
            <input
              name="capacity"
              type="number"
              min={1}
              step={1}
              defaultValue={event?.capacity || 1}
              required
            />
          </label>

          <label className={styles.full}>
            <span>Description</span>
            <textarea
              name="description"
              maxLength={10000}
              rows={7}
              defaultValue={event?.description}
              required
            />
          </label>

          <label className={styles.full}>
            <span>
              Image de couverture {event ? "(laisser vide pour conserver)" : ""}
            </span>
            <input
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={!event}
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Date et lieu</h2>
        <div className={styles.grid}>
          <label>
            <span>Date de début</span>
            <input
              name="startDate"
              type="date"
              defaultValue={toDateInput(event?.startDate)}
              required
            />
          </label>
          <label>
            <span>Heure de début</span>
            <input
              name="startTime"
              type="time"
              defaultValue={event?.startTime?.slice(0, 5) || ""}
              required
            />
          </label>
          <label>
            <span>Date de fin</span>
            <input
              name="endDate"
              type="date"
              defaultValue={toDateInput(event?.endDate)}
              required
            />
          </label>
          <label>
            <span>Heure de fin</span>
            <input
              name="endTime"
              type="time"
              defaultValue={event?.endTime?.slice(0, 5) || ""}
              required
            />
          </label>
          <label className={styles.full}>
            <span>Lieu</span>
            <input
              name="location"
              type="text"
              maxLength={200}
              defaultValue={event?.location}
              required
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Billetterie</h2>
        <input type="hidden" name="isFree" value={String(isFree)} />
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={isFree}
            onChange={(event) => setIsFree(event.target.checked)}
          />
          <span>Événement gratuit</span>
        </label>

        {!isFree && (
          <label className={styles.price}>
            <span>Prix par participant</span>
            <input
              name="paymentPrice"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={event?.paymentPrice || ""}
              required
            />
          </label>
        )}
      </section>

      {state?.message && (
        <p className={state.error ? styles.error : styles.success}>
          {state.message}
        </p>
      )}

      <div className={styles.actions}>
        <button type="button" onClick={() => router.back()}>
          Annuler
        </button>
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Enregistrement..."
            : event
              ? "Enregistrer les modifications"
              : "Créer l’événement"}
        </button>
      </div>
    </form>
  );
}
