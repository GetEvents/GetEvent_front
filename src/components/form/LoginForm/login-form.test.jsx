import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, submit } from "@/tests/render";
import LoginForm from "./index";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  notify: vi.fn(),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/hooks/useAuthMutations", () => ({
  useLogin: () => ({
    isPending: false,
    mutate: mocks.mutate,
  }),
}));

vi.mock("@/components/Notification/NotificationProvider", () => ({
  useNotification: () => ({ notify: mocks.notify }),
}));

describe("LoginForm", () => {
  it("affiche les champs et liens de connexion attendus", async () => {
    const { container } = await render(<LoginForm />);

    expect(container.querySelector('input[name="email"]')).toBeTruthy();
    expect(container.querySelector('input[name="password"]')).toBeTruthy();
    expect(
      container.querySelector('a[href="/auth/forgot-password"]'),
    ).toBeTruthy();
    expect(container.querySelector('a[href="/auth/register"]')).toBeTruthy();
    expect(
      container.querySelector('button[type="submit"]')?.textContent,
    ).toContain("Se connecter");
  });

  it("soumet le formulaire avec les identifiants saisis", async () => {
    const { container } = await render(<LoginForm />);
    const form = container.querySelector("form");

    container.querySelector('input[name="email"]').value = "user@example.com";
    container.querySelector('input[name="password"]').value = "Password123!";

    await submit(form);

    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    const formData = mocks.mutate.mock.calls[0][0];
    expect(form).toBeTruthy();
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("email")).toBe("user@example.com");
    expect(formData.get("password")).toBe("Password123!");
  });
});
