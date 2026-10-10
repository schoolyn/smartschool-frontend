import { Link } from "react-router-dom";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import ButtonSpinner from "@/icons/button-spinner";
import AuthHeading from "../components/auth-heading";
import AuthLayout from "../components/auth-layout";
import AuthSubmitButton from "../components/auth-submit-button";
import useLoginController from "./login-controller";

const Login = () => {
  const { t, form, isSigninLoading, onSubmit } = useLoginController();
  const isFilled = !!form.watch("email") && !!form.watch("password");

  return (
    <AuthLayout showBanner>
      <AuthHeading title={t("labels.sign_in_heading")} subtitle={t("labels.sign_in_subtitle")} />

      <Form {...form}>
        <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-1.5">{t("labels.email")}</FormLabel>
                <FormControl>
                  <Input {...field} type="email" autoComplete="email" placeholder="name@school.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="mb-1.5 flex items-center justify-between">
                  <FormLabel className="mb-0">{t("labels.password")}</FormLabel>
                  <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-gray-900">
                    {t("labels.forgot_password?")}
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput {...field} autoComplete="current-password" placeholder="Password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <AuthSubmitButton dimmed={!isFilled} disabled={isSigninLoading}>
            {isSigninLoading && <ButtonSpinner />}
            {t("buttons.sign_in")}
          </AuthSubmitButton>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default Login;
