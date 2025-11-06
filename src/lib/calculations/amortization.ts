/**
 * Amortization Schedule Calculation Module
 * 
 * Generates month-by-month breakdown of loan repayment
 * showing interest vs principal components
 */

import { calculateEMI } from './emi';
import type { AmortizationRow, AmortizationSchedule } from '../types';

/**
 * Generate complete amortization schedule
 * 
 * Creates month-by-month breakdown showing:
 * - Opening balance
 * - EMI paid
 * - Interest component
 * - Principal component
 * - Closing balance
 * - Cumulative totals
 * 
 * @param principal - Loan amount in rupees
 * @param annualRate - Annual interest rate in percentage
 * @param tenureYears - Loan tenure in years
 * @param extraPayment - Optional extra payment per month (for prepayment scenarios)
 * @returns Complete amortization schedule with all rows
 * 
 * @example
 * const schedule = generateAmortizationSchedule(6400000, 9, 20);
 * // Returns 240 rows (20 years × 12 months)
 * // schedule[0] = { month: 1, openingBalance: 6400000, interest: 48000, principal: 9562, ... }
 */
export function generateAmortizationSchedule(
    principal: number,
    annualRate: number,
    tenureYears: number,
    extraPayment: number = 0
): AmortizationSchedule {
    // Validate inputs
    if (!isFinite(principal) || !isFinite(annualRate) || !isFinite(tenureYears) || !isFinite(extraPayment)) {
        throw new Error('Invalid input: All parameters must be finite numbers');
    }

    if (principal <= 0 || tenureYears <= 0) {
        return {
            schedule: [],
            totalInterest: 0,
            totalPrincipal: 0,
            totalAmount: 0
        };
    }

    if (annualRate < 0 || extraPayment < 0) {
        throw new Error('Invalid input: Interest rate and extra payment cannot be negative');
    }

    const emi = calculateEMI(principal, annualRate, tenureYears);
    const monthlyRate = annualRate / 12 / 100;
    const schedule: AmortizationRow[] = [];

    let balance = principal;
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;

    const maxMonths = tenureYears * 12;

    for (let month = 1; month <= maxMonths; month++) {
        // Break if loan is fully paid (can happen with extra payments)
        if (balance <= 0) break;

        const openingBalance = balance;
        const interest = balance * monthlyRate;
        let principalPaid = emi - interest;

        // Add extra payment to principal
        principalPaid += extraPayment;

        // Don't overpay - adjust if principal paid exceeds balance
        if (principalPaid > balance) {
            principalPaid = balance;
        }

        const actualEMI = interest + principalPaid;
        const closingBalance = balance - principalPaid;

        cumulativeInterest += interest;
        cumulativePrincipal += principalPaid;

        const year = Math.ceil(month / 12);

        schedule.push({
            month,
            year,
            openingBalance: Math.round(openingBalance),
            emi: Math.round(actualEMI),
            interest: Math.round(interest),
            principal: Math.round(principalPaid),
            closingBalance: Math.round(closingBalance),
            cumulativeInterest: Math.round(cumulativeInterest),
            cumulativePrincipal: Math.round(cumulativePrincipal),
        });

        balance = closingBalance;
    }

    return {
        schedule,
        totalInterest: Math.round(cumulativeInterest * 100) / 100,
        totalPrincipal: Math.round(cumulativePrincipal * 100) / 100,
        totalAmount: Math.round((cumulativeInterest + cumulativePrincipal) * 100) / 100,
    };
}

/**
 * Generate yearly summary of amortization schedule
 * 
 * Aggregates monthly data into yearly summary for easier visualization
 * 
 * @param principal - Loan amount in rupees
 * @param annualRate - Annual interest rate in percentage
 * @param tenureYears - Loan tenure in years
 * @returns Yearly summary with totals per year
 */
export function generateYearlySummary(
    principal: number,
    annualRate: number,
    tenureYears: number
): Array<{
    year: number;
    openingBalance: number;
    closingBalance: number;
    totalEMI: number;
    totalInterest: number;
    totalPrincipal: number;
}> {
    const { schedule } = generateAmortizationSchedule(principal, annualRate, tenureYears);
    const yearlySummary: Map<number, {
        openingBalance: number;
        closingBalance: number;
        totalEMI: number;
        totalInterest: number;
        totalPrincipal: number;
    }> = new Map();

    schedule.forEach(row => {
        const existing = yearlySummary.get(row.year);

        if (!existing) {
            yearlySummary.set(row.year, {
                openingBalance: row.openingBalance,
                closingBalance: row.closingBalance,
                totalEMI: row.emi,
                totalInterest: row.interest,
                totalPrincipal: row.principal,
            });
        } else {
            existing.closingBalance = row.closingBalance;
            existing.totalEMI += row.emi;
            existing.totalInterest += row.interest;
            existing.totalPrincipal += row.principal;
        }
    });

    return Array.from(yearlySummary.entries())
        .map(([year, data]) => ({
            year,
            ...data,
            totalEMI: Math.round(data.totalEMI * 100) / 100,
            totalInterest: Math.round(data.totalInterest * 100) / 100,
            totalPrincipal: Math.round(data.totalPrincipal * 100) / 100,
        }))
        .sort((a, b) => a.year - b.year);
}

/**
 * Get amortization details for a specific month
 * 
 * @param principal - Loan amount in rupees
 * @param annualRate - Annual interest rate in percentage
 * @param tenureYears - Loan tenure in years
 * @param monthNumber - Month to get details for (1-based)
 * @returns Amortization row for that month, or null if invalid
 */
