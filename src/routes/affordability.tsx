/**
 * Affordability Calculator Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { AffordabilityCalculator } from '@/components/calculators/AffordabilityCalculator';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const Route = createFileRoute('/affordability')({
    component: AffordabilityPage,
});

function AffordabilityPage() {
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Affordability Calculator</h1>
                <p className="text-gray-600 mt-2">Calculate maximum affordable loan based on your income</p>
            </div>
            <div className="bg-white rounded-lg shadow">
                <ErrorBoundary>
                    <AffordabilityCalculator />
                </ErrorBoundary>
            </div>
        </div>
    );
}
