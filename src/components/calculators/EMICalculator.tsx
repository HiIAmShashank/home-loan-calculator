/**
 * EMI Calculator Component
 * Main calculator with form, results, charts, and amortization table
 */

import { useState } from 'react';
import type { LoanInputs } from '@/lib/types';
import { LoanDetailsForm } from '@/components/forms/LoanDetailsForm';
import { EMISummary } from '@/components/results/EMISummary';
import { AmortizationTable } from '@/components/results/AmortizationTable';
import { ScenarioComparison } from '@/components/comparison/ScenarioComparison';
import { AmortizationChart } from '@/components/charts/AmortizationChart';
import { EMIBreakdownChart } from '@/components/charts/EMIBreakdownChart';
import { LoanBalanceChart } from '@/components/charts/LoanBalanceChart';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function EMICalculator() {
    const [loanInputs, setLoanInputs] = useState<LoanInputs | null>(null);

    const handleCalculate = (inputs: LoanInputs) => {
        setLoanInputs(inputs);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Sidebar - Form */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:sticky lg:top-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Loan Details
                    </h2>
                    <LoanDetailsForm onCalculate={handleCalculate} />
                </div>
            </div>

            {/* Right Content - Results */}
            <div className="lg:col-span-2 space-y-8">
                {loanInputs ? (
                    <>
                        {/* EMI Summary */}
                        <ErrorBoundary>
                            <div className="bg-white rounded-lg shadow p-6">
                                <EMISummary loanInputs={loanInputs} />
                            </div>
                        </ErrorBoundary>

                        {/* Charts Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            <ErrorBoundary>
                                <EMIBreakdownChart
                                    loanAmount={loanInputs.loanAmount}
                                    interestRate={loanInputs.interestRate}
                                    tenureYears={loanInputs.loanTenure}
                                    loanInputs={loanInputs}
                                />
                            </ErrorBoundary>
                            <ErrorBoundary>
                                <LoanBalanceChart
                                    loanAmount={loanInputs.loanAmount}
                                    interestRate={loanInputs.interestRate}
                                    tenureYears={loanInputs.loanTenure}
                                    loanInputs={loanInputs}
                                />
                            </ErrorBoundary>
                        </div>

                        {/* Amortization Chart */}
                        <ErrorBoundary>
                            <AmortizationChart
                                loanAmount={loanInputs.loanAmount}
                                interestRate={loanInputs.interestRate}
                                tenureYears={loanInputs.loanTenure}
                                loanInputs={loanInputs}
                            />
                        </ErrorBoundary>

                        {/* Scenario Comparison - For floating and hybrid rate loans */}
                        {(loanInputs.loanType === 'floating' || loanInputs.loanType === 'hybrid') &&
                            loanInputs.rateIncreasePercent &&
                            loanInputs.rateChangeFrequencyMonths && (
                                <ErrorBoundary>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <ScenarioComparison loanInputs={loanInputs} />
                                    </div>
                                </ErrorBoundary>
                            )}

                        {/* Amortization Table */}
                        <ErrorBoundary>
                            <div className="bg-white rounded-lg shadow p-6">
                                <AmortizationTable
                                    loanAmount={loanInputs.loanAmount}
                                    interestRate={loanInputs.interestRate}
                                    tenureYears={loanInputs.loanTenure}
                                    loanInputs={loanInputs}
                                />
                            </div>
                        </ErrorBoundary>
                    </>
                ) : (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                Ready to calculate your home loan?
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Fill in the loan details on the left to see your EMI breakdown,
                                amortization schedule, and detailed analysis.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
