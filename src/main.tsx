import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/geist/wght.css";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "@/components/ui/sonner";
import { RootErrorBoundary } from "@/components/RootErrorBoundary";
import { AuthProvider } from "@/context/authContext";
import { QueryProvider } from "@/lib/react-query/QueryProvider";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Missing #root element");
}

rootEl.replaceChildren();

ReactDOM.createRoot(rootEl).render(
  <RootErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <BrowserRouter>
        <QueryProvider>
          <AuthProvider>
            <App />
            <Toaster richColors position="top-center" />
          </AuthProvider>
        </QueryProvider>
      </BrowserRouter>
    </ThemeProvider>
  </RootErrorBoundary>
);
