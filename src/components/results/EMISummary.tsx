/**
 * EMISummary Component
 * Display calculated EMI and loan summary
 */

import { memo, useMemo } from 'react';
import type { LoanInputs } from '@/lib/types';
import { calculateEMI, calculateTotalInterest, calculateTotalAmount } from '@/lib/calculations/emi';
import {
    generateFloatingRateSchedule,
    generatePeriodicRateChanges,
    calculateAverageRate as calculateFloatingAverageRate
} from '@/lib/calculations/floatingRate';
import {
    generateHybridRateSchedule,
    calculateHybridAverageRate
} from '@/lib/calculations/hybridRate';
import { formatIndianCurrency, formatToLakhsCrores } from '@/lib/utils';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { exportLoanSummaryToCSV } from '@/lib/utils/export';
import { HiArrowDownTray } from 'react-icons/hi2';

interface EMISummaryProps {
    loanInputs: LoanInputs;
    showDetailedBreakdown?: boolean;
}

function EMISummaryComponent({ loanInputs, showDetailedBreakdown = true }: EMISummaryProps) {
    // All hooks must be called before any conditional returns
    // Calculate based on loan type
    const calculations = useMemo(() => {
        if (!loanInputs || loanInputs.loanAmount <= 0) {
            return { emi: 0, totalInterest: 0, totalAmount: 0, averageRate: loanInputs?.interestRate || 0, schedule: [], rateChanges: [] };
        }

        try {
            if (loanInputs.loanType === 'floating' && loanInputs.rateIncreasePercent && loanInputs.rateChangeFrequencyMonths) {
                // Floating rate loan - generate rate changes first
                const totalMonths = loanInputs.loanTenure * 12;
                const rateChanges = generatePeriodicRateChanges(
                    loanInputs.interestRate,
                    loanInputs.rateIncreasePercent,
                    loanInputs.rateChangeFrequencyMonths,
                    totalMonths
                );
                const result = generateFloatingRateSchedule(
                    loanInputs.loanAmount,
                    loanInputs.interestRate,
                    loanInputs.loanTenure,
                    rateChanges
                );
                const averageRate = calculateFloatingAverageRate(result.schedule, rateChanges, loanInputs.interestRate);
                // For floating loans, EMI varies. Use the initial EMI for display
                const initialEMI = result.schedule[0]?.emi || 0;
                return {
                    emi: initialEMI,
                    totalInterest: result.totalInterest,
                    totalAmount: result.totalAmount,
                    averageRate,
                    schedule: result.schedule,
                    rateChanges
                };
            } else if (loanInputs.loanType === 'hybrid' && loanInputs.fixedPeriodMonths && loanInputs.floatingRate) {
                // Hybrid rate loan - generate rate changes for floating period if specified
                const totalMonths = loanInputs.loanTenure * 12;
                const floatingRateChanges = loanInputs.rateIncreasePercent && loanInputs.rateChangeFrequencyMonths
                    ? generatePeriodicRateChanges(
                        loanInputs.floatingRate,
                        loanInputs.rateIncreasePercent,
                        loanInputs.rateChangeFrequencyMonths,
                        totalMonths
                    ).filter(change => change.fromMonth > loanInputs.fixedPeriodMonths!)
                    : [];
                const result = generateHybridRateSchedule(
                    loanInputs.loanAmount,
                    loanInputs.interestRate, // Fixed rate
                    loanInputs.floatingRate,
                    loanInputs.fixedPeriodMonths,
                    loanInputs.loanTenure,
                    floatingRateChanges
                );
                const averageRate = calculateHybridAverageRate(
                    result.schedule,
                    loanInputs.interestRate,
                    loanInputs.floatingRate,
                    loanInputs.fixedPeriodMonths
                );
                // For hybrid, use fixed EMI initially
                const initialEMI = result.schedule[0]?.emi || 0;
                return {
                    emi: initialEMI,
                    totalInterest: result.totalInterest,
                    totalAmount: result.totalAmount,
                    averageRate,
                    schedule: result.schedule,
                    rateChanges: floatingRateChanges
                };
            } else {
                // Fixed rate loan (default)
                const emi = calculateEMI(loanInputs.loanAmount, loanInputs.interestRate, loanInputs.loanTenure);
                const totalInterest = calculateTotalInterest(loanInputs.loanAmount, loanInputs.interestRate, loanInputs.loanTenure);
                const totalAmount = calculateTotalAmount(loanInputs.loanAmount, loanInputs.interestRate, loanInputs.loanTenure);
                return {
                    emi,
                    totalInterest,
                    totalAmount,
                    averageRate: loanInputs.interestRate,
                    schedule: [],
                    rateChanges: []
                };
            }
        } catch (error) {
            console.error('Loan calculation error:', error);
            return { emi: 0, totalInterest: 0, totalAmount: 0, averageRate: loanInputs.interestRate, schedule: [], rateChanges: [] };
        }
    }, [loanInputs]);

    const { emi, totalInterest, totalAmount, averageRate, schedule, rateChanges } = calculations;

    // Calculate rate statistics for variable-rate loans
    const rateStats = useMemo(() => {
        if (loanInputs.loanType === 'floating' && schedule.length > 0) {
            const emis = schedule.map(row => row.emi);
            const minEMI = Math.min(...emis);
            const maxEMI = Math.max(...emis);

            // Calculate rate range from base rate and rate changes
            const rates = [loanInputs.interestRate, ...rateChanges.map(rc => rc.newRate)];
            const minRate = Math.min(...rates);
            const maxRate = Math.max(...rates);

            return {
                minRate,
                maxRate,
                minEMI,
                maxEMI,
                rateChangesCount: rateChanges.length
            };
        } else if (loanInputs.loanType === 'hybrid' && schedule.length > 0) {
            const emis = schedule.map(row => row.emi);
            const minEMI = Math.min(...emis);
            const maxEMI = Math.max(...emis);

            // Calculate rate range from fixed, floating, and rate changes
            const rates = [
                loanInputs.interestRate,
                loanInputs.floatingRate || loanInputs.interestRate,
                ...rateChanges.map(rc => rc.newRate)
            ];
            const minRate = Math.min(...rates);
            const maxRate = Math.max(...rates);

            return {
                minRate,
                maxRate,
                minEMI,
                maxEMI,
                rateChangesCount: rateChanges.length + 1 // +1 for hybrid transition
            };
        }
        return null;
    }, [loanInputs, schedule, rateChanges]);

    const interestPercentage = useMemo(() => {
        if (!loanInputs || loanInputs.loanAmount <= 0 || totalInterest === 0) return 0;
        return (totalInterest / loanInputs.loanAmount) * 100;
    }, [totalInterest, loanInputs]);

    // Now validate inputs after all hooks have been called
    if (!loanInputs || loanInputs.loanAmount <= 0) {
        return <ErrorMessage message="Invalid loan amount. Please check your inputs." type="error" />;
    }

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
                <p id="emi-heading" className="text-sm uppercase tracking-wide opacity-90 mb-2">
                    {loanInputs.loanType === 'floating' ? 'Initial Monthly EMI' : loanInputs.loanType === 'hybrid' ? 'Fixed Period EMI' : 'Monthly EMI'}
                </p>
                <p className="text-5xl font-bold mb-4" role="status" aria-live="polite" aria-atomic="true">{formatIndianCurrency(emi)}</p>
                <p className="text-sm opacity-90">
                    {loanInputs.loanType === 'fixed'
                        ? `for ${loanInputs.loanTenure} years at ${loanInputs.interestRate}% p.a.`
                        : `Average rate: ${averageRate.toFixed(2)}% p.a. over ${loanInputs.loanTenure} years`
                    }
                </p>
                {loanInputs.loanType !== 'fixed' && (
                    <p className="text-xs opacity-75 mt-2">
                        {loanInputs.loanType === 'floating'
                            ? '⚠️ EMI will adjust with rate changes (tenure constant)'
                            : '⚠️ EMI will change after fixed period ends'
                        }
                    </p>
                )}
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
                                {loanInputs.loanType === 'fixed'
                                    ? `${loanInputs.interestRate}% p.a.`
                                    : loanInputs.loanType === 'hybrid'
                                        ? `${loanInputs.interestRate}% (fixed) → ${loanInputs.floatingRate}% (floating)`
                                        : `${loanInputs.interestRate}% (initial)`
                                }
                            </span>
                        </div>
                        {loanInputs.loanType !== 'fixed' && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Average Rate</span>
                                <span className="font-medium text-blue-600">
                                    {averageRate.toFixed(2)}% p.a.
                                </span>
                            </div>
                        )}
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

            {/* Rate Change Schedule (for floating/hybrid loans) */}
            {loanInputs.loanType !== 'fixed' && rateStats && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200" role="region" aria-labelledby="rate-schedule-heading">
                    <h3 id="rate-schedule-heading" className="text-lg font-semibold text-gray-900 mb-4">Rate Change Schedule</h3>

                    {/* Rate Range Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-600 mb-1">Min Rate</p>
                            <p className="text-xl font-bold text-green-600">{rateStats.minRate.toFixed(2)}%</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-600 mb-1">Max Rate</p>
                            <p className="text-xl font-bold text-red-600">{rateStats.maxRate.toFixed(2)}%</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-600 mb-1">Min EMI</p>
                            <p className="text-xl font-bold text-green-600">{formatToLakhsCrores(rateStats.minEMI)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-600 mb-1">Max EMI</p>
                            <p className="text-xl font-bold text-red-600">{formatToLakhsCrores(rateStats.maxEMI)}</p>
                        </div>
                    </div>

                    {/* Hybrid: Fixed vs Floating Periods */}
                    {loanInputs.loanType === 'hybrid' && loanInputs.fixedPeriodMonths && (
                        <div className="mb-6 bg-white p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-3">Loan Periods</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border-l-4 border-purple-500 pl-4">
                                    <p className="text-sm font-medium text-gray-700">Fixed Rate Period</p>
                                    <p className="text-lg font-bold text-purple-600">
                                        {loanInputs.fixedPeriodMonths} months ({(loanInputs.fixedPeriodMonths / 12).toFixed(1)} years)
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Rate: {loanInputs.interestRate}% | EMI: {formatIndianCurrency(schedule[0]?.emi || emi)}
                                    </p>
                                </div>
                                <div className="border-l-4 border-blue-500 pl-4">
                                    <p className="text-sm font-medium text-gray-700">Floating Rate Period</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        {(loanInputs.loanTenure * 12) - loanInputs.fixedPeriodMonths} months ({((loanInputs.loanTenure * 12 - loanInputs.fixedPeriodMonths) / 12).toFixed(1)} years)
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Initial: {loanInputs.floatingRate}% | EMI: {formatIndianCurrency(schedule[loanInputs.fixedPeriodMonths]?.emi || emi)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rate Changes Table */}
                    {rateChanges.length > 0 && (
                        <div className="bg-white rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">From Month</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Rate</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">New EMI</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Change</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {/* Initial rate row */}
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">Month 1</td>
                                            <td className="px-4 py-3">
                                                {loanInputs.loanType === 'hybrid' ? loanInputs.interestRate : loanInputs.interestRate}%
                                            </td>
                                            <td className="px-4 py-3 font-medium">{formatIndianCurrency(schedule[0]?.emi || emi)}</td>
                                            <td className="px-4 py-3 text-gray-500">—</td>
                                        </tr>

                                        {/* Hybrid transition */}
                                        {loanInputs.loanType === 'hybrid' && loanInputs.fixedPeriodMonths && (
                                            <tr className="bg-purple-50 hover:bg-purple-100">
                                                <td className="px-4 py-3 font-medium">Month {loanInputs.fixedPeriodMonths + 1}</td>
                                                <td className="px-4 py-3 font-semibold text-purple-600">
                                                    {loanInputs.floatingRate}%
                                                </td>
                                                <td className="px-4 py-3 font-semibold">
                                                    {formatIndianCurrency(schedule[loanInputs.fixedPeriodMonths]?.emi || emi)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-purple-600 font-medium">🔀 Fixed → Floating</span>
                                                </td>
                                            </tr>
                                        )}

                                        {/* Rate changes */}
                                        {rateChanges.map((change, index) => {
                                            // For first change, compare with initial EMI (Month 1)
                                            // For subsequent changes, compare with the previous rate change's EMI
                                            let prevMonth = 0; // Month 1 (index 0)
                                            if (index > 0) {
                                                prevMonth = rateChanges[index - 1].fromMonth;
                                            } else if (loanInputs.loanType === 'hybrid' && loanInputs.fixedPeriodMonths) {
                                                // For hybrid, first floating change compares with end of fixed period
                                                prevMonth = loanInputs.fixedPeriodMonths - 1;
                                            }

                                            const prevEMI = schedule[prevMonth]?.emi;
                                            const newEMI = schedule[change.fromMonth]?.emi;
                                            const emiDiff = newEMI && prevEMI ? newEMI - prevEMI : 0;

                                            return (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium">Month {change.fromMonth + 1}</td>
                                                    <td className="px-4 py-3 font-semibold text-blue-600">{change.newRate.toFixed(2)}%</td>
                                                    <td className="px-4 py-3 font-medium">{formatIndianCurrency(newEMI || 0)}</td>
                                                    <td className="px-4 py-3">
                                                        {emiDiff > 0 ? (
                                                            <span className="text-red-600">↑ {formatIndianCurrency(emiDiff)}</span>
                                                        ) : emiDiff < 0 ? (
                                                            <span className="text-green-600">↓ {formatIndianCurrency(Math.abs(emiDiff))}</span>
                                                        ) : (
                                                            <span className="text-gray-500">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 text-xs text-gray-600 border-t border-gray-200">
                                Total rate changes: {rateStats.rateChangesCount} | EMI range: {formatIndianCurrency(rateStats.minEMI)} - {formatIndianCurrency(rateStats.maxEMI)}
                            </div>
                        </div>
                    )}

                    {/* No rate changes message */}
                    {rateChanges.length === 0 && loanInputs.loanType === 'floating' && (
                        <div className="bg-white p-4 rounded-lg text-center text-gray-600">
                            <p>No rate changes configured. EMI will remain constant at {formatIndianCurrency(emi)}.</p>
                        </div>
                    )}
                </div>
            )}

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
