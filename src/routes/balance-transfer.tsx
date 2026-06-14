/**
 * Balance Transfer Calculator Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { BalanceTransferCalculator } from '@/components/calculators/BalanceTransferCalculator';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const Route = createFileRoute('/balance-transfer')({
    component: BalanceTransferPage,
});

function BalanceTransferPage() {
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Balance Transfer Calculator</h1>
                <p className="text-gray-600 mt-2">See whether refinancing your home loan to a lower rate is worth the switching costs</p>
            </div>
            <div className="bg-white rounded-lg shadow">
                <ErrorBoundary>
                    <BalanceTransferCalculator />
                </ErrorBoundary>
            </div>
        </div>
    );
}
