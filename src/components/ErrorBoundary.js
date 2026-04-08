import React from 'react';

const isDev = import.meta.env.DEV;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console (in a real app, you'd send this to an error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="min-h-screen ui-page flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. This has been reported to our team.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full btn-primary py-3 px-4"
              >
                Try Again
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full btn-secondary py-3 px-4"
              >
                Go to Homepage
              </button>
            </div>

            {/* Show error details in development */}
            {isDev && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-left overflow-auto max-h-40">
                  <p className="font-semibold text-red-600 mb-2">Error:</p>
                  <p className="mb-2">{this.state.error && this.state.error.toString()}</p>
                  <p className="font-semibold text-red-600 mb-2">Component Stack:</p>
                  <pre className="whitespace-pre-wrap">
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;