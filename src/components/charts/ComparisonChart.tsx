/**
 * Comparison Chart Component
 * Bar chart comparing multiple loan scenarios
 */

import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatIndianCurrency } from '@/lib/utils';

interface Scenario {
    name: string;
    emi: number;
    totalInterest: number;
    totalAmount: number;
}

interface ComparisonChartProps {
    scenarios: Scenario[];
}

function ComparisonChartComponent({ scenarios }: ComparisonChartProps) {
    const data = scenarios.map(scenario => ({
        name: scenario.name,
        'Monthly EMI': Math.round(scenario.emi),
        'Total Interest': Math.round(scenario.totalInterest),
    }));

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6" role="region" aria-labelledby="comparison-chart-heading">
            <h3 id="comparison-chart-heading" className="text-lg font-semibold text-gray-900 mb-4">Scenario Comparison: EMI vs Total Interest</h3>
            <p className="sr-only">Bar chart comparing {scenarios.length} loan scenarios by monthly EMI and total interest</p>
            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                        formatter={(value: number) => formatIndianCurrency(value)}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Monthly EMI" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Total Interest" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export const ComparisonChart = memo(ComparisonChartComponent);
