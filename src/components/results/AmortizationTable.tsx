/**
 * AmortizationTable Component
 * Display month-by-month loan repayment schedule
 */

import { useState, useMemo, memo } from 'react';
import type { LoanInputs } from '@/lib/types';
import { generateAmortizationSchedule, generateYearlySummary } from '@/lib/calculations/amortization';
import { generateFloatingRateSchedule, generatePeriodicRateChanges } from '@/lib/calculations/floatingRate';
import { generateHybridRateSchedule } from '@/lib/calculations/hybridRate';
import { formatIndianCurrency } from '@/lib/utils';
import { exportMonthlyScheduleToCSV, exportYearlySummaryToCSV } from '@/lib/utils/export';
import { HiArrowDownTray } from 'react-icons/hi2';

interface AmortizationTableProps {
    loanAmount: number;
    interestRate: number;
    tenureYears: number;
    defaultView?: 'monthly' | 'yearly';
    loanInputs?: LoanInputs;
}

function AmortizationTableComponent({
    loanAmount,
    interestRate,
    tenureYears,
    defaultView = 'yearly',
    loanInputs,
}: AmortizationTableProps) {
    const [view, setView] = useState<'monthly' | 'yearly'>(defaultView);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const monthlySchedule = useMemo(() => {
        try {
            // Route to appropriate calculation based on loan type
            if (loanInputs?.loanType === 'floating' && loanInputs.rateIncreasePercent && loanInputs.rateChangeFrequencyMonths) {
                const totalMonths = tenureYears * 12;
                const rateChanges = generatePeriodicRateChanges(
                    interestRate,
                    loanInputs.rateIncreasePercent,
                    loanInputs.rateChangeFrequencyMonths,
                    totalMonths
                );
                return generateFloatingRateSchedule(
                    loanAmount,
                    interestRate,
                    tenureYears,
                    rateChanges
                );
            } else if (loanInputs?.loanType === 'hybrid' && loanInputs.fixedPeriodMonths && loanInputs.floatingRate) {
                // For hybrid, generate rate changes for floating period if specified
                const totalMonths = tenureYears * 12;
                const floatingRateChanges = loanInputs.rateIncreasePercent && loanInputs.rateChangeFrequencyMonths
                    ? generatePeriodicRateChanges(
                        loanInputs.floatingRate,
                        loanInputs.rateIncreasePercent,
                        loanInputs.rateChangeFrequencyMonths,
                        totalMonths
                    ).filter(change => change.fromMonth > loanInputs.fixedPeriodMonths!)
                    : [];
                return generateHybridRateSchedule(
                    loanAmount,
                    interestRate,
                    loanInputs.floatingRate,
                    loanInputs.fixedPeriodMonths,
                    tenureYears,
                    floatingRateChanges
                );
            } else {
                // Fixed rate or default
                return generateAmortizationSchedule(loanAmount, interestRate, tenureYears);
            }
        } catch (error) {
            console.error('Amortization schedule generation error:', error);
            return { schedule: [], totalInterest: 0, totalPrincipal: 0, totalAmount: 0 };
        }
    }, [loanAmount, interestRate, tenureYears, loanInputs]);

    const yearlySchedule = useMemo(() => {
        try {
            return generateYearlySummary(loanAmount, interestRate, tenureYears);
        } catch (error) {
            console.error('Yearly summary generation error:', error);
            return [];
        }
    }, [loanAmount, interestRate, tenureYears]);

    // Map data to common format with period field
    const monthlyData = useMemo(
        () => monthlySchedule.schedule.map(row => ({
            period: row.month,
            emi: row.emi,
            principal: row.principal,
            interest: row.interest,
            outstanding: row.closingBalance,
        })),
        [monthlySchedule]
    );

    const yearlyData = useMemo(
        () => yearlySchedule.map(row => ({
            period: row.year,
            emi: row.totalEMI,
            principal: row.totalPrincipal,
            interest: row.totalInterest,
            outstanding: row.closingBalance,
        })),
        [yearlySchedule]
    );

    // Return early with error message if data is invalid (after all hooks are called)
    if (!loanAmount || loanAmount <= 0 || !tenureYears || tenureYears <= 0) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">Invalid loan parameters. Please check your inputs.</p>
            </div>
        );
    }

    if (monthlySchedule.schedule.length === 0 && yearlySchedule.length === 0) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">Unable to generate amortization schedule. Please verify your loan parameters.</p>
            </div>
        );
    }

    const scheduleToDisplay = view === 'monthly' ? monthlyData : yearlyData;

    // Pagination
    const totalPages = Math.ceil(scheduleToDisplay.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = scheduleToDisplay.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleViewChange = (newView: 'monthly' | 'yearly') => {
        setView(newView);
        setCurrentPage(1); // Reset to first page when changing view
    };

    const handleExportCSV = () => {
        if (view === 'monthly') {
            exportMonthlyScheduleToCSV(monthlySchedule.schedule, loanAmount, interestRate, tenureYears);
        } else {
            exportYearlySummaryToCSV(yearlySchedule, loanAmount, interestRate, tenureYears);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header with View Toggle and Export */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900" id="amortization-table-heading">Amortization Schedule</h3>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Export Button */}
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={`Export ${view} schedule to CSV`}
                    >
                        <HiArrowDownTray className="w-4 h-4" />
                        Export CSV
                    </button>

                    {/* View Toggle */}
                    <div className="inline-flex rounded-md shadow-sm" role="group" aria-label="View selector for amortization schedule">
                        <button
                            type="button"
                            onClick={() => handleViewChange('yearly')}
                            aria-pressed={view === 'yearly'}
                            aria-label="Show yearly view"
                            className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${view === 'yearly'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            Yearly
                        </button>
                        <button
                            type="button"
                            onClick={() => handleViewChange('monthly')}
                            aria-pressed={view === 'monthly'}
                            aria-label="Show monthly view"
                            className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b ${view === 'monthly'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            Monthly
                        </button>
                    </div>
                </div>
            </div>

            {/* Screen reader description */}
            <p id="amortization-table-description" className="sr-only">
                Amortization schedule showing {view === 'monthly' ? 'month-by-month' : 'year-by-year'} breakdown of loan repayment including EMI, principal, interest, and outstanding balance.
            </p>

            {/* Table */}
            <div className="overflow-x-auto -mx-6 sm:mx-0">
                <div className="bg-white rounded-lg shadow border border-gray-200 inline-block min-w-full">
                    <table className="min-w-full divide-y divide-gray-200" aria-labelledby="amortization-table-heading" aria-describedby="amortization-table-description">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {view === 'monthly' ? 'Month' : 'Year'}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    EMI
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Principal
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Interest
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Outstanding
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.map((row, index: number) => (
                                <tr
                                    key={row.period}
                                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {view === 'monthly' ? `Month ${row.period}` : `Year ${row.period}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                        {formatIndianCurrency(row.emi)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-medium">
                                        {formatIndianCurrency(row.principal)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-orange-600 font-medium">
                                        {formatIndianCurrency(row.interest)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                                        {formatIndianCurrency(row.outstanding)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {/* Footer with Totals */}
                        <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    Total
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                                    {formatIndianCurrency(
                                        scheduleToDisplay.reduce((sum, row) => sum + row.emi, 0)
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">
                                    {formatIndianCurrency(
                                        scheduleToDisplay.reduce((sum, row) => sum + row.principal, 0)
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-orange-600">
                                    {formatIndianCurrency(
                                        scheduleToDisplay.reduce((sum, row) => sum + row.interest, 0)
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                                    -
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg" role="navigation" aria-label="Pagination for amortization schedule">
                    <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left" aria-live="polite" aria-atomic="true">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(endIndex, scheduleToDisplay.length)}</span> of{' '}
                        <span className="font-medium">{scheduleToDisplay.length}</span>{' '}
                        {view === 'monthly' ? 'months' : 'years'}
                    </div>
                    <div className="inline-flex rounded-md shadow-sm">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            aria-label="Go to previous page"
                            aria-disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-3 sm:px-4 py-2 rounded-l-md border border-gray-300 text-xs sm:text-sm font-medium ${currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <span className="sr-only">Previous</span>
                            ←
                        </button>
                        <span className="relative inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700" aria-current="page" aria-label={`Page ${currentPage} of ${totalPages}`}>
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            aria-label="Go to next page"
                            aria-disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center px-3 sm:px-4 py-2 rounded-r-md border border-gray-300 text-xs sm:text-sm font-medium ${currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <span className="sr-only">Next</span>
                            →
                        </button>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">Total Principal</p>
                    <p className="text-lg font-bold text-blue-600">
                        {formatIndianCurrency(loanAmount)}
                    </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-xs text-gray-600 mb-1">Total Interest</p>
                    <p className="text-lg font-bold text-orange-600">
                        {formatIndianCurrency(
                            scheduleToDisplay.reduce((sum, row) => sum + row.interest, 0)
                        )}
                    </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                    <p className="text-lg font-bold text-purple-600">
                        {formatIndianCurrency(
                            scheduleToDisplay.reduce((sum, row) => sum + row.emi, 0)
                        )}
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">
                        {view === 'monthly' ? 'Months' : 'Years'}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                        {scheduleToDisplay.length}
                    </p>
                </div>
            </div>
        </div>
    );
}

export const AmortizationTable = memo(AmortizationTableComponent);
