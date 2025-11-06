/**
 * Loan Comparison Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { LoanComparison } from '@/components/comparison/LoanComparison';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const Route = createFileRoute('/comparison')({
    component: ComparisonPage,
});

function ComparisonPage() {
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Loan Comparison</h1>
                <p className="text-gray-600 mt-2">Compare up to 3 loan scenarios side-by-side</p>
            </div>
            <div className="bg-white rounded-lg shadow">
                <ErrorBoundary>
                    <LoanComparison />
                </ErrorBoundary>
            </div>
        </div>
    );
}
