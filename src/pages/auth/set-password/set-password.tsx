import { Link } from "react-router-dom";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import BrandLogo from "@/components/brand-logo";
import EyeON from "@/icons/eye-on-icon";
import EyeOff from "@/icons/eye-off";
import ButtonSpinner from "@/icons/button-spinner";
import useSetPasswordController from "./set-password-controller";

const SetPassword = () => {
  const { form, hasToken, showPassword, error, isLoading, setShowPassword, onSubmit } = useSetPasswordController();

  return (
    <div className="min-h-screen flex items-center justify-center flex-col bg-gray-100">
      <BrandLogo className="h-7 w-auto mb-2" />
      <div className="max-w-sm w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-2 text-xl font-bold text-gray-900">Set Your Password</h2>
          <span className="text-xs text-gray-600">Choose a password to activate your account</span>
        </div>

        {!hasToken ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-red-600">This link is invalid or missing its token.</p>
            <Link to="/login" className="text-xs text-primary-600">
              Return to login
            </Link>
          </div>
        ) : (
          <Form {...form}>
            <form className="mt-8 space-y-6" onSubmit={onSubmit} noValidate>
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="New password"
                            className="pr-10"
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 pl-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeON /> : <EyeOff />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <p className="text-xs text-gray-500">
                At least 10 characters, with a mix of uppercase, lowercase, numbers or symbols.
              </p>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {isLoading && <ButtonSpinner />}
                  Set Password
                </button>
              </div>

              <div className="text-center">
                <Link to="/login" className="text-xs text-gray-600">
                  Return to login
                </Link>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default SetPassword;
