/**
 * EMI Calculator Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { EMICalculator } from '@/components/calculators/EMICalculator';

export const Route = createFileRoute('/emi')({
    component: EMICalculatorPage,
});

function EMICalculatorPage() {
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <EMICalculator />
        </div>
    );
}
