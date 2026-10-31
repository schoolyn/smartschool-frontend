import PasswordTokenForm from "../components/password-token-form";
import useResetPasswordController from "./reset-password-controller";

const ResetPassword = () => {
  const c = useResetPasswordController();
  return (
    <PasswordTokenForm
      title="Reset your password"
      subtitle="Choose a new password for your Opscul account."
      submitLabel="Reset Password"
      successMessage="Password reset successfully. You can now sign in."
      invalidLinkMessage="This reset link is invalid or missing its token. Request a new one from the sign-in page."
      mutation={c.mutation}
    />
  );
};

export default ResetPassword;
