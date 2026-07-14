import React from "react";
import { describe, expect, it, vi } from "vitest";
import { change, click, render } from "@/tests/render";
import EventsPage from "./page";

const mocks = vi.hoisted(() => ({
  fetchEvents: vi.fn(),
  setToken: vi.fn(),
  setUser: vi.fn(),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    const imageProps = { ...props };
    delete imageProps.priority;
    delete imageProps.quality;
    delete imageProps.fill;

    return <img alt={imageProps.alt || ""} {...imageProps} />;
  },
}));

vi.mock("@/components/ui/EventCart", () => ({
  default: ({ eventList, loading }) => (
    <section aria-label="Liste des evenements">
      {loading ? "Chargement" : `${eventList.length} evenement(s)`}
      {eventList.map((event) => (
        <article key={event.id}>{event.title}</article>
      ))}
    </section>
  ),
}));

vi.mock("@/components/NotificationModal/NotificationModal", () => ({
  default: ({ isOpen }) =>
    isOpen ? <section role="dialog">Notifications</section> : null,
}));

vi.mock("@/actions/notification", () => ({
  fetchGetNotifications: vi.fn(() =>
    Promise.resolve({
      notifications: [],
    }),
  ),
}));

vi.mock("@/actions/auth/authActions", () => ({
  getTokenFromCookie: vi.fn(() => Promise.resolve(null)),
  getUser: vi.fn(() => Promise.resolve({ user: null })),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    setUser: mocks.setUser,
    setToken: mocks.setToken,
    isAuthenticated: false,
  }),
}));

vi.mock("@/hooks/useEvents", () => ({
  fetchEvents: mocks.fetchEvents,
  useEvents: () => ({
    data: [
      {
        id: "event-1",
        title: "Conference GetEvent",
      },
    ],
    error: null,
    isFetching: false,
    isLoading: false,
  }),
}));

vi.mock("@/utils/autocomplet", () => ({
  initMapAuto: vi.fn(),
}));

vi.mock("@/utils/loadGoogleMap", () => ({
  loadGoogleMapsScript: vi.fn(),
}));

describe("EventsPage", () => {
  it("affiche la recherche, les filtres et la liste d'evenements", async () => {
    const { container } = await render(<EventsPage />);

    expect(container.querySelector('input[type="search"]')).toBeTruthy();
    expect(container.querySelector("#pac_input")).toBeTruthy();
    expect(container.querySelector('button[type="button"]')?.textContent).toBe(
      "Rechercher",
    );
    expect(container.textContent).toContain("Conference GetEvent");
    expect(container.textContent).toContain("1 evenement(s)");
  });

  it("permet de saisir une recherche et une localisation", async () => {
    const { container } = await render(<EventsPage />);
    const searchInput = container.querySelector('input[type="search"]');
    const locationInput = container.querySelector("#pac_input");

    await change(searchInput, "conference");
    await change(locationInput, "Cotonou");
    await click(container.querySelector('button[type="button"]'));

    expect(searchInput.value).toBe("conference");
    expect(locationInput.value).toBe("Cotonou");
  });
});
