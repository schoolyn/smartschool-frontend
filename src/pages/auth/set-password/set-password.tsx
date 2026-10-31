import PasswordTokenForm from "../components/password-token-form";
import useSetPasswordController from "./set-password-controller";

const SetPassword = () => {
  const c = useSetPasswordController();
  return (
    <PasswordTokenForm
      title="Set your password"
      subtitle="Choose a password to activate your account."
      submitLabel="Set Password"
      successMessage="Password set successfully. You can now sign in."
      invalidLinkMessage="This link is invalid or missing its token."
      mutation={c.mutation}
    />
  );
};

export default SetPassword;
