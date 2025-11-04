/**
 * Loan Balance Chart Component
 * Line chart showing outstanding balance over time
 */

import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateAmortizationSchedule } from '@/lib/calculations/amortization';
import { formatIndianCurrency } from '@/lib/utils';

interface LoanBalanceChartProps {
    loanAmount: number;
    interestRate: number;
    tenureYears: number;
}

function LoanBalanceChartComponent({ loanAmount, interestRate, tenureYears }: LoanBalanceChartProps) {
    const schedule = generateAmortizationSchedule(loanAmount, interestRate, tenureYears);

    // Sample every 12 months for readability
    const yearlyData = schedule.schedule
        .filter((_, index) => index % 12 === 0 || index === schedule.schedule.length - 1)
        .map(row => ({
            year: `Y${Math.ceil(row.month / 12)}`,
            balance: Math.round(row.closingBalance),
        }));

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6" role="region" aria-labelledby="loan-balance-chart-heading">
            <h3 id="loan-balance-chart-heading" className="text-lg font-semibold text-gray-900 mb-4">Outstanding Loan Balance Over Time</h3>
            <p className="sr-only">Line chart showing loan balance decreasing from {formatIndianCurrency(loanAmount)} to zero over {tenureYears} years</p>
            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                    <Tooltip
                        formatter={(value: number) => formatIndianCurrency(value)}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                        labelFormatter={(label) => `Year ${label.substring(1)}`}
                    />
                    <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Outstanding Balance"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export const LoanBalanceChart = memo(LoanBalanceChartComponent);