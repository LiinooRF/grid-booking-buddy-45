import React from "react";

type ErrorBoundaryProps = {
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

type ErrorBoundaryState = { hasError: boolean; error?: any };

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error("UI error captured:", error, info);
    this.setState({ error });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 space-y-2">
          {this.props.fallback ?? (
            <div>Ocurrió un error al mostrar esta sección. Intenta recargar la página.</div>
          )}
          {this.state.error?.message && (
            <details className="text-xs opacity-80">
              <summary>Detalles del error</summary>
              <pre className="mt-2 whitespace-pre-wrap">{String(this.state.error?.message)}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
