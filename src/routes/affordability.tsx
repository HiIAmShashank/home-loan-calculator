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
        <div className="py-8">
            <div className="bg-white rounded-lg shadow">
                <ErrorBoundary>
                    <AffordabilityCalculator />
                </ErrorBoundary>
            </div>
        </div>
    );
}
