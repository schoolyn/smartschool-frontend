import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import "./app/i18n";
import App from "./app/app";
import ErrorFallback from "./shared/ui/error-fallback/error-fallback";
import { trackAppOpen } from "./shared/lib/analytics";
import "./app/styles/index.css";
import { queryClient } from "./shared/api/query-client";

trackAppOpen();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
