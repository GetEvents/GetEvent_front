"use client";

import { useCallback } from "react";
import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  addParticipantWithPayment,
  delectParticipant,
  getAllParticipantByUser,
  getParticipantByEventId,
  getParticipantId,
  isRegistered,
  unsubscribeParticipant,
  validateTicketQrCode,
} from "@/actions/participant";
import type { UnsubscribeParticipantInput } from "@/actions/participant";
import type {
  ParticipationTicket,
  ParticipationTicketRecord,
} from "@/actions/types/participation";
import type { Event } from "@/actions/types/event";

export const participantKeys = {
  all: ["participants"] as const,
  byUser: () => [...participantKeys.all, "by-user"] as const,
  byEvent: (eventId: number) =>
    [...participantKeys.all, "by-event", eventId] as const,
  detail: (eventId: number) =>
    [...participantKeys.all, "detail", eventId] as const,
  registration: (eventId: number) =>
    [...participantKeys.all, "registration", eventId] as const,
};

export const participantQueries = {
  byUser: () =>
    queryOptions({
      queryKey: participantKeys.byUser(),
      queryFn: getAllParticipantByUser,
    }),

  byEvent: (eventId: number) =>
    queryOptions({
      queryKey: participantKeys.byEvent(eventId),
      queryFn: () => getParticipantByEventId(eventId),
      enabled: Number.isInteger(eventId) && eventId > 0,
    }),

  detail: (eventId: number) =>
    queryOptions({
      queryKey: participantKeys.detail(eventId),
      queryFn: () => getParticipantId(eventId),
      enabled: Number.isInteger(eventId) && eventId > 0,
    }),

  registration: (eventId: number) =>
    queryOptions({
      queryKey: participantKeys.registration(eventId),
      queryFn: () => isRegistered(eventId),
      enabled: Number.isInteger(eventId) && eventId > 0,
    }),
};

export const participantMutations = {
  unsubscribe: () =>
    mutationOptions({
      mutationFn: (input: UnsubscribeParticipantInput) =>
        unsubscribeParticipant(input),
    }),

  delete: () =>
    mutationOptions({
      mutationFn: (participationId: number) =>
        delectParticipant(participationId),
    }),

  finalizePayment: () =>
    mutationOptions({
      mutationFn: (sessionId: string) => addParticipantWithPayment(sessionId),
    }),

  validateQrCode: () =>
    mutationOptions({
      mutationFn: ({ qrCode, eventId }: { qrCode: string; eventId: number }) =>
        validateTicketQrCode(qrCode, eventId),
    }),
};

export function useParticipationsByUser(enabled = true) {
  return useQuery({
    ...participantQueries.byUser(),
    enabled,
  });
}

const selectTickets = (
  data: Awaited<ReturnType<typeof getAllParticipantByUser>>,
  userId?: number,
): ParticipationTicket[] => {
  const records = Array.isArray(data?.participant)
    ? (data.participant as ParticipationTicketRecord[])
    : [];

  return records.flatMap((record) => {
    const event = record.event || (record as unknown as Event);
    if (!event?.id || !event.title) return [];

    const matchingTicket = event.tickets?.find(
      (ticket) => !userId || Number(ticket.userId) === Number(userId),
    );

    return [
      {
        id: record.id || matchingTicket?.id || event.id,
        event,
        qrCode: record.qrCode || matchingTicket?.qrCode || "",
        status: record.status || matchingTicket?.status,
      },
    ];
  });
};

export function useTicketsByUser(userId?: number, enabled = true) {
  const select = useCallback(
    (data: Awaited<ReturnType<typeof getAllParticipantByUser>>) =>
      selectTickets(data, userId),
    [userId],
  );

  return useQuery({
    ...participantQueries.byUser(),
    enabled,
    select,
  });
}

export function useParticipantsByEvent(eventId: number) {
  return useQuery(participantQueries.byEvent(eventId));
}

export function useParticipantDetail(eventId: number) {
  return useQuery(participantQueries.detail(eventId));
}

export function useParticipantRegistration(eventId: number, enabled = true) {
  return useQuery({
    ...participantQueries.registration(eventId),
    enabled: enabled && Number.isInteger(eventId) && eventId > 0,
  });
}

export function useUnsubscribeParticipant() {
  return useMutation(participantMutations.unsubscribe());
}

export function useDeleteParticipant() {
  return useMutation(participantMutations.delete());
}

export function useFinalizeParticipantPayment() {
  return useMutation(participantMutations.finalizePayment());
}

export function useValidateTicketQrCode() {
  return useMutation(participantMutations.validateQrCode());
}
