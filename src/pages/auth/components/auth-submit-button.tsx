import * as React from "react";

import { cn } from "@/lib/utils";

interface AuthSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dimmed?: boolean;
}

// full-width primary action shared by the auth pages; `dimmed` looks disabled but stays clickable so validation messages can show
const AuthSubmitButton = ({ dimmed, className, type = "submit", ...props }: AuthSubmitButtonProps) => (
  <button
    type={type}
    className={cn(
      "flex w-full items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50",
      dimmed && "cursor-not-allowed opacity-50",
      className,
    )}
    {...props}
  />
);

export default AuthSubmitButton;
