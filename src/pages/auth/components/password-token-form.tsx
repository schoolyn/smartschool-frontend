import { Link } from "react-router-dom";
import type { UseMutationResult } from "@tanstack/react-query";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import ButtonSpinner from "@/icons/button-spinner";
import { IAPIError } from "@/types";
import AuthHeading from "./auth-heading";
import AuthLayout from "./auth-layout";
import AuthSubmitButton from "./auth-submit-button";
import { usePasswordTokenForm } from "./use-password-token-form";

interface PasswordTokenFormProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  successMessage: string;
  invalidLinkMessage: string;
  mutation: UseMutationResult<void, IAPIError, { token: string; password: string }>;
}

const ReturnToLogin = () => (
  <div className="text-center">
    <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
      Return to login
    </Link>
  </div>
);

const PasswordTokenForm = ({
  title,
  subtitle,
  submitLabel,
  successMessage,
  invalidLinkMessage,
  mutation,
}: PasswordTokenFormProps) => {
  const { form, hasToken, error, isLoading, onSubmit } = usePasswordTokenForm(mutation, successMessage);

  return (
    <AuthLayout>
      <AuthHeading title={title} subtitle={subtitle} />

      {!hasToken ? (
        <div className="mt-6 space-y-4">
          <p className="text-center text-sm text-red-600">{invalidLinkMessage}</p>
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
              {submitLabel}
            </AuthSubmitButton>
            <ReturnToLogin />
          </form>
        </Form>
      )}
    </AuthLayout>
  );
};

export default PasswordTokenForm;
