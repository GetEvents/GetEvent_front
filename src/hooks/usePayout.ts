"use client";

import { mutationOptions, useMutation } from "@tanstack/react-query";
import { requestPayout } from "@/actions/payment";

export const payoutMutations = {
  request: () =>
    mutationOptions({
      mutationFn: (amount: number) => requestPayout(amount),
    }),
};

export function usePayout() {
  return useMutation(payoutMutations.request());
}
