import { describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({
  changeCurrentPassword: vi.fn(),
  confirmeemail: vi.fn(),
  deleteCurrentAccount: vi.fn(),
  editProfil: vi.fn(),
  forgotPassword: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  resetPassword: vi.fn(),
}));
vi.mock("@/actions/auth/authActions", () => actions);

import { authMutations } from "./useAuthMutations";

describe("authMutations", () => {
  it("relie les formulaires aux actions serveur", async () => {
    const data = new FormData();
    await authMutations.login().mutationFn!(data, undefined as any);
    await authMutations.register().mutationFn!(data, undefined as any);
    await authMutations.updateProfile().mutationFn!(data, undefined as any);
    await authMutations.forgotPassword().mutationFn!(data, undefined as any);
    await authMutations.resetPassword().mutationFn!(data, undefined as any);
    expect(actions.login).toHaveBeenCalledWith(null, data);
    expect(actions.register).toHaveBeenCalledWith(null, data);
    expect(actions.editProfil).toHaveBeenCalledWith(null, data);
    expect(actions.forgotPassword).toHaveBeenCalledWith(null, data);
    expect(actions.resetPassword).toHaveBeenCalledWith(null, data);
  });

  it("expose les actions sans formulaire", () => {
    expect(authMutations.confirmeemail().mutationFn).toBe(
      actions.confirmeemail,
    );
    expect(authMutations.changePassword().mutationFn).toBe(
      actions.changeCurrentPassword,
    );
    expect(authMutations.deleteAccount().mutationFn).toBe(
      actions.deleteCurrentAccount,
    );
    expect(authMutations.logout().mutationFn).toBe(actions.logout);
  });
});
