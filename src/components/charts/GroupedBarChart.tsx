/**
 * Grouped Bar Chart Component
 * Side-by-side comparison of EMI, Interest, and Total Cost
 */

import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatIndianCurrency } from '@/lib/utils';

interface GroupedBarChartProps {
    scenarios: Array<{
        name: string;
        emi: number;
        totalInterest: number;
        totalAmount: number;
    }>;
}

function GroupedBarChartComponent({ scenarios }: GroupedBarChartProps) {
    // Transform data for grouped bars
    const data = [
        {
            metric: 'Monthly EMI',
            ...scenarios.reduce((acc, scenario) => ({
                ...acc,
                [scenario.name]: scenario.emi
            }), {})
        },
        {
            metric: 'Total Interest',
            ...scenarios.reduce((acc, scenario) => ({
                ...acc,
                [scenario.name]: scenario.totalInterest
            }), {})
        },
        {
            metric: 'Total Amount',
            ...scenarios.reduce((acc, scenario) => ({
                ...acc,
                [scenario.name]: scenario.totalAmount
            }), {})
        }
    ];

    const COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6'];

    const formatYAxis = (value: number) => {
        if (value >= 10000000) {
            return `₹${(value / 10000000).toFixed(1)}Cr`;
        } else if (value >= 100000) {
            return `₹${(value / 100000).toFixed(1)}L`;
        } else if (value >= 1000) {
            return `₹${(value / 1000).toFixed(0)}k`;
        }
        return `₹${value}`;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6" role="region" aria-labelledby="metric-comparison-heading">
            <h3 id="metric-comparison-heading" className="text-lg font-semibold text-gray-900 mb-4">Side-by-Side Metric Comparison</h3>
            <p className="sr-only">Grouped bar chart comparing {scenarios.length} loan scenarios by EMI, total interest, and total amount</p>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis tickFormatter={formatYAxis} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip
                        formatter={(value: number) => formatIndianCurrency(value)}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    />
                    <Legend />
                    {scenarios.map((scenario, index) => (
                        <Bar
                            key={scenario.name}
                            dataKey={scenario.name}
                            fill={COLORS[index % COLORS.length]}
                            radius={[8, 8, 0, 0]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4">
                {scenarios.map((scenario, index) => (
                    <div key={scenario.name} className="text-center">
                        <div
                            className="w-4 h-4 rounded mx-auto mb-1"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="text-sm font-medium text-gray-900">{scenario.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export const GroupedBarChart = memo(GroupedBarChartComponent);
