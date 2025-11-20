import React from "react";
import CrashPage from "@/pages/CrashPage";

interface State {
  hasError: boolean;
  error?: Error | null;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // log to console; you can integrate Sentry/LogRocket here
    console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <CrashPage error={this.state.error} />;
    }
    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
