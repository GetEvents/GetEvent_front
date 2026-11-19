import React from "react";
import { describe, expect, test, vi } from "vitest";

import Button from "./index";
import { click, render } from "@/tests/render";

describe("Button", () => {
  test("affiche le libelle fourni", async () => {
    const { container } = await render(<Button label="Créer" />);

    expect(container.querySelector("button")?.textContent).toBe("Créer");
  });

  test("priorise le contenu enfant sur le label", async () => {
    const { container } = await render(
      <Button label="Créer">
        <span>Valider</span>
      </Button>,
    );

    expect(container.querySelector("button")?.textContent).toBe("Valider");
  });

  test("declenche l'action au clic", async () => {
    const onClick = vi.fn();
    const { container } = await render(
      <Button label="Supprimer" onClick={onClick} />,
    );

    await click(container.querySelector("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("sans variante, garde uniquement la classe fournie", async () => {
    const { container } = await render(
      <Button label="Créer" className="maClasse" />,
    );

    expect(container.querySelector("button")?.className).toBe("maClasse");
  });

  test("avec une variante, ajoute les classes du design", async () => {
    const { container } = await render(
      <Button label="Créer" variant="primary" size="lg" block />,
    );

    // 3 classes : variante, taille et pleine largeur.
    expect(
      container.querySelector("button")?.className.split(" ").filter(Boolean),
    ).toHaveLength(3);
  });
});
