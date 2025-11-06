/**
 * Tax Benefits Calculator Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { TaxBenefitsCalculator } from '@/components/calculators/TaxBenefitsCalculator';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const Route = createFileRoute('/tax-benefits')({
    component: TaxBenefitsPage,
});

function TaxBenefitsPage() {
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Tax Benefits Calculator</h1>
                <p className="text-gray-600 mt-2">Maximize savings with Section 80C, 24b, and 80EEA tax deduction analysis</p>
            </div>
            <div className="bg-white rounded-lg shadow">
                <ErrorBoundary>
                    <TaxBenefitsCalculator />
                </ErrorBoundary>
            </div>
        </div>
    );
}
