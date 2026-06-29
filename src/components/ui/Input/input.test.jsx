import React from "react";
import { describe, expect, test, vi } from "vitest";

import Input from "./input";
import { change, click, render } from "@/tests/render";

describe("Input", () => {
  test("associe le label au champ", async () => {
    const { container } = await render(
      <Input label="Adresse mail" name="email" id="email" />,
    );

    const label = container.querySelector("label");
    const input = container.querySelector("input");

    expect(label?.textContent).toBe("Adresse mail");
    expect(label?.getAttribute("for")).toBe("email");
    expect(input?.getAttribute("id")).toBe("email");
  });

  test("appelle handleChange quand la valeur change", async () => {
    const handleChange = vi.fn();
    const { container } = await render(
      <Input label="Nom" name="name" id="name" handleChange={handleChange} />,
    );

    await change(container.querySelector("input"), "Marcelin");

    expect(handleChange).toHaveBeenCalled();
  });

  test("permet d'afficher et masquer un mot de passe", async () => {
    const { container } = await render(
      <Input
        label="Mot de passe"
        name="password"
        id="password"
        type="password"
      />,
    );

    const input = container.querySelector("input");
    const toggle = container.querySelector("button");

    expect(input?.getAttribute("type")).toBe("password");
    expect(toggle?.getAttribute("aria-label")).toBe("Afficher le mot de passe");

    await click(toggle);

    expect(input?.getAttribute("type")).toBe("text");
    expect(toggle?.getAttribute("aria-label")).toBe("Masquer le mot de passe");
  });

  test("rend une liste de selection", async () => {
    const { container } = await render(
      <Input
        label="Rôle"
        name="role"
        id="role"
        type="select"
        options={[
          { value: "ORGANISATEUR", label: "Organisateur" },
          { value: "PARTICIPANT", label: "Participant" },
        ]}
      />,
    );

    const options = Array.from(container.querySelectorAll("option")).map(
      (option) => option.textContent,
    );

    expect(options).toContain("Organisateur");
    expect(options).toContain("Participant");
  });
});
