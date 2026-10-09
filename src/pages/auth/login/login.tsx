import { Link } from "react-router-dom";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import BrandLogo from "@/components/brand-logo";
import EyeON from "@/icons/eye-on-icon";
import EyeOff from "@/icons/eye-off";
import useLoginController from "./login-controller";
import ButtonSpinner from "@/icons/button-spinner";

const Login = () => {
  const { t, form, showPassword, isSigninLoading, setShowPassword, onSubmit } = useLoginController();
  const email = form.watch("email");
  const password = form.watch("password");

  return (
    <div className="min-h-screen flex items-center justify-center flex-col bg-gray-100">
      <BrandLogo className="h-14 w-auto mb-6" />
      <div className="max-w-sm w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-2 text-xl font-bold text-gray-900">{t("labels.welcome")}</h2>
          <span className="text-xs text-gray-600">{t("labels.sign_in_to_your_account")}</span>
        </div>

        <Form {...form}>
          <form className="mt-8 space-y-6" onSubmit={onSubmit} noValidate>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} id="email" type="email" placeholder="Email address" />
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
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
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
            </div>

            <div className="text-xs text-right text-primary-600">
              <Link to="/forgot-password">{t("labels.forgot_password?")}</Link>
            </div>

            <div>
              <button
                type="submit"
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  email && password ? "" : "opacity-50 cursor-not-allowed"
                }`}
              >
                {isSigninLoading ? <ButtonSpinner /> : t("buttons.sign_in")}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Login;
