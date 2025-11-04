/**
 * Error Message Component
 * Displays validation errors and warnings
 */

import { HiExclamationCircle, HiExclamationTriangle } from 'react-icons/hi2';

interface ErrorMessageProps {
    message: string;
    type?: 'error' | 'warning';
    className?: string;
}

export function ErrorMessage({ message, type = 'error', className = '' }: ErrorMessageProps) {
    const isError = type === 'error';

    return (
        <div
            className={`flex items-start gap-2 p-3 rounded-md ${isError
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-yellow-50 border border-yellow-200'
                } ${className}`}
            role="alert"
            aria-live="polite"
        >
            {isError ? (
                <HiExclamationCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            ) : (
                <HiExclamationTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${isError ? 'text-red-700' : 'text-yellow-700'}`}>
                {message}
            </p>
        </div>
    );
}
