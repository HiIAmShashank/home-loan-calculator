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
            <div className="bg-white rounded-lg shadow">
                <ErrorBoundary>
                    <TaxBenefitsCalculator />
                </ErrorBoundary>
            </div>
        </div>
    );
}
