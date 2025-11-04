/**
 * EMISummary Component
 * Display calculated EMI and loan summary
 */

import { memo, useMemo } from 'react';
import type { LoanInputs } from '@/lib/types';
import { calculateEMI, calculateTotalInterest, calculateTotalAmount } from '@/lib/calculations/emi';
import { formatIndianCurrency, formatToLakhsCrores } from '@/lib/utils';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { exportLoanSummaryToCSV } from '@/lib/utils/export';
import { HiArrowDownTray } from 'react-icons/hi2';

interface EMISummaryProps {
    loanInputs: LoanInputs;
    showDetailedBreakdown?: boolean;
}

function EMISummaryComponent({ loanInputs, showDetailedBreakdown = true }: EMISummaryProps) {
    // Validate inputs
    if (!loanInputs || loanInputs.loanAmount <= 0) {
        return <ErrorMessage message="Invalid loan amount. Please check your inputs." type="error" />;
    }

    const emi = useMemo(() => {
        try {
            return calculateEMI(loanInputs.loanAmount, loanInputs.interestRate, loanInputs.loanTenure);
        } catch (error) {
            console.error('EMI calculation error:', error);
            return 0;
        }
    }, [loanInputs.loanAmount, loanInputs.interestRate, loanInputs.loanTenure]);

    const totalInterest = useMemo(() => {
        try {
            return calculateTotalInterest(loanInputs.loanAmount, loanInputs.interestRate, loanInputs.loanTenure);
        } catch (error) {
            console.error('Interest calculation error:', error);
            return 0;
        }
    }, [loanInputs.loanAmount, loanInputs.interestRate, loanInputs.loanTenure]);

    const totalAmount = useMemo(() => {
        try {
            return calculateTotalAmount(loanInputs.loanAmount, loanInputs.interestRate, loanInputs.loanTenure);
        } catch (error) {
            console.error('Total amount calculation error:', error);
            return 0;
        }
    }, [loanInputs.loanAmount, loanInputs.interestRate, loanInputs.loanTenure]);

    const interestPercentage = useMemo(
        () => (totalInterest / loanInputs.loanAmount) * 100,
        [totalInterest, loanInputs.loanAmount]
    );

    if (emi === 0 && totalInterest === 0) {
        return <ErrorMessage message="Unable to calculate loan details. Please verify your inputs are valid." type="error" />;
    }

    const handleExportSummary = () => {
        exportLoanSummaryToCSV(
            loanInputs.loanAmount,
            loanInputs.interestRate,
            loanInputs.loanTenure,
            emi,
            totalInterest,
            totalAmount,
            loanInputs.propertyValue,
            loanInputs.downPayment
        );
    };

    return (
        <div className="space-y-6">
            {/* Header with Export Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Loan Summary</h2>
                <button
                    type="button"
                    onClick={handleExportSummary}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Export loan summary to CSV"
                >
                    <HiArrowDownTray className="w-4 h-4" />
                    Export Summary
                </button>
            </div>

            {/* Hero EMI Display */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-lg shadow-lg" role="region" aria-labelledby="emi-heading">
                <p id="emi-heading" className="text-sm uppercase tracking-wide opacity-90 mb-2">Monthly EMI</p>
                <p className="text-5xl font-bold mb-4" role="status" aria-live="polite" aria-atomic="true">{formatIndianCurrency(emi)}</p>
                <p className="text-sm opacity-90">
                    for {loanInputs.loanTenure} years at {loanInputs.interestRate}% p.a.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="region" aria-label="Loan summary cards">
                {/* Principal Amount */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200" role="article" aria-labelledby="principal-label">
                    <p id="principal-label" className="text-sm text-gray-600 mb-1">Principal Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatToLakhsCrores(loanInputs.loanAmount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Loan borrowed</p>
                </div>

                {/* Total Interest */}
                <div className="bg-white p-6 rounded-lg shadow border border-orange-200" role="article" aria-labelledby="interest-label">
                    <p id="interest-label" className="text-sm text-gray-600 mb-1">Total Interest</p>
                    <p className="text-2xl font-bold text-orange-600">
                        {formatToLakhsCrores(totalInterest)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {interestPercentage.toFixed(1)}% of principal
                    </p>
                </div>

                {/* Total Amount Payable */}
                <div className="bg-white p-6 rounded-lg shadow border border-purple-200" role="article" aria-labelledby="total-label">
                    <p id="total-label" className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {formatToLakhsCrores(totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Principal + Interest</p>
                </div>
            </div>

            {/* Detailed Breakdown */}
            {showDetailedBreakdown && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200" role="region" aria-labelledby="loan-details-heading">
                    <h3 id="loan-details-heading" className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Property Value</span>
                            <span className="font-medium text-gray-900">
                                {formatIndianCurrency(loanInputs.propertyValue)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Down Payment</span>
                            <span className="font-medium text-gray-900">
                                {formatIndianCurrency(loanInputs.downPayment)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Loan Amount</span>
                            <span className="font-medium text-blue-600">
                                {formatIndianCurrency(loanInputs.loanAmount)}
                            </span>
                        </div>
                        <div className="h-px bg-gray-300 my-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Interest Rate</span>
                            <span className="font-medium text-gray-900">
                                {loanInputs.interestRate}% p.a.
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Loan Tenure</span>
                            <span className="font-medium text-gray-900">
                                {loanInputs.loanTenure} years ({loanInputs.loanTenure * 12} months)
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Loan Type</span>
                            <span className="font-medium text-gray-900 capitalize">
                                {loanInputs.loanType}
                            </span>
                        </div>
                        <div className="h-px bg-gray-300 my-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Monthly EMI</span>
                            <span className="text-lg font-bold text-blue-600">
                                {formatIndianCurrency(emi)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Interest Payable</span>
                            <span className="font-medium text-orange-600">
                                {formatIndianCurrency(totalInterest)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Total Amount Payable</span>
                            <span className="text-lg font-bold text-purple-600">
                                {formatIndianCurrency(totalAmount)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Visual Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200" role="region" aria-labelledby="breakdown-heading">
                <h3 id="breakdown-heading" className="text-lg font-semibold text-gray-900 mb-4">Payment Breakdown</h3>
                <div className="space-y-4">
                    {/* Principal vs Interest Bar */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Principal</span>
                            <span className="font-medium">{((loanInputs.loanAmount / totalAmount) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex h-8 overflow-hidden rounded-md" role="progressbar" aria-label="Principal to interest ratio" aria-valuenow={Math.round((loanInputs.loanAmount / totalAmount) * 100)} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${((loanInputs.loanAmount / totalAmount) * 100).toFixed(1)}% principal, ${((totalInterest / totalAmount) * 100).toFixed(1)}% interest`}>
                            <div
                                className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                                style={{ width: `${(loanInputs.loanAmount / totalAmount) * 100}%` }}
                            >
                                {formatToLakhsCrores(loanInputs.loanAmount)}
                            </div>
                            <div
                                className="bg-orange-500 flex items-center justify-center text-white text-xs font-medium"
                                style={{ width: `${(totalInterest / totalAmount) * 100}%` }}
                            >
                                {formatToLakhsCrores(totalInterest)}
                            </div>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-600">Interest</span>
                            <span className="font-medium">{((totalInterest / totalAmount) * 100).toFixed(1)}%</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded"></div>
                            <span className="text-gray-600">Principal: {formatToLakhsCrores(loanInputs.loanAmount)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500 rounded"></div>
                            <span className="text-gray-600">Interest: {formatToLakhsCrores(totalInterest)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="region" aria-label="Key loan metrics">
                <div className="text-center p-4 bg-gray-50 rounded-lg" role="article" aria-labelledby="ltv-label">
                    <p id="ltv-label" className="text-xs text-gray-600 mb-1">LTV Ratio</p>
                    <p className="text-lg font-bold text-gray-900">
                        {((loanInputs.loanAmount / loanInputs.propertyValue) * 100).toFixed(1)}%
                    </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Down Payment %</p>
                    <p className="text-lg font-bold text-gray-900">
                        {((loanInputs.downPayment / loanInputs.propertyValue) * 100).toFixed(1)}%
                    </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Total Payments</p>
                    <p className="text-lg font-bold text-gray-900">
                        {loanInputs.loanTenure * 12}
                    </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Interest/Principal</p>
                    <p className="text-lg font-bold text-gray-900">
                        {(totalInterest / loanInputs.loanAmount).toFixed(2)}x
                    </p>
                </div>
            </div>
        </div>
    );
}

export const EMISummary = memo(EMISummaryComponent);
