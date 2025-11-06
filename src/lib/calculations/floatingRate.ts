/**
 * Floating Rate Loan Calculation Module
 * 
 * Handles EMI calculation and amortization for loans with variable interest rates
 * Key feature: Tenure remains CONSTANT, EMI adjusts when rate changes
 */

import type { AmortizationRow, AmortizationSchedule, RateChange, FloatingRateScenario } from '../types';

/**
 * Generate periodic rate change schedule
 * 
 * Creates automatic rate increases at fixed intervals
 * Example: 8.5% base, 0.25% increase every 12 months
 * 
 * @param baseRate - Starting annual interest rate (%)
 * @param rateIncreasePercent - Rate increase per change (%)
 * @param changeFrequencyMonths - Months between rate changes
 * @param totalTenureMonths - Total loan tenure in months
 * @returns Array of rate changes with month and new rate
 */
export function generatePeriodicRateChanges(
    baseRate: number,
    rateIncreasePercent: number,
    changeFrequencyMonths: number,
    totalTenureMonths: number
): RateChange[] {
    const changes: RateChange[] = [];
    let currentRate = baseRate;

    // First rate change happens after first interval
    for (let month = changeFrequencyMonths; month <= totalTenureMonths; month += changeFrequencyMonths) {
        currentRate += rateIncreasePercent;
        changes.push({
            fromMonth: month,
            newRate: Math.round(currentRate * 100) / 100,
        });
    }

    return changes;
}

/**
 * Calculate EMI for remaining tenure at new rate
 * 
 * When rate changes mid-loan, EMI is recalculated using:
 * - Outstanding principal (current balance)
 * - New interest rate
 * - Remaining tenure (CONSTANT total months - months elapsed)
 * 
 * @param outstandingPrincipal - Remaining loan amount
 * @param newAnnualRate - New annual interest rate (%)
 * @param remainingMonths - Months left in original tenure
 * @returns New EMI amount
 */
export function calculateAdjustedEMI(
    outstandingPrincipal: number,
    newAnnualRate: number,
    remainingMonths: number
): number {
    if (outstandingPrincipal <= 0 || remainingMonths <= 0) return 0;

    const monthlyRate = newAnnualRate / 12 / 100;

    // Special case: 0% interest
    if (monthlyRate === 0) {
        return outstandingPrincipal / remainingMonths;
    }

    // EMI formula with remaining tenure
    const multiplier = Math.pow(1 + monthlyRate, remainingMonths);
    const emi = (outstandingPrincipal * monthlyRate * multiplier) / (multiplier - 1);

    return Math.round(emi * 100) / 100;
}

/**
 * Generate floating rate amortization schedule
 * 
 * Creates month-by-month schedule with EMI adjustments at rate changes
 * Tenure stays constant, EMI recalculated when rate changes
 * 
 * @param principal - Initial loan amount
 * @param baseRate - Starting annual interest rate (%)
 * @param tenureYears - Total loan tenure in years (CONSTANT)
 * @param rateChanges - Array of {fromMonth, newRate} for rate adjustments
 * @returns Complete amortization schedule with EMI changes
 */
