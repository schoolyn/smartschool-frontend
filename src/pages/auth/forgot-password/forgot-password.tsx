import React from "react";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import AuthHeading from "../components/auth-heading";
import AuthLayout from "../components/auth-layout";
import AuthSubmitButton from "../components/auth-submit-button";
import { GOOGLE_CAPTCHA_KEY } from "@/utils";
import useForgotPasswordController from "./forgot-password-controller";
import ForgotPasswordEmail from "./success/forgot-password-email";

const ForgotPassword: React.FC = () => {
  const {
    t,
    form,
    email,
    isRequestCompleted,
    isLoading,
    isCaptchaLoaded,
    recaptchaRef,
    displayError,
    error,
    captchaToken,
    onSubmit,
    onCaptchaLoaded,
  } = useForgotPasswordController();

  if (isRequestCompleted) {
    return <ForgotPasswordEmail email={email} />;
  }

  return (
    <AuthLayout split={false}>
      <AuthHeading title={t("labels.forgot_password")} subtitle={t("messages.enter_email_associate_with_account")} />

      {displayError && error && (
        <div className="mt-5 rounded-md bg-red-50 p-3">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-1.5">{t("labels.email")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    autoComplete="email"
                    placeholder={t("labels.forgot_email_placeholder")}
                  />
                </FormControl>
                <FormMessage className="mt-2 text-xs" />
                <p className="mt-2 text-xs text-gray-500">{t("labels.will_inform_you")}</p>
              </FormItem>
            )}
          />

          {isCaptchaLoaded && (
            <div className="flex justify-start">
              <ReCAPTCHA ref={recaptchaRef} sitekey={GOOGLE_CAPTCHA_KEY} onChange={onCaptchaLoaded} />
            </div>
          )}

          <AuthSubmitButton dimmed={!captchaToken} disabled={isLoading}>
            {isLoading ? t("buttons.sending") : t("buttons.reset_password")}
          </AuthSubmitButton>

          <div className="text-center">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
              {t("labels.return_to_login")}
            </Link>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default ForgotPassword;
