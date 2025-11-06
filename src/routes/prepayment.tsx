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
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Prepayment Calculator</h1>
                <p className="text-gray-600 mt-2">See how lump-sum or recurring prepayments reduce your interest burden</p>
            </div>
            <div className="bg-white rounded-lg shadow">
                <ErrorBoundary>
                    <PrepaymentCalculator />
                </ErrorBoundary>
            </div>
        </div>
    );
}
