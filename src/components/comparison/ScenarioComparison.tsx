/**
 * ScenarioComparison Component
 * 
 * Displays optimistic, realistic, and pessimistic scenarios for floating rate loans
 * Helps users understand best-case, expected, and worst-case outcomes
 */

import { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { LoanInputs } from '@/lib/types';
import { generateScenarioComparison } from '@/lib/calculations/floatingRate';
import { formatIndianCurrency, formatToLakhsCrores } from '@/lib/utils';

interface ScenarioComparisonProps {
    loanInputs: LoanInputs;
}

function ScenarioComparisonComponent({ loanInputs }: ScenarioComparisonProps) {
    // Generate scenario comparison
    const scenarios = useMemo(() => {
        if (
            !loanInputs ||
            loanInputs.loanType !== 'floating' ||
            !loanInputs.rateIncreasePercent ||
            !loanInputs.rateChangeFrequencyMonths
        ) {
            return null;
        }

        return generateScenarioComparison(
            loanInputs.loanAmount,
            loanInputs.interestRate,
            loanInputs.loanTenure,
            loanInputs.rateChangeFrequencyMonths,
            loanInputs.rateIncreasePercent
        );
    }, [loanInputs]);

    // Prepare chart data - sample yearly for readability
    const chartData = useMemo(() => {
        if (!scenarios) return [];

        const data: Array<{
            year: string;
            optimistic: number;
            realistic: number;
            pessimistic: number;
        }> = [];

        const totalMonths = loanInputs.loanTenure * 12;

        // Sample every 12 months
        for (let month = 0; month < totalMonths; month += 12) {
            const yearNum = Math.floor(month / 12) + 1;
            data.push({
                year: `Y${yearNum}`,
                optimistic: Math.round(scenarios.optimistic.schedule.schedule[month]?.emi || 0),
                realistic: Math.round(scenarios.realistic.schedule.schedule[month]?.emi || 0),
                pessimistic: Math.round(scenarios.pessimistic.schedule.schedule[month]?.emi || 0),
            });
        }

        return data;
    }, [scenarios, loanInputs.loanTenure]);

    // Calculate EMI ranges for each scenario
    const emiRanges = useMemo(() => {
        if (!scenarios) return null;

        const getEMIRange = (schedule: typeof scenarios.optimistic.schedule.schedule) => {
            const emis = schedule.map(row => row.emi);
            return {
                min: Math.min(...emis),
                max: Math.max(...emis),
            };
        };

        return {
            optimistic: getEMIRange(scenarios.optimistic.schedule.schedule),
            realistic: getEMIRange(scenarios.realistic.schedule.schedule),
            pessimistic: getEMIRange(scenarios.pessimistic.schedule.schedule),
        };
    }, [scenarios]);

    if (!scenarios || !emiRanges || (loanInputs.loanType !== 'floating' && loanInputs.loanType !== 'hybrid')) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Scenario Analysis</h3>
                <p className="text-sm text-gray-600">
                    Compare best-case, expected, and worst-case outcomes for your {loanInputs.loanType === 'hybrid' ? 'hybrid' : 'floating rate'} loan
                </p>
            </div>

            {/* Scenario Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Optimistic Scenario */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🟢</span>
                        <h4 className="text-lg font-semibold text-green-800">Optimistic</h4>
                    </div>
                    <p className="text-xs text-green-700 mb-4">Rates decrease over time</p>

                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-green-700 mb-1">Total Interest</p>
                            <p className="text-xl font-bold text-green-900">
                                {formatToLakhsCrores(scenarios.optimistic.totalInterest)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-green-700 mb-1">Average Rate</p>
                            <p className="text-lg font-semibold text-green-900">
                                {scenarios.optimistic.averageRate.toFixed(2)}%
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-green-700 mb-1">EMI Range</p>
                            <p className="text-sm font-medium text-green-900">
                                {formatToLakhsCrores(emiRanges.optimistic.min)} - {formatToLakhsCrores(emiRanges.optimistic.max)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Realistic Scenario */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-300">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🔵</span>
                        <h4 className="text-lg font-semibold text-blue-800">Realistic</h4>
                    </div>
                    <p className="text-xs text-blue-700 mb-4">Expected rate increases</p>

                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-blue-700 mb-1">Total Interest</p>
                            <p className="text-xl font-bold text-blue-900">
                                {formatToLakhsCrores(scenarios.realistic.totalInterest)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-blue-700 mb-1">Average Rate</p>
                            <p className="text-lg font-semibold text-blue-900">
                                {scenarios.realistic.averageRate.toFixed(2)}%
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-blue-700 mb-1">EMI Range</p>
                            <p className="text-sm font-medium text-blue-900">
                                {formatToLakhsCrores(emiRanges.realistic.min)} - {formatToLakhsCrores(emiRanges.realistic.max)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pessimistic Scenario */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🔴</span>
                        <h4 className="text-lg font-semibold text-red-800">Pessimistic</h4>
                    </div>
                    <p className="text-xs text-red-700 mb-4">Rates increase aggressively</p>

                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-red-700 mb-1">Total Interest</p>
                            <p className="text-xl font-bold text-red-900">
                                {formatToLakhsCrores(scenarios.pessimistic.totalInterest)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-red-700 mb-1">Average Rate</p>
                            <p className="text-lg font-semibold text-red-900">
                                {scenarios.pessimistic.averageRate.toFixed(2)}%
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-red-700 mb-1">EMI Range</p>
                            <p className="text-sm font-medium text-red-900">
                                {formatToLakhsCrores(emiRanges.pessimistic.min)} - {formatToLakhsCrores(emiRanges.pessimistic.max)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison Summary */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Scenario Comparison</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Interest Cost Range</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {formatIndianCurrency(scenarios.optimistic.totalInterest)} - {formatIndianCurrency(scenarios.pessimistic.totalInterest)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Difference: {formatIndianCurrency(scenarios.pessimistic.totalInterest - scenarios.optimistic.totalInterest)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Average Rate Range</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {scenarios.optimistic.averageRate.toFixed(2)}% - {scenarios.pessimistic.averageRate.toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Spread: {(scenarios.pessimistic.averageRate - scenarios.optimistic.averageRate).toFixed(2)}%
                        </p>
                    </div>
                </div>
            </div>

            {/* EMI Progression Chart */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">EMI Progression Across Scenarios</h4>
                <p className="text-sm text-gray-600 mb-4">
                    See how your monthly EMI changes over time in each scenario
                </p>
                <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="year"
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            formatter={(value: number) => formatIndianCurrency(value)}
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px'
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line
                            type="monotone"
                            dataKey="optimistic"
                            name="Optimistic"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="realistic"
                            name="Realistic"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="pessimistic"
                            name="Pessimistic"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Interpretation Guide */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-900 mb-2">💡 How to Use This Analysis</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                    {loanInputs.loanType === 'hybrid' && loanInputs.fixedPeriodMonths && (
                        <li><strong>Fixed Period:</strong> First {loanInputs.fixedPeriodMonths} months at {loanInputs.interestRate}% (same across all scenarios)</li>
                    )}
                    <li><strong>Optimistic:</strong> {loanInputs.loanType === 'hybrid' ? 'After fixed period, rates' : 'Rates'} decrease by {loanInputs.rateIncreasePercent}% every {loanInputs.rateChangeFrequencyMonths} months</li>
                    <li><strong>Realistic:</strong> Your configured scenario ({loanInputs.loanType === 'hybrid' ? 'floating rates' : 'rates'} increase by {loanInputs.rateIncreasePercent}% every {loanInputs.rateChangeFrequencyMonths} months)</li>
                    <li><strong>Pessimistic:</strong> {loanInputs.loanType === 'hybrid' ? 'Floating rates' : 'Rates'} increase by {(loanInputs.rateIncreasePercent || 0) * 2}% every {loanInputs.rateChangeFrequencyMonths} months</li>
                </ul>
                <p className="text-xs text-blue-700 mt-3">
                    Use this to understand your risk exposure. Budget for the realistic scenario but prepare for the pessimistic case.
                </p>
            </div>
        </div>
    );
}

export const ScenarioComparison = memo(ScenarioComparisonComponent);
