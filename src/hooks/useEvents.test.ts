import { beforeEach, describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({
  addEvent: vi.fn(),
  delectEvent: vi.fn(),
  editeEvent: vi.fn(),
  getAllEvent: vi.fn(),
  getEventById: vi.fn(),
  getEventByUser: vi.fn(),
  joinEvent: vi.fn(),
  leaveEvent: vi.fn(),
}));

vi.mock("@/actions/event", () => actions);
vi.mock("@/hooks/useParticipants", () => ({
  participantKeys: { all: ["participants"] },
}));

import {
  eventKeys,
  eventMutations,
  eventQueries,
  fetchEvents,
} from "./useEvents";

describe("useEvents query options", () => {
  beforeEach(() => vi.clearAllMocks());

  it("construit des cles de cache stables", () => {
    expect(eventKeys.all).toEqual(["events"]);
    expect(eventKeys.list({ search: "concert" })).toEqual([
      "events",
      "list",
      { search: "concert" },
    ]);
    expect(eventKeys.detail(7)).toEqual(["events", "detail", 7]);
    expect(eventKeys.mine()).toEqual(["events", "mine"]);
  });

  it("retourne les evenements de l'action", async () => {
    actions.getAllEvent.mockResolvedValue({ events: [{ id: 1 }] });
    await expect(fetchEvents({ search: "jazz" })).resolves.toEqual([{ id: 1 }]);
    expect(actions.getAllEvent).toHaveBeenCalledWith({ search: "jazz" });
  });

  it("propage une erreur de chargement", async () => {
    actions.getAllEvent.mockResolvedValue({
      error: "Indisponible",
      events: [],
    });
    await expect(fetchEvents()).rejects.toThrow("Indisponible");
  });

  it("configure correctement les requetes", async () => {
    const list = eventQueries.list({ category: "music" });
    actions.getAllEvent.mockResolvedValue({ events: [] });
    await expect(list.queryFn()).resolves.toEqual([]);
    expect(eventQueries.detail(0).enabled).toBe(false);
    expect(eventQueries.detail(2).enabled).toBe(true);
    expect(eventQueries.mine().queryFn).toBe(actions.getEventByUser);
  });

  it("relie chaque mutation a son action", async () => {
    const data = new FormData();
    await eventMutations.create().mutationFn(data);
    await eventMutations.update().mutationFn(data);
    await eventMutations.delete().mutationFn(4);
    await eventMutations.join().mutationFn(5);
    await eventMutations.leave().mutationFn(6);
    expect(actions.addEvent).toHaveBeenCalledWith(null, data);
    expect(actions.editeEvent).toHaveBeenCalledWith(null, data);
    expect(actions.delectEvent).toHaveBeenCalledWith(4);
    expect(actions.joinEvent).toHaveBeenCalledWith(5);
    expect(actions.leaveEvent).toHaveBeenCalledWith(6);
  });
});
