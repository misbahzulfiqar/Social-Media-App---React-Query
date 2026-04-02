import { useEffect, useState, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { AppwriteException } from "appwrite";

import {
  account,
  appwriteConfig,
  isAppwriteClientConfigured,
} from "@/lib/appwrite/config";

const panel: React.CSSProperties = {
  boxSizing: "border-box",
  minHeight: "100dvh",
  padding: "1.25rem",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: "13px",
  lineHeight: 1.5,
  background: "#111",
  color: "#e4e4e7",
};

const box: React.CSSProperties = {
  marginTop: "1rem",
  padding: "1rem",
  borderRadius: "8px",
  background: "#1c1c1e",
  border: "1px solid #27272a",
  textAlign: "left",
  overflowX: "auto",
};

const ok = "#86efac";
const bad = "#fca5a5";
const muted = "#a1a1aa";

function envLine(name: string, value: string | undefined): ReactElement {
  const set = value != null && String(value).trim() !== "";
  return (
    <div key={name}>
      <span style={{ color: muted }}>{name}:</span>{" "}
      <span style={{ color: set ? ok : bad }}>
        {set ? String(value) : "NOT SET"}
      </span>
    </div>
  );
}

/**
 * Public diagnostics page for Vercel / production. Open `/deployment-debug`.
 * Does not require sign-in and skips the global auth bootstrap.
 */
export default function DeploymentDebug() {
  const [status, setStatus] = useState("Starting checks…");
  const [detail, setDetail] = useState<string | null>(null);
  const [sessionNote, setSessionNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setDetail(null);
        setSessionNote(null);
        setStatus("1. Reading build-time env (VITE_*)…");

        if (!isAppwriteClientConfigured) {
          throw new Error(
            "Client not configured: set VITE_APPWRITE_URL (https URL) and VITE_APPWRITE_PROJECT_ID on Vercel, then redeploy."
          );
        }

        setStatus("2. Calling Appwrite Account API (session check)…");

        try {
          const user = await account.get();
          if (!cancelled) {
            setSessionNote(`Session present — account email: ${user.email}`);
          }
        } catch (err) {
          if (cancelled) return;
          if (err instanceof AppwriteException && err.code === 401) {
            setSessionNote(
              "No active session (401) — normal if you are not logged in. CORS and endpoint are likely OK."
            );
          } else {
            const msg =
              err instanceof AppwriteException
                ? `${err.message} (code ${err.code}, type ${err.type})`
                : err instanceof Error
                  ? err.message
                  : String(err);
            throw new Error(
              `Account request failed (often CORS or wrong hostname in Appwrite Web platform): ${msg}`
            );
          }
        }

        if (!cancelled) {
          setStatus("Checks finished.");
        }
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        setStatus("Failed.");
        setDetail(msg);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "(ssr)";

  return (
    <div style={panel}>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.125rem", fontWeight: 600 }}>
        Deployment debug — Appwrite
      </h1>
      <p style={{ margin: 0, color: muted, maxWidth: "42rem" }}>
        Use this on your deployed site to verify env vars and API reachability. This
        project uses <code style={{ color: "#e4e4e7" }}>VITE_APPWRITE_URL</code>, not{" "}
        <code style={{ color: "#e4e4e7" }}>VITE_APPWRITE_ENDPOINT</code>. Add your
        hostname in Appwrite → Web app platform (e.g.{" "}
        <code style={{ color: "#e4e4e7" }}>yoursite.vercel.app</code>, no https://).
      </p>

      <div style={box}>
        <strong style={{ color: "#fafafa" }}>Runtime origin</strong>
        <div style={{ marginTop: "0.35rem", color: ok }}>{origin}</div>
        <div style={{ marginTop: "0.35rem", color: muted, fontSize: "12px" }}>
          If the account step fails with a CORS or network error, register this host
          (without protocol) under Appwrite → Add platform → Web app → Hostname.
        </div>
      </div>

      <div style={box}>
        <strong style={{ color: "#fafafa" }}>Appwrite client flag</strong>
        <div style={{ marginTop: "0.35rem" }}>
          <span style={{ color: muted }}>isAppwriteClientConfigured:</span>{" "}
          <span style={{ color: isAppwriteClientConfigured ? ok : bad }}>
            {String(isAppwriteClientConfigured)}
          </span>
        </div>
      </div>

      <div style={box}>
        <strong style={{ color: "#fafafa" }}>Resolved config (after normalization)</strong>
        <div style={{ marginTop: "0.5rem", color: muted }}>
          {envLine("endpoint (appwriteConfig.url)", appwriteConfig.url || undefined)}
          {envLine("projectId", appwriteConfig.ProjectId || undefined)}
          {envLine("databaseId", appwriteConfig.databaseId)}
          {envLine("storageId", appwriteConfig.storageId)}
          {envLine("postCollectionId", appwriteConfig.postCollectionId)}
          {envLine("userCollectionId", appwriteConfig.userCollectionId)}
          {envLine("savesCollectionId", appwriteConfig.savesCollectionId)}
        </div>
      </div>

      <div style={box}>
        <strong style={{ color: "#fafafa" }}>Raw import.meta.env (this build)</strong>
        <div style={{ marginTop: "0.5rem" }}>
          {envLine("VITE_APPWRITE_URL", import.meta.env.VITE_APPWRITE_URL)}
          {envLine(
            "VITE_APPWRITE_PROJECT_ID",
            import.meta.env.VITE_APPWRITE_PROJECT_ID
          )}
          {envLine(
            "VITE_APPWRITE_DATABASE_ID",
            import.meta.env.VITE_APPWRITE_DATABASE_ID
          )}
          {envLine("VITE_APPWRITE_BUCKET_ID", import.meta.env.VITE_APPWRITE_BUCKET_ID)}
          {envLine(
            "VITE_APPWRITE_POST_COLLECTION_ID",
            import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID
          )}
          {envLine(
            "VITE_APPWRITE_USER_COLLECTION_ID",
            import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID
          )}
          {envLine(
            "VITE_APPWRITE_SAVES_COLLECTION_ID",
            import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID
          )}
          {envLine(
            "VITE_APPWRITE_POSTS_USE_TABLESDB",
            import.meta.env.VITE_APPWRITE_POSTS_USE_TABLESDB
          )}
          {envLine(
            "VITE_APPWRITE_ENDPOINT (wrong name — unused)",
            import.meta.env.VITE_APPWRITE_ENDPOINT
          )}
        </div>
      </div>

      <div style={box}>
        <strong style={{ color: "#fafafa" }}>Live check</strong>
        <div style={{ marginTop: "0.5rem" }}>
          <span style={{ color: muted }}>Status:</span> {status}
        </div>
        {sessionNote ? (
          <div style={{ marginTop: "0.5rem", color: ok }}>{sessionNote}</div>
        ) : null}
        {detail ? (
          <div
            style={{
              marginTop: "0.75rem",
              padding: "0.75rem",
              borderRadius: "6px",
              background: "#3f1515",
              color: bad,
              whiteSpace: "pre-wrap",
            }}>
            {detail}
          </div>
        ) : null}
      </div>

      <p style={{ marginTop: "1.25rem" }}>
        <Link
          to="/signin"
          style={{ color: "#a78bfa", textDecoration: "underline" }}>
          Go to sign in
        </Link>
        {" · "}
        <Link to="/" style={{ color: "#a78bfa", textDecoration: "underline" }}>
          Home
        </Link>
      </p>
    </div>
  );
}
