import type { ReactNode } from "react";

import { isAppwriteClientConfigured } from "@/lib/appwrite/config";

const panel: React.CSSProperties = {
  boxSizing: "border-box",
  minHeight: "100dvh",
  margin: 0,
  padding: "2rem 1.20rem",
  fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
  background: "#0a0a0a",
  color: "#e5e5e5",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
  textAlign: "center",
};

const code: React.CSSProperties = {
  display: "block",
  maxWidth: "36rem",
  width: "100%",
  marginTop: "0.5rem",
  padding: "0.75rem 1rem",
  borderRadius: "0.5rem",
  background: "#171717",
  border: "1px solid #262626",
  color: "#a3a3a3",
  fontSize: "0.75rem",
  lineHeight: 1.5,
  textAlign: "left",
  overflowX: "auto",
};

/**
 * Shown when `VITE_APPWRITE_URL` / `VITE_APPWRITE_PROJECT_ID` are missing or invalid
 * at build time (typical on Vercel if env vars were not added for Production).
 */
export function AppwriteEnvGate({ children }: { children: ReactNode }) {
  if (isAppwriteClientConfigured) {
    return children;
  }

  return (
    <div style={panel}>
      <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
        Appwrite environment not configured
      </h1>
      <p style={{ margin: 0, maxWidth: "28rem", fontSize: "0.875rem", color: "#a3a3a3" }}>
        This app needs Vite env variables at <strong>build time</strong>. In the Vercel
        dashboard, open your project → Settings → Environment Variables, add the
        variables below for <strong>Production</strong> (and Preview if you use it),
        then redeploy. In Appwrite there is no menu named “CORS”: add a{" "}
        <strong>Web app</strong> platform and set the <strong>Hostname</strong> (see
        second note below).
      </p>
      <div style={code}>
        <div>VITE_APPWRITE_URL=https://&lt;region&gt;.cloud.appwrite.io</div>
        <div style={{ marginTop: "0.35rem" }}>
          VITE_APPWRITE_PROJECT_ID=…
        </div>
        <div style={{ marginTop: "0.35rem" }}>
          VITE_APPWRITE_DATABASE_ID=…
        </div>
        <div style={{ marginTop: "0.35rem" }}>VITE_APPWRITE_BUCKET_ID=…</div>
        <div style={{ marginTop: "0.35rem" }}>
          VITE_APPWRITE_POST_COLLECTION_ID=…
        </div>
        <div style={{ marginTop: "0.35rem" }}>
          VITE_APPWRITE_USER_COLLECTION_ID=…
        </div>
        <div style={{ marginTop: "0.35rem" }}>
          VITE_APPWRITE_SAVES_COLLECTION_ID=…
        </div>
      </div>
      <p style={{ margin: 0, maxWidth: "28rem", fontSize: "0.8125rem", color: "#737373" }}>
        Use your live Appwrite API URL (not localhost). The app appends <code>/v1</code>{" "}
        if you paste the host only.
      </p>
      <p style={{ margin: 0, maxWidth: "32rem", fontSize: "0.8125rem", color: "#737373" }}>
        <strong>Appwrite (allowed origin):</strong> Open{" "}
        <a
          href="https://cloud.appwrite.io/console"
          style={{ color: "#c4b5fd" }}
          target="_blank"
          rel="noreferrer">
          cloud.appwrite.io
        </a>
        , select your project → on <strong>Overview</strong> find{" "}
        <strong>Add a platform</strong> → choose <strong>Web app</strong> → in{" "}
        <strong>Hostname</strong> enter only the site host (no <code>https://</code>
        ): e.g. <code>your-app.vercel.app</code> or <code>*.vercel.app</code> for all
        previews. That hostname is what enables CORS. Docs:{" "}
        <a
          href="https://appwrite.io/docs/quick-starts/web"
          style={{ color: "#c4b5fd" }}
          target="_blank"
          rel="noreferrer">
          Web quick start
        </a>
        ,{" "}
        <a
          href="https://appwrite.io/blog/post/cors-error"
          style={{ color: "#c4b5fd" }}
          target="_blank"
          rel="noreferrer">
          CORS guide
        </a>
        .
      </p>
      <p style={{ margin: 0, maxWidth: "32rem", fontSize: "0.8125rem", color: "#737373" }}>
        Tip: open{" "}
        <a href="/deployment-debug" style={{ color: "#c4b5fd" }}>
          /deployment-debug
        </a>{" "}
        on this same site for a diagnostic panel (works even when env is incomplete).
      </p>
    </div>
  );
}
