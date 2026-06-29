import React from "react";
import { describe, expect, test, vi } from "vitest";

import NotificationModal from "./NotificationModal";
import { click, getByText, render } from "@/tests/render";

vi.mock("@/actions/notification", () => ({
  deleteNotification: vi.fn(async () => ({ success: true })),
  markAllNotificationsAsRead: vi.fn(async () => ({ success: true })),
  markNotificationAsRead: vi.fn(async () => ({ success: true })),
}));

describe("NotificationModal", () => {
  const notifications = [
    {
      id: 1,
      title: "Billet validé",
      message: "Votre participation est confirmée",
      type: "success",
      isRead: false,
      createdAt: "2026-06-29T10:00:00.000Z",
    },
  ];

  test("ne rend rien quand la modale est fermee", async () => {
    const { container } = await render(
      <NotificationModal isOpen={false} notifications={notifications} />,
    );

    expect(container.querySelector("[role='dialog']")).toBeNull();
  });

  test("rend une modale accessible avec les notifications", async () => {
    const { container } = await render(
      <NotificationModal isOpen notifications={notifications} />,
    );

    const dialog = container.querySelector("[role='dialog']");

    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(getByText(container, "Billet validé")).not.toBeNull();
    expect(
      getByText(container, "Votre participation est confirmée"),
    ).not.toBeNull();
  });

  test("affiche l'etat vide sans notification", async () => {
    const { container } = await render(
      <NotificationModal isOpen notifications={[]} />,
    );

    expect(getByText(container, "Aucune notification")).not.toBeNull();
    expect(getByText(container, /Vous.*jour/)).not.toBeNull();
  });

  test("ferme la modale via le bouton de fermeture", async () => {
    const onClose = vi.fn();
    const { container } = await render(
      <NotificationModal
        isOpen
        onClose={onClose}
        notifications={notifications}
      />,
    );

    await click(container.querySelector("button[aria-label='Fermer']"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("met a jour le compteur quand tout est marque comme lu", async () => {
    const setNotifications = vi.fn();
    const setNotificationCount = vi.fn();
    const { container } = await render(
      <NotificationModal
        isOpen
        notifications={notifications}
        setNotifications={setNotifications}
        setNotificationCount={setNotificationCount}
      />,
    );

    await click(
      Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === "Marquer tout comme lu",
      ),
    );

    expect(setNotifications).toHaveBeenCalledWith([
      expect.objectContaining({ id: 1, isRead: true }),
    ]);
    expect(setNotificationCount).toHaveBeenCalledWith(0);
  });
});
