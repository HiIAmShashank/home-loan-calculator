/**
 * Amortization Chart Component
 * Visualizes principal vs interest payments over loan tenure
 */

import { memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { LoanInputs } from '@/lib/types';
import { generateAmortizationSchedule } from '@/lib/calculations/amortization';
import { generateFloatingRateSchedule, generatePeriodicRateChanges } from '@/lib/calculations/floatingRate';
import { generateHybridRateSchedule } from '@/lib/calculations/hybridRate';
import { formatIndianCurrency } from '@/lib/utils';

interface AmortizationChartProps {
    loanAmount: number;
    interestRate: number;
    tenureYears: number;
    loanInputs?: LoanInputs;
}

function AmortizationChartComponent({ loanAmount, interestRate, tenureYears, loanInputs }: AmortizationChartProps) {
    // Route to appropriate calculation based on loan type
    let schedule;
    let rateChangeMonths: number[] = [];
    let hybridTransitionMonth: number | null = null;

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
        // Track months where rate changes occur
        rateChangeMonths = rateChanges.map(rc => rc.fromMonth);
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
        // Track hybrid transition point and floating rate changes
        hybridTransitionMonth = loanInputs.fixedPeriodMonths;
        rateChangeMonths = floatingRateChanges.map(rc => rc.fromMonth);
    } else {
        schedule = generateAmortizationSchedule(loanAmount, interestRate, tenureYears);
    }

    // Sample every 12 months for readability (yearly data points)
    const yearlyData = schedule.schedule
        .filter((_, index) => index % 12 === 0 || index === schedule.schedule.length - 1)
        .map(row => ({
            year: `Y${Math.ceil(row.month / 12)}`,
            month: row.month,
            Principal: Math.round(row.principal),
            Interest: Math.round(row.interest),
        }));

    // Convert rate change months to year labels for markers
    const rateChangeYearLabels = rateChangeMonths
        .map(month => `Y${Math.ceil(month / 12)}`)
        .filter((year, index, self) => self.indexOf(year) === index); // Unique years only

    const hybridTransitionYearLabel = hybridTransitionMonth ? `Y${Math.ceil(hybridTransitionMonth / 12)}` : null;

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

                    {/* Rate change markers for floating loans */}
                    {rateChangeYearLabels.map(year => (
                        <ReferenceLine
                            key={`floating-${year}`}
                            x={year}
                            stroke="#3b82f6"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                            label={{ value: '📊', position: 'top', fill: '#3b82f6' }}
                        />
                    ))}

                    {/* Hybrid transition marker */}
                    {hybridTransitionYearLabel && (
                        <ReferenceLine
                            x={hybridTransitionYearLabel}
                            stroke="#9333ea"
                            strokeWidth={2}
                            label={{ value: '🔀 Fixed → Floating', position: 'top', fill: '#9333ea', fontSize: 12 }}
                        />
                    )}

                    <Area type="monotone" dataKey="Principal" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="Interest" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.8} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export const AmortizationChart = memo(AmortizationChartComponent);