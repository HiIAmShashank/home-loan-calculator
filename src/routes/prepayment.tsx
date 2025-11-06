/**
 * Prepayment Calculator Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { PrepaymentCalculator } from '@/components/calculators/PrepaymentCalculator';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const Route = createFileRoute('/prepayment')({
    component: PrepaymentPage,
});

function PrepaymentPage() {
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow">
                <ErrorBoundary>
                    <PrepaymentCalculator />
                </ErrorBoundary>
            </div>
        </div>
    );
}
