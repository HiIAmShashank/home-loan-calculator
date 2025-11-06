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
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">PMAY Subsidy Calculator</h1>
                <p className="text-gray-600 mt-2">Check eligibility and calculate Pradhan Mantri Awas Yojana subsidy savings</p>
            </div>
            <div className="bg-white rounded-lg shadow">
                <ErrorBoundary>
                    <PMAYCalculator />
                </ErrorBoundary>
            </div>
        </div>
    );
}
