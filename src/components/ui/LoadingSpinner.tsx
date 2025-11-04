/**
 * Loading Spinner Component
 * Shows loading state for async operations
 */

import { HiArrowPath } from 'react-icons/hi2';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className="flex flex-col items-center justify-center p-8" role="status" aria-live="polite">
            <HiArrowPath className={`${sizeClasses[size]} animate-spin text-blue-600`} />
            {message && (
                <p className="mt-3 text-sm text-gray-600">{message}</p>
            )}
            <span className="sr-only">Loading...</span>
        </div>
    );
}
