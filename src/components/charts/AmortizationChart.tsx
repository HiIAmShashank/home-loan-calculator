/**
 * Amortization Chart Component
 * Visualizes principal vs interest payments over loan tenure
 */

import { memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateAmortizationSchedule } from '@/lib/calculations/amortization';
import { formatIndianCurrency } from '@/lib/utils';

interface AmortizationChartProps {
    loanAmount: number;
    interestRate: number;
    tenureYears: number;
}

function AmortizationChartComponent({ loanAmount, interestRate, tenureYears }: AmortizationChartProps) {
    const schedule = generateAmortizationSchedule(loanAmount, interestRate, tenureYears);

    // Sample every 12 months for readability (yearly data points)
    const yearlyData = schedule.schedule
        .filter((_, index) => index % 12 === 0 || index === schedule.schedule.length - 1)
        .map(row => ({
            year: `Y${Math.ceil(row.month / 12)}`,
            Principal: Math.round(row.principal),
            Interest: Math.round(row.interest),
        }));

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6" role="region" aria-labelledby="amort-chart-heading">
            <h3 id="amort-chart-heading" className="text-lg font-semibold text-gray-900 mb-4">Principal vs Interest Payment Over Time</h3>
            <p className="sr-only">Area chart showing principal versus interest payments over {tenureYears} years for a loan of {formatIndianCurrency(loanAmount)}</p>
            <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                        formatter={(value: number) => formatIndianCurrency(value)}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="Principal" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="Interest" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.8} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export const AmortizationChart = memo(AmortizationChartComponent);