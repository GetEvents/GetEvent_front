import React from "react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { click, render } from "@/tests/render";
import { NotificationProvider, useNotification } from "./NotificationProvider";

function Trigger({ duration = 0, type = "success" }) {
  const { notify } = useNotification();
  return (
    <button onClick={() => notify("Operation reussie", type, duration)}>
      Notifier
    </button>
  );
}

describe("NotificationProvider", () => {
  it("affiche puis ferme une notification", async () => {
    const { container } = await render(
      <NotificationProvider>
        <Trigger />
      </NotificationProvider>,
    );
    await click(container.querySelector("button"));
    expect(container.querySelector("[role='status']")?.textContent).toContain(
      "Operation reussie",
    );
    await click(
      container.querySelector("button[aria-label='Fermer la notification']"),
    );
    expect(container.querySelector("[role='status']")).toBeNull();
  });

  it("supprime automatiquement une notification temporisee", async () => {
    vi.useFakeTimers();
    const { container } = await render(
      <NotificationProvider>
        <Trigger duration={100} type="inconnu" />
      </NotificationProvider>,
    );
    await click(container.querySelector("button"));
    await act(async () => vi.advanceTimersByTime(100));
    expect(container.querySelector("[role='status']")).toBeNull();
    vi.useRealTimers();
  });

  it("refuse le hook hors du provider", async () => {
    function Invalid() {
      useNotification();
      return null;
    }
    await expect(render(<Invalid />)).rejects.toThrow(/NotificationProvider/);
  });
});
