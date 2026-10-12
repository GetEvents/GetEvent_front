"use client";

import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getOrganizerBalance,
  getRefunds,
  requestPayout,
} from "@/actions/payment";

export const paymentKeys = {
  all: ["payment"] as const,
  balance: () => [...paymentKeys.all, "balance"] as const,
  refunds: (status = "PENDING") =>
    [...paymentKeys.all, "refunds", status] as const,
};

export const paymentQueries = {
  balance: () =>
    queryOptions({
      queryKey: paymentKeys.balance(),
      queryFn: getOrganizerBalance,
      staleTime: 60 * 1000,
    }),
  refunds: (status = "PENDING") =>
    queryOptions({
      queryKey: paymentKeys.refunds(status),
      queryFn: () => getRefunds(status),
      staleTime: 60 * 1000,
    }),
};

export const payoutMutations = {
  request: () =>
    mutationOptions({
      mutationFn: (amount: number) => requestPayout(amount),
    }),
};

export function usePayout() {
  const queryClient = useQueryClient();
  return useMutation({
    ...payoutMutations.request(),
    onSuccess: (result) => {
      if (result.success) {
        void queryClient.invalidateQueries({
          queryKey: paymentKeys.balance(),
        });
      }
    },
  });
}

export function useOrganizerBalance(enabled = true) {
  return useQuery({
    ...paymentQueries.balance(),
    enabled,
  });
}

export function useRefunds(status = "PENDING", enabled = true) {
  return useQuery({
    ...paymentQueries.refunds(status),
    enabled,
  });
}
