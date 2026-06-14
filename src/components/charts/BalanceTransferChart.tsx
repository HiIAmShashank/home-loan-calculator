/**
 * Balance Transfer Chart Component
 * Line chart showing cumulative cost of staying vs switching over time.
 * The "switch" line starts at the one-time costs and rises more slowly (lower
 * EMI), so the point where it dips below the "stay" line is the break-even.
 */

import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { BalanceTransferAnalysis } from '@/lib/types';
import { formatIndianCurrency } from '@/lib/utils';

interface BalanceTransferChartProps {
    analysis: BalanceTransferAnalysis;
}

function BalanceTransferChartComponent({ analysis }: BalanceTransferChartProps) {
    const { currentLoan, newLoan, costs } = analysis;
    const maxMonths = Math.max(currentLoan.tenure, newLoan.tenure);
    const years = Math.ceil(maxMonths / 12);

    // Cumulative outflow sampled once per year. "Stay" pays the current EMI; "switch"
    // pays the upfront costs immediately, then the new EMI.
    const data = Array.from({ length: years + 1 }, (_, year) => {
        const month = year * 12;
        const stay = Math.min(month, currentLoan.tenure) * currentLoan.emi;
        const switchCost = costs.total + Math.min(month, newLoan.tenure) * newLoan.emi;
        return {
            year: `Y${year}`,
            stay: Math.round(stay),
            switch: Math.round(switchCost),
        };
    });

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6" role="region" aria-labelledby="balance-transfer-chart-heading">
            <h3 id="balance-transfer-chart-heading" className="text-lg font-semibold text-gray-900 mb-4">
                Cumulative Cost: Stay vs Switch
            </h3>
            <p className="sr-only">
                Line chart comparing the cumulative amount paid if you stay on the current loan
                versus switching, where the switch line starts at the one-time costs of {formatIndianCurrency(costs.total)}.
                The crossover point is the break-even.
            </p>
            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                    <Tooltip
                        formatter={(value) => formatIndianCurrency(Number(value))}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                        labelFormatter={(label) => `Year ${String(label).substring(1)}`}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="stay"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ fill: '#ef4444', r: 3 }}
                        activeDot={{ r: 6 }}
                        name="Stay (current loan)"
                    />
                    <Line
                        type="monotone"
                        dataKey="switch"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{ fill: '#22c55e', r: 3 }}
                        activeDot={{ r: 6 }}
                        name="Switch (new loan + costs)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export const BalanceTransferChart = memo(BalanceTransferChartComponent);
