import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/auth-context";
import { ThemeProvider } from "./context/theme-context";
import router from "./routes";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster
          toastOptions={{
            duration: 4000,
            style: {
              background: "#ffffff",
              color: "#111827",
              minWidth: "320px",
              maxWidth: "90vw",
              width: "max-content",
              padding: "12px 16px",
              fontSize: "14px",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              border: "1px solid #e5e7eb",
            },
            success: {
              iconTheme: { primary: "#16a34a", secondary: "#ffffff" },
              style: { borderLeft: "4px solid #16a34a" },
            },
            error: {
              iconTheme: { primary: "#dc2626", secondary: "#ffffff" },
              style: { borderLeft: "4px solid #dc2626" },
            },
          }}
        />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
