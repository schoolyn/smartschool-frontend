import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "@/entities/session";
import { ThemeProvider } from "@/features/theme";
import { TooltipProvider } from "../shared/ui/kit/tooltip";
import AppToaster from "../shared/ui/app-toaster";
import router from "./router";
import LogoSpinner from "../shared/ui/logo-spinner";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider delayDuration={150} disableHoverableContent>
          <Suspense fallback={<LogoSpinner />}>
            <RouterProvider router={router} />
          </Suspense>
        </TooltipProvider>
        <AppToaster />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
