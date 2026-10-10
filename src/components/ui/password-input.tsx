import * as React from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { Input } from "./input";

// text input with a built-in Show/Hide toggle; owns its own visibility state
const PasswordInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const { t } = useTranslation();
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative">
        <Input ref={ref} type={visible ? "text" : "password"} className={cn("pr-16", className)} {...props} />
        <button
          type="button"
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 px-3 text-sm text-gray-600 hover:text-gray-900"
        >
          {visible ? t("labels.hide") : t("labels.show")}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
