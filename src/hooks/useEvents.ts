"use client";

import {
  keepPreviousData,
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addEvent,
  delectEvent,
  editeEvent,
  getAllEvent,
  getEventById,
  getEventByUser,
  joinEvent,
  leaveEvent,
} from "@/actions/event";
import type { Event, EventFilters } from "@/actions/types/event";
import { participantKeys } from "@/hooks/useParticipants";

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters: EventFilters = {}) =>
    [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (eventId: number) => [...eventKeys.details(), eventId] as const,
  mine: () => [...eventKeys.all, "mine"] as const,
};

export async function fetchEvents(
  filters: EventFilters = {},
): Promise<Event[]> {
  const response = await getAllEvent(filters);
  if (response.error) throw new Error(response.error);
  return response.events;
}

export const eventQueries = {
  list: (filters: EventFilters = {}) =>
    queryOptions({
      queryKey: eventKeys.list(filters),
      queryFn: () => fetchEvents(filters),
      placeholderData: keepPreviousData,
      staleTime: 60 * 1000,
    }),

  detail: (eventId: number) =>
    queryOptions({
      queryKey: eventKeys.detail(eventId),
      queryFn: () => getEventById(eventId),
      enabled: Number.isInteger(eventId) && eventId > 0,
    }),

  mine: () =>
    queryOptions({
      queryKey: eventKeys.mine(),
      queryFn: getEventByUser,
    }),
};

export const eventMutations = {
  create: () =>
    mutationOptions({
      mutationFn: (formData: FormData) => addEvent(null, formData),
    }),
  update: () =>
    mutationOptions({
      mutationFn: (formData: FormData) => editeEvent(null, formData),
    }),
  delete: () =>
    mutationOptions({
      mutationFn: (eventId: number) => delectEvent(eventId),
    }),
  join: () =>
    mutationOptions({
      mutationFn: (eventId: number) => joinEvent(eventId),
    }),
  leave: () =>
    mutationOptions({
      mutationFn: (ticketId: number) => leaveEvent(ticketId),
    }),
};

export function useEvents(filters: EventFilters = {}) {
  return useQuery(eventQueries.list(filters));
}

export function useEvent(eventId: number) {
  return useQuery(eventQueries.detail(eventId));
}

export function useMyEvents() {
  return useQuery(eventQueries.mine());
}

function useEventMutationCache() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: eventKeys.all });
  };
}

export function useCreateEvent() {
  const invalidateEvents = useEventMutationCache();
  return useMutation({
    ...eventMutations.create(),
    onSuccess: (result) => {
      if (!result.error) invalidateEvents();
    },
  });
}

export function useUpdateEvent() {
  const invalidateEvents = useEventMutationCache();
  return useMutation({
    ...eventMutations.update(),
    onSuccess: (result) => {
      if (!result.error) invalidateEvents();
    },
  });
}

export function useDeleteEvent() {
  const invalidateEvents = useEventMutationCache();
  return useMutation({
    ...eventMutations.delete(),
    onSuccess: (result) => {
      if (!result.error) invalidateEvents();
    },
  });
}

export function useJoinEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    ...eventMutations.join(),
    onSuccess: (result) => {
      if (result.error) return;
      void queryClient.invalidateQueries({ queryKey: eventKeys.all });
      void queryClient.invalidateQueries({ queryKey: participantKeys.all });
    },
  });
}

export function useLeaveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    ...eventMutations.leave(),
    onSuccess: (result) => {
      if (result.error) return;
      void queryClient.invalidateQueries({ queryKey: eventKeys.all });
      void queryClient.invalidateQueries({ queryKey: participantKeys.all });
    },
  });
}
