'use client';

import React, { ErrorInfo, useState } from 'react';
import logger from '@/lib/logger';

/**
 * Props for the ErrorBoundary component
 */
interface ErrorBoundaryProps {
  // Child components to render
  children: React.ReactNode;
  // Optional custom fallback UI
  fallback?: React.ReactNode;
  // Optional error ID for tracking
  errorId?: string;
  // Whether this is a critical component that needs special handling
  isCritical?: boolean;
}

/**
 * State for the ErrorBoundary component
 */
interface ErrorBoundaryState {
  // Whether an error has been caught
  hasError: boolean;
  // The error that was caught
  error: Error | null;
}

/**
 * Default fallback UI for ErrorBoundary
 */
function DefaultFallback() {
  return (
    <div className="p-4 border border-red-200 rounded bg-red-50 text-red-800">
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p>
        We encountered an error while rendering this component. 
        Please try refreshing the page or contact support if the issue persists.
      </p>
      <button
        className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </button>
    </div>
  );
}

/**
 * Critical fallback UI for ErrorBoundary
 */
function CriticalFallback() {
  return (
    <div className="p-6 border-2 border-red-300 rounded bg-red-50 text-red-900">
      <h2 className="text-xl font-bold mb-3">Critical Error</h2>
      <p className="mb-3">
        We encountered a critical error that prevents this feature from working correctly.
        Our team has been notified of this issue.
      </p>
      <div className="flex gap-3">
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
        <a
          href="/"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          Go to Homepage
        </a>
      </div>
    </div>
  );
}

/**
 * Error boundary component for handling React component errors
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Update state when errors are caught
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log errors when they occur
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { errorId, isCritical } = this.props;
    
    // Log the error
    logger.error(
      `UI Error${errorId ? ` (${errorId})` : ''}${isCritical ? ' [CRITICAL]' : ''}`,
      'ErrorBoundary',
      error,
      { componentStack: errorInfo.componentStack }
    );
  }

  /**
   * Reset the error state
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  /**
   * Render the component
   */
  render() {
    const { children, fallback, isCritical } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      // Show the provided fallback, or the appropriate default fallback
      return fallback || (isCritical ? <CriticalFallback /> : <DefaultFallback />);
    }

    return children;
  }
}

export default ErrorBoundary; 