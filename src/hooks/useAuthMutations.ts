"use client";

import {
  mutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  changeCurrentPassword,
  deleteCurrentAccount,
  editProfil,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
} from "@/actions/auth/authActions";
import { useAuth } from "@/hooks/useAuth";

export const authMutations = {
  login: () =>
    mutationOptions({ mutationFn: (data: FormData) => login(null, data) }),
  register: () =>
    mutationOptions({ mutationFn: (data: FormData) => register(null, data) }),
  updateProfile: () =>
    mutationOptions({ mutationFn: (data: FormData) => editProfil(null, data) }),
  forgotPassword: () =>
    mutationOptions({
      mutationFn: (data: FormData) => forgotPassword(null, data),
    }),
  resetPassword: () =>
    mutationOptions({
      mutationFn: (data: FormData) => resetPassword(null, data),
    }),
  changePassword: () => mutationOptions({ mutationFn: changeCurrentPassword }),
  deleteAccount: () => mutationOptions({ mutationFn: deleteCurrentAccount }),
  logout: () => mutationOptions({ mutationFn: logout }),
};

export const useLogin = () => useMutation(authMutations.login());
export const useRegister = () => useMutation(authMutations.register());
export const useForgotPassword = () =>
  useMutation(authMutations.forgotPassword());
export const useResetPassword = () =>
  useMutation(authMutations.resetPassword());
export const useChangePassword = () =>
  useMutation(authMutations.changePassword());

export function useUpdateProfile() {
  const { setUser } = useAuth();
  return useMutation({
    ...authMutations.updateProfile(),
    onSuccess: (result) => {
      if (!result.error && result.user) setUser(result.user);
    },
  });
}

export function useDeleteAccount() {
  const { logout: clearAuth } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    ...authMutations.deleteAccount(),
    onSuccess: (result) => {
      if (result.error) return;
      clearAuth();
      queryClient.clear();
    },
  });
}

export function useLogout() {
  const { logout: clearAuth } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    ...authMutations.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}
