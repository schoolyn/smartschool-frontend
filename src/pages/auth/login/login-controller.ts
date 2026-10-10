import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/context/auth-context";
import { useSingIn } from "../service";
import { useError } from "@/hooks";
import { loginSchema, LoginFormValues } from "./login.schema";

const useLoginController = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signIn = useSingIn();

  useError({
    mutation: signIn,
  });

  const onSubmit = form.handleSubmit((values) => {
    signIn.mutate(values);
  });

  useEffect(() => {
    if (signIn.isSuccess && signIn.data) {
      login(signIn.data);
      navigate(`/organization`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signIn.data, signIn.isSuccess]);

  return {
    t,
    form,
    isSigninLoading: signIn.isPending,
    onSubmit,
  };
};

export default useLoginController;
