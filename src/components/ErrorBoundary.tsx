/**
 * Error Boundary Component
 * Catches and handles React component errors gracefully
 */

import { Component } from 'react';
import type { ReactNode } from 'react';
import { HiExclamationCircle, HiArrowPath } from 'react-icons/hi2';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                            <HiExclamationCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-red-900 mb-2">
                                    Something went wrong
                                </h3>
                                <p className="text-sm text-red-700 mb-4">
                                    We encountered an error while displaying this content. Please try refreshing the page.
                                </p>
                                {this.state.error && (
                                    <details className="mb-4">
                                        <summary className="text-sm font-medium text-red-800 cursor-pointer hover:text-red-900">
                                            Error details
                                        </summary>
                                        <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-x-auto">
                                            {this.state.error.message}
                                        </pre>
                                    </details>
                                )}
                                <button
                                    onClick={this.handleReset}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    <HiArrowPath className="w-4 h-4" />
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