export function getMonthDetails(
    principal: number,
    annualRate: number,
    tenureYears: number,
    monthNumber: number
): AmortizationRow | null {
    if (monthNumber < 1 || monthNumber > tenureYears * 12) {
        return null;
    }

    const { schedule } = generateAmortizationSchedule(principal, annualRate, tenureYears);
    return schedule[monthNumber - 1] || null;
}

/**
 * Calculate principal vs interest breakdown for a specific year
 * 
 * Useful for charts showing how the ratio changes over time
 * 
 * @param principal - Loan amount in rupees
 * @param annualRate - Annual interest rate in percentage
 * @param tenureYears - Loan tenure in years
 * @param year - Year to analyze (1-based)
 * @returns Object with principal and interest totals for that year
 */
export function getYearBreakdown(
    principal: number,
    annualRate: number,
    tenureYears: number,
    year: number
): { year: number; principal: number; interest: number; emi: number } | null {
    if (year < 1 || year > tenureYears) {
        return null;
    }

    const { schedule } = generateAmortizationSchedule(principal, annualRate, tenureYears);

    const yearRows = schedule.filter(row => row.year === year);

    if (yearRows.length === 0) return null;

    const totalPrincipal = yearRows.reduce((sum, row) => sum + row.principal, 0);
    const totalInterest = yearRows.reduce((sum, row) => sum + row.interest, 0);
    const totalEMI = yearRows.reduce((sum, row) => sum + row.emi, 0);

    return {
        year,
        principal: Math.round(totalPrincipal * 100) / 100,
        interest: Math.round(totalInterest * 100) / 100,
        emi: Math.round(totalEMI * 100) / 100,
    };
}

/**
 * Calculate when principal component exceeds interest component
 * 
 * @param principal - Loan amount in rupees
 * @param annualRate - Annual interest rate in percentage
 * @param tenureYears - Loan tenure in years
 * @returns Month number when principal > interest, or null if never
 */
export function findCrossoverMonth(
    principal: number,
    annualRate: number,
    tenureYears: number
): number | null {
    const { schedule } = generateAmortizationSchedule(principal, annualRate, tenureYears);

    const crossoverRow = schedule.find(row => row.principal > row.interest);

    return crossoverRow ? crossoverRow.month : null;
}

/**
 * Generate amortization schedule with lump sum prepayments
 * 
 * @param principal - Loan amount in rupees
 * @param annualRate - Annual interest rate in percentage
 * @param tenureYears - Loan tenure in years
 * @param lumpSumPayments - Array of {month, amount} for one-time prepayments
 * @returns Amortization schedule with prepayments applied
 */
export function generateScheduleWithLumpSum(
    principal: number,
    annualRate: number,
    tenureYears: number,
    lumpSumPayments: Array<{ month: number; amount: number }>
): AmortizationSchedule {
    const emi = calculateEMI(principal, annualRate, tenureYears);
    const monthlyRate = annualRate / 12 / 100;
    const schedule: AmortizationRow[] = [];

    let balance = principal;
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;

    const maxMonths = tenureYears * 12;
    const lumpSumMap = new Map(lumpSumPayments.map(p => [p.month, p.amount]));

    for (let month = 1; month <= maxMonths; month++) {
        if (balance <= 0) break;

        const openingBalance = balance;
        const interest = balance * monthlyRate;
        let principalPaid = emi - interest;

        // Add lump sum payment if exists for this month
        const lumpSum = lumpSumMap.get(month) || 0;
        principalPaid += lumpSum;

        // Don't overpay
        if (principalPaid > balance) {
            principalPaid = balance;
        }

        const actualEMI = interest + principalPaid;
        const closingBalance = balance - principalPaid;

        cumulativeInterest += interest;
        cumulativePrincipal += principalPaid;

        const year = Math.ceil(month / 12);

        schedule.push({
            month,
            year,
            openingBalance: Math.round(openingBalance),
            emi: Math.round(actualEMI),
            interest: Math.round(interest),
            principal: Math.round(principalPaid),
            closingBalance: Math.round(closingBalance),
            cumulativeInterest: Math.round(cumulativeInterest),
            cumulativePrincipal: Math.round(cumulativePrincipal),
        });

        balance = closingBalance;
    }

    return {
        schedule,
        totalInterest: Math.round(cumulativeInterest * 100) / 100,
        totalPrincipal: Math.round(cumulativePrincipal * 100) / 100,
        totalAmount: Math.round((cumulativeInterest + cumulativePrincipal) * 100) / 100,
    };
}

/**
 * Compare two amortization schedules
 * 
 * Useful for comparing scenarios (with/without prepayment, different rates, etc.)
 * 
 * @param schedule1 - First schedule
 * @param schedule2 - Second schedule
 * @returns Comparison metrics
 */
export function compareSchedules(
    schedule1: AmortizationSchedule,
    schedule2: AmortizationSchedule
): {
    monthsSaved: number;
    interestSaved: number;
    totalSaved: number;
    percentageSaved: number;
} {
    const monthsSaved = schedule1.schedule.length - schedule2.schedule.length;
    const interestSaved = schedule1.totalInterest - schedule2.totalInterest;
    const totalSaved = schedule1.totalAmount - schedule2.totalAmount;
    const percentageSaved = (interestSaved / schedule1.totalInterest) * 100;

    return {
        monthsSaved,
        interestSaved: Math.round(interestSaved * 100) / 100,
        totalSaved: Math.round(totalSaved * 100) / 100,
        percentageSaved: Math.round(percentageSaved * 100) / 100,
    };
}
