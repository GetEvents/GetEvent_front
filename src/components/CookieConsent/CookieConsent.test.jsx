import React from "react";
import { describe, expect, it, vi } from "vitest";
import CookieConsent, { COOKIE_NAME } from "./CookieConsent";
import { click, render } from "@/tests/render";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }) => <a href={href}>{children}</a>,
}));

function clearConsent() {
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0`;
}

describe("CookieConsent", () => {
  it("affiche la bannière en l'absence de choix", async () => {
    clearConsent();
    const { container } = await render(<CookieConsent />);
    expect(
      container.querySelector("[aria-label='Gestion des cookies']"),
    ).toBeTruthy();
    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "/legal/privacy-policy",
    );
  });

  it("mémorise le refus des cookies optionnels", async () => {
    clearConsent();
    const listener = vi.fn();
    window.addEventListener("cookie-consent-change", listener);
    const { container } = await render(<CookieConsent />);
    await click(
      Array.from(container.querySelectorAll("button")).find((button) =>
        button.textContent.includes("Refuser"),
      ),
    );
    expect(decodeURIComponent(document.cookie)).toContain('"optional":false');
    expect(listener).toHaveBeenCalledOnce();
    expect(
      container.querySelector("[aria-label='Gestion des cookies']"),
    ).toBeNull();
    window.removeEventListener("cookie-consent-change", listener);
  });

  it("ne s'affiche plus lorsqu'un choix existe", async () => {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify({ necessary: true, optional: true }))}; Path=/`;
    const { container } = await render(<CookieConsent />);
    expect(
      container.querySelector("[aria-label='Gestion des cookies']"),
    ).toBeNull();
  });
});
