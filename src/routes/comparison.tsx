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
        <div className="py-8">
            <div className="bg-white rounded-lg shadow">
                <ErrorBoundary>
                    <LoanComparison />
                </ErrorBoundary>
            </div>
        </div>
    );
}
