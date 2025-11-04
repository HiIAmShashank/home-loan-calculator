/**
 * Floating Rate Projection Chart Component
 * EMI over time with optimistic, realistic, and pessimistic rate scenarios
 */

import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatIndianCurrency } from '@/lib/utils';
import { calculateEMI } from '@/lib/calculations/emi';

interface FloatingRateProjectionChartProps {
    loanAmount: number;
    currentRate: number;
    tenureYears: number;
}

function FloatingRateProjectionChartComponent({
    loanAmount,
    currentRate,
    tenureYears
}: FloatingRateProjectionChartProps) {
    // Generate projections for the loan tenure
    const years = Array.from({ length: tenureYears + 1 }, (_, i) => i);

    // Rate scenarios: optimistic (-0.5% per 5 years), realistic (+0.25% per 5 years), pessimistic (+0.75% per 5 years)
    const data = years.map(year => {
        const optimisticRate = Math.max(currentRate - (year / 5) * 0.5, 6.5); // Floor at 6.5%
        const realisticRate = currentRate + (year / 5) * 0.25;
        const pessimisticRate = Math.min(currentRate + (year / 5) * 0.75, 15); // Cap at 15%

        // Calculate remaining loan amount at this year
        const remainingMonths = (tenureYears - year) * 12;        // For simplification, use approximate outstanding balance
        // In reality, this would need to track the actual amortization
        const remainingPrincipal = remainingMonths > 0
            ? loanAmount * (remainingMonths / (tenureYears * 12))
            : 0;

        return {
            year: `Y${year}`,
            Optimistic: remainingMonths > 0 ? calculateEMI(remainingPrincipal, optimisticRate, remainingMonths / 12) : 0,
            Realistic: remainingMonths > 0 ? calculateEMI(remainingPrincipal, realisticRate, remainingMonths / 12) : 0,
            Pessimistic: remainingMonths > 0 ? calculateEMI(remainingPrincipal, pessimisticRate, remainingMonths / 12) : 0,
        };
    });

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6" role="region" aria-labelledby="floating-rate-heading">
            <h3 id="floating-rate-heading" className="text-lg font-semibold text-gray-900 mb-4">Floating Rate EMI Projections</h3>
            <p className="sr-only">Line chart showing three interest rate scenarios for a {tenureYears}-year loan: optimistic, realistic at {currentRate}%, and pessimistic projections</p>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip
                        formatter={(value: number) => formatIndianCurrency(value)}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="Optimistic"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="Realistic"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="Pessimistic"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: '#ef4444', r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xs font-medium text-green-800 mb-1">Optimistic</div>
                    <div className="text-sm text-green-600">Rates decrease by 0.5% every 5 years</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs font-medium text-blue-800 mb-1">Realistic</div>
                    <div className="text-sm text-blue-600">Rates increase by 0.25% every 5 years</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-xs font-medium text-red-800 mb-1">Pessimistic</div>
                    <div className="text-sm text-red-600">Rates increase by 0.75% every 5 years</div>
                </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
                <p><strong>Note:</strong> This chart shows how your EMI might change over time with a floating rate loan.
                    Actual rate changes depend on RBI repo rate adjustments and bank policies.</p>
            </div>
        </div>
    );
}

export const FloatingRateProjectionChart = memo(FloatingRateProjectionChartComponent);
