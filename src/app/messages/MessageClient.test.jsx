import React from "react";
import { act } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import MessageClient from "./MessageClient";
import { change, click, getByText, render, submit } from "@/tests/render";

// Faux socket : on garde l'accusé de réception pour le déclencher à la main.
const socketMock = vi.hoisted(() => ({
  lastSend: null,
  sendMessage: vi.fn(),
}));

vi.mock("@/socket", () => ({
  getSocket: vi.fn(),
  joinEvent: vi.fn(),
  leaveEvent: vi.fn(),
  onMessageReceived: vi.fn(() => () => {}),
  onSocketError: vi.fn(() => () => {}),
  onUserJoined: vi.fn(() => () => {}),
  sendMessage: (payload) => {
    socketMock.lastSend = payload;
    socketMock.sendMessage(payload);
    return true;
  },
}));

const renderChat = () =>
  render(
    <MessageClient
      eventId={6}
      token="jeton"
      currentUserId={4}
      currentUser={{ id: 4, prenom: "Awa", nom: "Diallo" }}
      organizerId={9}
      canChat
      initialMessages={[]}
    />,
  );

const typeAndSend = async (container, text) => {
  await change(container.querySelector("input"), text);
  await submit(container.querySelector("form"));
};

describe("MessageClient", () => {
  beforeEach(() => {
    socketMock.lastSend = null;
    socketMock.sendMessage.mockClear();
  });

  test("affiche le message tout de suite, avant la réponse du serveur", async () => {
    const { container } = await renderChat();

    await typeAndSend(container, "Bonjour à tous");

    expect(getByText(container, "Bonjour à tous")).not.toBeNull();
    expect(getByText(container, "Envoi…")).not.toBeNull();
    expect(socketMock.lastSend).toMatchObject({
      eventId: 6,
      text: "Bonjour à tous",
      clientId: expect.any(String),
    });
  });

  test("remplace l'affichage provisoire quand le serveur confirme", async () => {
    const { container } = await renderChat();
    await typeAndSend(container, "Salut");
    const { clientId, onAck } = socketMock.lastSend;

    await act(async () => {
      onAck({
        ok: true,
        message: {
          id: 42,
          eventId: 6,
          text: "Salut",
          senderId: 4,
          senderName: "Awa Diallo",
          createdAt: "2026-11-21T10:30:00.000Z",
          clientId,
        },
      });
    });

    expect(container.textContent).not.toContain("Envoi…");
    expect(container.querySelectorAll("article")).toHaveLength(1);
  });

  test("propose de renvoyer un message dont l'envoi a échoué", async () => {
    const { container } = await renderChat();
    await typeAndSend(container, "Message perdu");

    await act(async () => {
      socketMock.lastSend.onAck({
        ok: false,
        error: "Le serveur ne répond pas.",
      });
    });

    const retry = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Réessayer"),
    );
    expect(retry).toBeDefined();

    const firstClientId = socketMock.lastSend.clientId;
    await click(retry);

    expect(socketMock.sendMessage).toHaveBeenCalledTimes(2);
    expect(socketMock.lastSend.clientId).toBe(firstClientId);
    expect(getByText(container, "Envoi…")).not.toBeNull();
  });
});
