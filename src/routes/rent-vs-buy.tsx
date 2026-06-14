/**
 * Rent vs Buy Calculator Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { RentVsBuyCalculator } from '@/components/calculators/RentVsBuyCalculator';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const Route = createFileRoute('/rent-vs-buy')({
    component: RentVsBuyPage,
});

function RentVsBuyPage() {
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Rent vs Buy Calculator</h1>
                <p className="text-gray-600 mt-2">Compare buying a home against renting and investing the difference over your time horizon</p>
            </div>
            <div className="bg-white rounded-lg shadow">
                <ErrorBoundary>
                    <RentVsBuyCalculator />
                </ErrorBoundary>
            </div>
        </div>
    );
}
