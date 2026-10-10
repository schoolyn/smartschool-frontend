import React from "react";

import AuthHeading from "../../components/auth-heading";
import AuthLayout from "../../components/auth-layout";
import AuthSubmitButton from "../../components/auth-submit-button";
import useForgotPasswordEmailController from "./forgot-password-email-controller";
import { IForgotPassword } from "@/types";

const ForgotPasswordEmail: React.FC<IForgotPassword> = ({ email }) => {
  const { t, redirectToLogin } = useForgotPasswordEmailController();

  return (
    <AuthLayout split={false}>
      <AuthHeading
        title={t("labels.check_your_email")}
        subtitle={
          <>
            {t("labels.sent_email_notification_initial")}
            <span className="font-medium text-gray-900">{email}</span>
            {t("labels.sent_email_notification_back")}
          </>
        }
      />

      <AuthSubmitButton type="button" onClick={redirectToLogin} className="mt-6">
        {t("buttons.return_to_login_forget_password")}
      </AuthSubmitButton>

      <p className="mt-5 text-xs text-gray-500">{t("labels.check_spam_if_email_not_found")}</p>
    </AuthLayout>
  );
};

export default ForgotPasswordEmail;
