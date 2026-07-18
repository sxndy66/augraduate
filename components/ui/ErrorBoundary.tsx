"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error details
    const errorDetails = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
    };

    // Console log for development
    console.error("[ErrorBoundary] Caught error:", errorDetails);

    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you could send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to error tracking service
      // fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorDetails) });
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-error-red/20 bg-error-red/5 px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-error-red/10 text-error-red">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Something went wrong
          </h3>
          <p className="mt-1.5 max-w-sm text-sm text-gray-400">
            An unexpected error occurred while rendering this component. You can
            try again or refresh the page.
          </p>
          {this.state.error && process.env.NODE_ENV === "development" && (
            <details className="mt-4 max-w-lg w-full">
              <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-300">
                Error details
              </summary>
              <pre className="mt-2 overflow-auto rounded-lg bg-navy-900/60 p-3 text-left text-xs text-gray-400">
                {this.state.error.message}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}
          {this.state.errorId && (
            <p className="mt-3 text-xs text-gray-600">
              Error ID: {this.state.errorId}
            </p>
          )}
          <Button
            onClick={this.handleRetry}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            className="mt-6"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
