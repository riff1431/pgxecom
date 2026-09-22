"use client";

import { useMutation } from "@tanstack/react-query";

import { api as instance } from "@/lib/api";
import type {
  ApiResponse,
  ContactPayload,
  ContactSubmissionResponse,
} from "@/types";

export const useSubmitContactMessage = () => {
  return useMutation({
    mutationFn: async (payload: ContactPayload) => {
      const response = await instance.post<
        ApiResponse<ContactSubmissionResponse>
      >("/contact", payload);

      return response.data.data;
    },
  });
};
