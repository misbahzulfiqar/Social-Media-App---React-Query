import { BrowserRouter, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/geist/wght.css";
import "./index.css";
import App from "./App.tsx";
import DeploymentDebug from "./_root/pages/DeploymentDebug";
import { Toaster } from "@/components/ui/sonner";
import { AppwriteEnvGate } from "@/components/AppwriteEnvGate";
import { RootErrorBoundary } from "@/components/RootErrorBoundary";
import { AuthProvider } from "@/context/authContext";
import { QueryProvider } from "@/lib/react-query/QueryProvider";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Missing #root element");
}

// Remove any static placeholder in #root so it cannot stick if JS runs.
rootEl.replaceChildren();

/** Everything except `/deployment-debug` (debug must bypass the env gate + theme). */
function GatedAppShell() {
  return (
    <AppwriteEnvGate>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <App />
        <Toaster richColors position="top-center" />
      </ThemeProvider>
    </AppwriteEnvGate>
  );
}

function RootRoutes() {
  const { pathname } = useLocation();
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  if (normalized === "/deployment-debug") {
    return <DeploymentDebug />;
  }

  return <GatedAppShell />;
}

ReactDOM.createRoot(rootEl).render(
  <RootErrorBoundary>
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <RootRoutes />
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  </RootErrorBoundary>
);

