import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import type { UseMutationResult } from "@tanstack/react-query";

import { IAPIError } from "@/types";
import { passwordSchema, PasswordFormValues } from "./password.schema";

type PasswordMutation = UseMutationResult<void, IAPIError, { token: string; password: string }>;

// shared by the invite (set password) and forgot-password (reset password) pages: both arrive from an emailed
// link carrying a token, ask for a new password twice, and send the user to sign in afterwards
export const usePasswordTokenForm = (mutation: PasswordMutation, successMessage: string) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [error, setError] = useState("");

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setError("");

    mutation.mutate(
      { token, password: values.password },
      {
        onSuccess: () => {
          toast.success(successMessage);
          navigate("/login");
        },
        onError: (err) => setError(err?.response?.Error?.message || "Something went wrong. Please try again."),
      },
    );
  });

  return { form, hasToken: !!token, error, isLoading: mutation.isPending, onSubmit };
};
