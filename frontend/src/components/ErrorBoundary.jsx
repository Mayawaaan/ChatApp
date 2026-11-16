import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-background text-foreground flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-xl border border-border bg-surface p-8 text-center space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-destructive">
              Error
            </p>
            <div className="space-y-1.5">
              <h1 className="text-xl font-heading font-semibold text-foreground">
                Something went wrong
              </h1>
              <p className="text-sm text-muted-foreground">
                An unexpected error interrupted this view. Reloading usually
                resolves it right away.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-semibold transition-colors cursor-pointer"
              >
                Reload page
              </button>
              <a
                href="/"
                className="px-4 py-2 rounded-lg border border-border bg-surface-elevated hover:bg-muted text-xs font-medium text-foreground transition-colors"
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
