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
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">EMI Calculator</h1>
                <p className="text-gray-600 mt-2">Calculate monthly EMI with detailed breakdown for fixed, floating, and hybrid rate loans</p>
            </div>
            <EMICalculator />
        </div>
    );
}
