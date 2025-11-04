/**
 * EMI Breakdown Chart Component
 * Pie/Donut chart showing total principal vs total interest
 */

import { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { generateAmortizationSchedule } from '@/lib/calculations/amortization';
import { formatIndianCurrency, formatToLakhsCrores } from '@/lib/utils';

interface EMIBreakdownChartProps {
    loanAmount: number;
    interestRate: number;
    tenureYears: number;
}

const COLORS = ['#3b82f6', '#f97316'];

function EMIBreakdownChartComponent({ loanAmount, interestRate, tenureYears }: EMIBreakdownChartProps) {
    const schedule = generateAmortizationSchedule(loanAmount, interestRate, tenureYears);

    const data = [
        {
            name: 'Principal Amount',
            value: loanAmount,
        },
        {
            name: 'Total Interest',
            value: schedule.totalInterest,
        },
    ];

    const interestPercentage = ((schedule.totalInterest / schedule.totalAmount) * 100).toFixed(1);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6" role="region" aria-labelledby="total-cost-chart-heading">
            <h3 id="total-cost-chart-heading" className="text-lg font-semibold text-gray-900 mb-4">Total Cost Breakdown</h3>
            <p className="sr-only">Pie chart showing total cost breakdown: {((loanAmount / schedule.totalAmount) * 100).toFixed(1)}% principal and {interestPercentage}% interest</p>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatIndianCurrency(value)} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 text-center space-y-2">
                <div className="text-sm text-gray-600">
                    Total Amount Payable: <span className="font-bold text-gray-900">{formatToLakhsCrores(schedule.totalAmount)}</span>
                </div>
                <div className="text-sm text-gray-600">
                    Interest is <span className="font-bold text-orange-600">{interestPercentage}%</span> of total payment
                </div>
            </div>
        </div>
    );
}

export const EMIBreakdownChart = memo(EMIBreakdownChartComponent);