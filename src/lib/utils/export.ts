/**
 * Export Utilities
 * Functions for exporting data to various formats
 */

import type { AmortizationRow } from '@/lib/types';

/**
 * Yearly summary type for export
 */
export interface YearlySummary {
    year: number;
    openingBalance: number;
    closingBalance: number;
    totalEMI: number;
    totalInterest: number;
    totalPrincipal: number;
    cumulativeInterest?: number;
    cumulativePrincipal?: number;
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: Record<string, string | number>[], headers: string[]): string {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row =>
        headers.map(header => {
            const value = row[header];
            // Handle values that might contain commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? '';
        }).join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Download CSV file
 */
function downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

/**
 * Export monthly amortization schedule to CSV
 */
export function exportMonthlyScheduleToCSV(
    schedule: AmortizationRow[],
    loanAmount: number,
    interestRate: number,
    tenureYears: number
): void {
    const headers = [
        'Month',
        'Year',
        'Opening Balance (₹)',
        'EMI (₹)',
        'Principal (₹)',
        'Interest (₹)',
        'Closing Balance (₹)',
        'Cumulative Interest (₹)',
        'Cumulative Principal (₹)'
    ];

    const data = schedule.map(row => ({
        'Month': row.month,
        'Year': row.year,
        'Opening Balance (₹)': row.openingBalance,
        'EMI (₹)': row.emi,
        'Principal (₹)': row.principal,
        'Interest (₹)': row.interest,
        'Closing Balance (₹)': row.closingBalance,
        'Cumulative Interest (₹)': row.cumulativeInterest,
        'Cumulative Principal (₹)': row.cumulativePrincipal
    }));

    const csvContent = arrayToCSV(data, headers);
    const filename = `amortization-schedule-monthly-${loanAmount}-${interestRate}%-${tenureYears}yr-${Date.now()}.csv`;

    downloadCSV(csvContent, filename);
}

/**
 * Export yearly amortization summary to CSV
 */
export function exportYearlySummaryToCSV(
    summary: YearlySummary[],
    loanAmount: number,
    interestRate: number,
    tenureYears: number
): void {
    const headers = [
        'Year',
        'Opening Balance (₹)',
        'Total EMI (₹)',
        'Total Principal (₹)',
        'Total Interest (₹)',
        'Closing Balance (₹)'
    ];

    const data = summary.map(row => ({
        'Year': row.year,
        'Opening Balance (₹)': row.openingBalance,
        'Total EMI (₹)': row.totalEMI,
        'Total Principal (₹)': row.totalPrincipal,
        'Total Interest (₹)': row.totalInterest,
        'Closing Balance (₹)': row.closingBalance
    }));

    const csvContent = arrayToCSV(data, headers);
    const filename = `amortization-summary-yearly-${loanAmount}-${interestRate}%-${tenureYears}yr-${Date.now()}.csv`;

    downloadCSV(csvContent, filename);
}

/**
 * Export loan summary to CSV
 */
export function exportLoanSummaryToCSV(
    loanAmount: number,
    interestRate: number,
    tenureYears: number,
    emi: number,
    totalInterest: number,
    totalAmount: number,
    propertyValue?: number,
    downPayment?: number
): void {
    const headers = ['Loan Details', 'Value'];

    const data = [
        { 'Loan Details': 'Property Value (₹)', 'Value': propertyValue ?? 'N/A' },
        { 'Loan Details': 'Down Payment (₹)', 'Value': downPayment ?? 'N/A' },
        { 'Loan Details': 'Loan Amount (₹)', 'Value': loanAmount },
        { 'Loan Details': 'Interest Rate (%)', 'Value': interestRate },
        { 'Loan Details': 'Loan Tenure (Years)', 'Value': tenureYears },
        { 'Loan Details': 'Monthly EMI (₹)', 'Value': emi },
        { 'Loan Details': 'Total Interest (₹)', 'Value': totalInterest },
        { 'Loan Details': 'Total Amount Payable (₹)', 'Value': totalAmount },
        { 'Loan Details': 'Interest as % of Principal', 'Value': `${((totalInterest / loanAmount) * 100).toFixed(2)}%` }
    ];

    const csvContent = arrayToCSV(data, headers);
    const filename = `loan-summary-${loanAmount}-${interestRate}%-${tenureYears}yr-${Date.now()}.csv`;

    downloadCSV(csvContent, filename);
}
