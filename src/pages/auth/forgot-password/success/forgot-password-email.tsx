import React from "react";

import BrandLogo from "@/components/brand-logo";
import useForgotPasswordEmailController from "./forgot-password-email-controller";
import { IForgotPassword } from "@/types";

const ForgotPasswordEmail: React.FC<IForgotPassword> = ({ email }) => {
  const { t, redirectToLogin } = useForgotPasswordEmailController();

  return (
    <div className="min-h-screen flex items-center justify-center flex-col bg-gray-100">
      <BrandLogo className="h-7 w-auto mb-2" />
      <div className="max-w-sm w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-2 text-xl font-bold text-gray-900">
            {t("labels.forgot_password")}
          </h2>
          <span className="text-xs text-gray-600">
            {t("labels.sent_email_notification_initial")}
            {email}
            {t("labels.sent_email_notification_back")}
          </span>
        </div>

        <div className="m-b-32">
          <button
            type="submit"
            onClick={redirectToLogin}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
          >
            {t("buttons.return_to_login_forget_password")}
          </button>
        </div>
        <span className="block text-xs text-gray-600">
          {t("labels.check_spam_if_email_not_found")}
        </span>
      </div>
    </div>
  );
};

export default ForgotPasswordEmail;