export function generateFloatingRateSchedule(
    principal: number,
    baseRate: number,
    tenureYears: number,
    rateChanges: RateChange[]
): AmortizationSchedule {
    // Validate inputs
    if (!isFinite(principal) || !isFinite(baseRate) || !isFinite(tenureYears)) {
        throw new Error('Invalid input: All parameters must be finite numbers');
    }

    if (principal <= 0 || tenureYears <= 0) {
        return {
            schedule: [],
            totalInterest: 0,
            totalPrincipal: 0,
            totalAmount: 0,
        };
    }

    const totalMonths = tenureYears * 12;
    const schedule: AmortizationRow[] = [];

    // Sort rate changes by month
    const sortedChanges = [...rateChanges].sort((a, b) => a.fromMonth - b.fromMonth);

    // Create rate map: month -> rate
    const rateMap = new Map<number, number>();
    let currentRate = baseRate;

    for (let month = 1; month <= totalMonths; month++) {
        // Check if rate changes this month
        const change = sortedChanges.find(c => c.fromMonth === month);
        if (change) {
            currentRate = change.newRate;
        }
        rateMap.set(month, currentRate);
    }

    // Generate amortization
    let balance = principal;
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;
    let currentEMI = 0;

    for (let month = 1; month <= totalMonths; month++) {
        if (balance <= 0) break;

        const openingBalance = balance;
        const rate = rateMap.get(month) || currentRate;
        const monthlyRate = rate / 12 / 100;

        // Check if we need to recalculate EMI (rate changed)
        const previousRate = month === 1 ? baseRate : rateMap.get(month - 1) || rate;
        if (month === 1 || rate !== previousRate) {
            const remainingMonths = totalMonths - month + 1;
            currentEMI = calculateAdjustedEMI(balance, rate, remainingMonths);
        }

        const interest = balance * monthlyRate;
        let principalPaid = currentEMI - interest;

        // Don't overpay on last payment
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
            openingBalance: Math.round(openingBalance * 100) / 100,
            emi: Math.round(actualEMI * 100) / 100,
            interest: Math.round(interest * 100) / 100,
            principal: Math.round(principalPaid * 100) / 100,
            closingBalance: Math.round(closingBalance * 100) / 100,
            cumulativeInterest: Math.round(cumulativeInterest * 100) / 100,
            cumulativePrincipal: Math.round(cumulativePrincipal * 100) / 100,
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
 * Calculate average interest rate over loan tenure
 * 
 * Weighted average based on outstanding principal at each rate
 * 
 * @param schedule - Amortization schedule
 * @param rateChanges - Rate change events
 * @param baseRate - Starting rate
 * @returns Weighted average annual interest rate (%)
 */
export function calculateAverageRate(
    schedule: AmortizationRow[],
    rateChanges: RateChange[],
    baseRate: number
): number {
    if (schedule.length === 0) return baseRate;

    let weightedSum = 0;
    let totalWeight = 0;

    const sortedChanges = [...rateChanges].sort((a, b) => a.fromMonth - b.fromMonth);
    let currentRate = baseRate;
    let changeIndex = 0;

    for (const row of schedule) {
        // Update rate if changed
        if (changeIndex < sortedChanges.length && row.month >= sortedChanges[changeIndex].fromMonth) {
            currentRate = sortedChanges[changeIndex].newRate;
            changeIndex++;
        }

        // Weight by outstanding balance
        weightedSum += currentRate * row.openingBalance;
        totalWeight += row.openingBalance;
    }

    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : baseRate;
}

/**
 * Generate scenario comparison (optimistic, realistic, pessimistic)
 * 
 * Creates 3 scenarios with different rate change assumptions:
 * - Optimistic: Rate decreases by decreasePercent
 * - Realistic: Rate increases by baseIncreasePercent
 * - Pessimistic: Rate increases by (baseIncreasePercent * 2)
 * 
 * @param principal - Loan amount
 * @param baseRate - Starting annual rate (%)
 * @param tenureYears - Loan tenure in years
 * @param changeFrequencyMonths - Months between rate changes
 * @param baseIncreasePercent - Realistic rate increase per change (%)
 * @param decreasePercent - Optimistic rate decrease per change (%)
 * @returns Three scenarios with schedules and metrics
 */
export function generateScenarioComparison(
    principal: number,
    baseRate: number,
    tenureYears: number,
    changeFrequencyMonths: number,
    baseIncreasePercent: number = 0.25,
    decreasePercent: number = 0.1
): FloatingRateScenario {
    const totalMonths = tenureYears * 12;

    // Optimistic: Rate decreases
    const optimisticChanges = generatePeriodicRateChanges(
        baseRate,
        -decreasePercent,
        changeFrequencyMonths,
        totalMonths
    );
    const optimistic = generateFloatingRateSchedule(principal, baseRate, tenureYears, optimisticChanges);

    // Realistic: Moderate increases
    const realisticChanges = generatePeriodicRateChanges(
        baseRate,
        baseIncreasePercent,
        changeFrequencyMonths,
        totalMonths
    );
    const realistic = generateFloatingRateSchedule(principal, baseRate, tenureYears, realisticChanges);

    // Pessimistic: Double the increase rate
    const pessimisticChanges = generatePeriodicRateChanges(
        baseRate,
        baseIncreasePercent * 2,
        changeFrequencyMonths,
        totalMonths
    );
    const pessimistic = generateFloatingRateSchedule(principal, baseRate, tenureYears, pessimisticChanges);

    return {
        optimistic: {
            schedule: optimistic,
            totalInterest: optimistic.totalInterest,
            averageRate: calculateAverageRate(optimistic.schedule, optimisticChanges, baseRate),
        },
        realistic: {
            schedule: realistic,
            totalInterest: realistic.totalInterest,
            averageRate: calculateAverageRate(realistic.schedule, realisticChanges, baseRate),
        },
        pessimistic: {
            schedule: pessimistic,
            totalInterest: pessimistic.totalInterest,
            averageRate: calculateAverageRate(pessimistic.schedule, pessimisticChanges, baseRate),
        },
    };
}

/**
 * Get months where rate changes occur
 * 
 * Extracts list of months with EMI adjustments for chart markers
 * 
 * @param rateChanges - Rate change events
 * @returns Array of month numbers where rate changed
 */
export function getRateChangeMonths(rateChanges: RateChange[]): number[] {
    return rateChanges.map(c => c.fromMonth).sort((a, b) => a - b);
}
