import { Link } from "react-router-dom";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import ButtonSpinner from "@/icons/button-spinner";
import AuthHeading from "../components/auth-heading";
import AuthLayout from "../components/auth-layout";
import AuthSubmitButton from "../components/auth-submit-button";
import useSetPasswordController from "./set-password-controller";

const ReturnToLogin = () => (
  <div className="text-center">
    <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
      Return to login
    </Link>
  </div>
);

const SetPassword = () => {
  const { form, hasToken, error, isLoading, onSubmit } = useSetPasswordController();

  return (
    <AuthLayout>
      <AuthHeading title="Set your password" subtitle="Choose a password to activate your account." />

      {!hasToken ? (
        <div className="mt-6 space-y-4">
          <p className="text-center text-sm text-red-600">This link is invalid or missing its token.</p>
          <ReturnToLogin />
        </div>
      ) : (
        <Form {...form}>
          <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-1.5">New password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} autoComplete="new-password" placeholder="New password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-1.5">Confirm password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} autoComplete="new-password" placeholder="Confirm password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-xs text-gray-500">
              At least 10 characters, with a mix of uppercase, lowercase, numbers or symbols.
            </p>

            <AuthSubmitButton disabled={isLoading}>
              {isLoading && <ButtonSpinner />}
              Set Password
            </AuthSubmitButton>
            <ReturnToLogin />
          </form>
        </Form>
      )}
    </AuthLayout>
  );
};

export default SetPassword;
