import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { useSetUserPassword } from "../service";
import { setPasswordSchema, SetPasswordFormValues } from "./set-password.schema";

const useSetPasswordController = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [error, setError] = useState("");

  const form = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const setUserPassword = useSetUserPassword();

  const onSubmit = form.handleSubmit((values) => {
    setError("");

    setUserPassword.mutate(
      { token, password: values.password },
      {
        onSuccess: () => {
          toast.success("Password set successfully. You can now sign in.");
          navigate("/login");
        },
        onError: (err) => {
          setError(err?.response?.Error?.message || "Something went wrong. Please try again.");
        },
      },
    );
  });

  return {
    t,
    form,
    hasToken: !!token,
    error,
    isLoading: setUserPassword.isPending,
    onSubmit,
  };
};

export default useSetPasswordController;
