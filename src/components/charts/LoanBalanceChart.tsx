/**
 * Loan Balance Chart Component
 * Line chart showing outstanding balance over time
 */

import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { LoanInputs } from '@/lib/types';
import { generateAmortizationSchedule } from '@/lib/calculations/amortization';
import { generateFloatingRateSchedule, generatePeriodicRateChanges } from '@/lib/calculations/floatingRate';
import { generateHybridRateSchedule } from '@/lib/calculations/hybridRate';
import { formatIndianCurrency } from '@/lib/utils';

interface LoanBalanceChartProps {
    loanAmount: number;
    interestRate: number;
    tenureYears: number;
    loanInputs?: LoanInputs;
}

function LoanBalanceChartComponent({ loanAmount, interestRate, tenureYears, loanInputs }: LoanBalanceChartProps) {
    // Route to appropriate calculation based on loan type
    let schedule;
    if (loanInputs?.loanType === 'floating' && loanInputs.rateIncreasePercent && loanInputs.rateChangeFrequencyMonths) {
        const totalMonths = tenureYears * 12;
        const rateChanges = generatePeriodicRateChanges(
            interestRate,
            loanInputs.rateIncreasePercent,
            loanInputs.rateChangeFrequencyMonths,
            totalMonths
        );
        schedule = generateFloatingRateSchedule(
            loanAmount,
            interestRate,
            tenureYears,
            rateChanges
        );
    } else if (loanInputs?.loanType === 'hybrid' && loanInputs.fixedPeriodMonths && loanInputs.floatingRate) {
        const totalMonths = tenureYears * 12;
        const floatingRateChanges = loanInputs.rateIncreasePercent && loanInputs.rateChangeFrequencyMonths
            ? generatePeriodicRateChanges(
                loanInputs.floatingRate,
                loanInputs.rateIncreasePercent,
                loanInputs.rateChangeFrequencyMonths,
                totalMonths
            ).filter(change => change.fromMonth > loanInputs.fixedPeriodMonths!)
            : [];
        schedule = generateHybridRateSchedule(
            loanAmount,
            interestRate,
            loanInputs.floatingRate,
            loanInputs.fixedPeriodMonths,
            tenureYears,
            floatingRateChanges
        );
    } else {
        schedule = generateAmortizationSchedule(loanAmount, interestRate, tenureYears);
    }

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