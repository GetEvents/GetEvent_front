import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, getByText } from "@/tests/render";
import WelcomePage from "./index";

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

vi.mock("../FAQ", () => ({
  default: () => <section>Questions frequentes</section>,
}));

vi.mock("../Features", () => ({
  default: () => <section>Fonctionnalites principales</section>,
}));

vi.mock("../Impact", () => ({
  default: () => <section>Impact GetEvent</section>,
}));

vi.mock("../EventTypes", () => ({
  default: () => <section>Types d&apos;evenements</section>,
}));

describe("WelcomePage", () => {
  it("affiche les appels a l'action principaux de la page d'accueil", async () => {
    const { container } = await render(<WelcomePage />);

    expect(getByText(container, /Plateforme de gestion/)).toBeTruthy();
    expect(getByText(container, /Billetterie intelligente/)).toBeTruthy();
    expect(container.querySelector('a[href="/events/create"]')).toBeTruthy();
    expect(container.querySelector('a[href="/events"]')).toBeTruthy();
  });

  it("rend les sections de presentation du prototype", async () => {
    const { container } = await render(<WelcomePage />);

    expect(container.querySelector("#event-types")).toBeTruthy();
    expect(container.querySelector("#features")).toBeTruthy();
    expect(container.querySelector("#impact")).toBeTruthy();
    expect(container.querySelector("#faq")).toBeTruthy();
  });
});
