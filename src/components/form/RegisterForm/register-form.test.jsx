import React from "react";
import { describe, expect, it, vi } from "vitest";
import { click, render } from "@/tests/render";
import RegisterForm from "./index";

const mocks = vi.hoisted(() => ({
  notify: vi.fn(),
  registerMutate: vi.fn(),
  setUser: vi.fn(),
  updateProfileMutate: vi.fn(),
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
    delete imageProps.unoptimized;

    return <img alt={imageProps.alt || ""} {...imageProps} />;
  },
}));

vi.mock("@/components/Notification/NotificationProvider", () => ({
  useNotification: () => ({ notify: mocks.notify }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    setUser: mocks.setUser,
  }),
}));

vi.mock("@/hooks/useAuthMutations", () => ({
  useRegister: () => ({
    isPending: false,
    mutate: mocks.registerMutate,
  }),
  useUpdateProfile: () => ({
    isPending: false,
    mutate: mocks.updateProfileMutate,
  }),
}));

describe("RegisterForm", () => {
  it("affiche les champs de la premiere etape d'inscription", async () => {
    const { container } = await render(<RegisterForm id={false} />);

    expect(container.querySelector('input[name="prenom"]')).toBeTruthy();
    expect(container.querySelector('input[name="nom"]')).toBeTruthy();
    expect(container.querySelector('input[name="email"]')).toBeTruthy();
    expect(
      container.querySelector('input[name="date_naissance"]'),
    ).toBeTruthy();
    expect(container.querySelector('input[name="password"]')).toBeTruthy();
    expect(
      container.querySelector('input[name="passwordConfime"]'),
    ).toBeTruthy();
    expect(container.querySelector('input[name="photo"]')).toBeTruthy();
    expect(container.querySelector('a[href="/auth/login"]')).toBeTruthy();
  });

  it("bloque le passage a l'etape suivante si les champs obligatoires sont vides", async () => {
    const { container } = await render(<RegisterForm id={false} />);

    const nextButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent.includes("Suivant"),
    );

    await click(nextButton);

    expect(mocks.notify).toHaveBeenCalledWith(
      "Veuillez remplir tous les champs de cette étape.",
      "error",
    );
    expect(mocks.registerMutate).not.toHaveBeenCalled();
    expect(container.querySelector('select[name="role"]')).toBeFalsy();
  });
});
