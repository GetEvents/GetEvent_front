import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAllEvent } from "@/actions/event";
import type { Event, EventFilters } from "@/actions/types/event";

export async function fetchEvents(filters: EventFilters = {}) {
  const response = await getAllEvent(filters);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.events;
}

export function useEvents(filters: EventFilters) {
  return useQuery<Event[], Error>({
    queryKey: ["events", filters],
    queryFn: () => fetchEvents(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });
}
