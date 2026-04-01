import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-neutral-950 p-6 text-center text-neutral-200"
          style={{ fontFamily: "system-ui, sans-serif" }}>
          <h1 className="text-lg font-semibold text-white">
            This page couldn&apos;t load
          </h1>
          <p className="max-w-md text-sm text-neutral-400">
            Open the browser console (F12) for details. On Vercel, confirm
            <code className="mx-1 rounded bg-neutral-800 px-1.5 py-0.5 text-xs">
              npm run build
            </code>
            output is <code className="mx-1 rounded bg-neutral-800 px-1.5 py-0.5 text-xs">dist</code>{" "}
            and all <code className="mx-1 rounded bg-neutral-800 px-1.5 py-0.5 text-xs">VITE_*</code>{" "}
            env vars are set.
          </p>
          <pre className="max-h-40 max-w-full overflow-auto rounded-lg bg-black/50 p-3 text-left text-xs text-red-300">
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
