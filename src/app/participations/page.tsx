"use client";
import style from "./style.module.scss";
import React, { useEffect, useMemo, useState } from "react";
import EventCard from "@/components/ui/EventCart";
import { getAllParticipantByUser } from "@/actions/participant/index";
import type { Event } from "@/actions/types/event";
import { useAuth } from "@/hooks/useAuth";

type ParticipationEvent = Event & {
  _participationId?: number | string;
};

type ParticipationItem =
  | (Partial<ParticipationEvent> & {
      id?: number | string;
      event?: Event;
    })
  | null
  | undefined;

const mapParticipationToEvent = (
  participation: ParticipationItem,
): ParticipationEvent | null => {
  if (!participation) return null;

  if (participation.event) {
    return {
      ...participation.event,
      _participationId: participation.id,
    };
  }

  return participation as ParticipationEvent;
};

export default function Welcome() {
  const { user, loading: authLoading } = useAuth();
  const [eventList, setEventList] = useState<ParticipationEvent[]>([]);
  const [isLoadingParticipations, setIsLoadingParticipations] = useState(true);
  const [feedback, setFeedback] = useState<{
    error: boolean;
    message: string;
  } | null>(null);

  const loading = authLoading || isLoadingParticipations;
  const eventCountLabel = useMemo(
    () => `Événement${eventList.length > 1 ? "s" : ""}`,
    [eventList.length],
  );

  useEffect(() => {
    let isMounted = true;

    const loadParticipations = async () => {
      setIsLoadingParticipations(true);
      setFeedback(null);

      try {
        const response = await getAllParticipantByUser();

        if (!isMounted) return;

        const rawList = Array.isArray(response?.participant)
          ? response.participant
          : [];

        const mappedEvents = rawList
          .map(mapParticipationToEvent)
          .filter((event): event is ParticipationEvent => Boolean(event));
        setEventList(mappedEvents);
      } catch {
        if (!isMounted) return;

        setFeedback({
          error: true,
          message: "Impossible de charger vos participations.",
        });
      } finally {
        if (isMounted) {
          setIsLoadingParticipations(false);
        }
      }
    };

    void loadParticipations();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={style.parent_container}>
      <div className={style.header_section}>
        <div className={style.header_content}>
          <div>
            <h1 className={style.main_title}>Mes Participations</h1>
            <p className={style.description}>
              Découvrez et gérez les événements auxquels vous participez
            </p>
          </div>
          <div className={style.event_badge}>
            <span className={style.badge_number}>{eventList.length}</span>
            <span className={style.badge_text}>{eventCountLabel}</span>
          </div>
        </div>
      </div>

      <div className={style.content_section}>
        <EventCard
          message={feedback}
          eventList={eventList}
          loading={loading}
          current_user={user}
          state={feedback}
          show={Boolean(feedback)}
          handleClose={() => setFeedback(null)}
        />
      </div>
    </div>
  );
}
