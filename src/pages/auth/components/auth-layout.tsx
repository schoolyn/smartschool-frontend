import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import BrandLogo from "@/components/brand-logo";
import { cn } from "@/lib/utils";
import AuthBanner from "./auth-banner";
import AuthShowcase from "./auth-showcase";

interface AuthLayoutProps {
  children: ReactNode;
  showBanner?: boolean;
  split?: boolean;
}

// shared shell for the auth pages: a centred card, plus the product preview beside it when `split`
const AuthLayout = ({ children, showBanner = false, split = true }: AuthLayoutProps) => {
  const { t } = useTranslation();

  return (
    <div className={cn("min-h-screen bg-gray-100", split && "lg:grid lg:grid-cols-2")}>
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <BrandLogo className="h-7 w-auto" />
          {showBanner && <AuthBanner />}
          {children}
          <p className="mt-8 text-center text-xs text-gray-500">{t("labels.copyright")}</p>
        </div>
      </div>

      {split && (
        <aside className="relative hidden overflow-hidden bg-[#0c0d10] px-12 py-6 text-white lg:flex lg:items-center lg:justify-center">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(640px circle at 100% 0%, rgba(255,255,255,0.07), rgba(255,255,255,0) 60%)",
            }}
          />
          <div className="relative w-full max-w-xl">
            <AuthShowcase />
          </div>
        </aside>
      )}
    </div>
  );
};

export default AuthLayout;
