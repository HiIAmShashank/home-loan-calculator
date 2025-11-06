/**
 * PMAY Subsidy Calculator Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { PMAYCalculator } from '@/components/calculators/PMAYCalculator';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const Route = createFileRoute('/pmay')({
    component: PMAYPage,
});

function PMAYPage() {
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow">
                <ErrorBoundary>
                    <PMAYCalculator />
                </ErrorBoundary>
            </div>
        </div>
    );
}
