/**
 * Hybrid Rate Loan Calculation Module
 * 
 * Handles loans with fixed period followed by floating rate
 * Example: 2 years fixed at 8.5%, then floating at 9% with periodic increases
 */

import { calculateAdjustedEMI, generatePeriodicRateChanges } from './floatingRate';
import { calculateEMI } from './emi';
import type { AmortizationRow, AmortizationSchedule, RateChange } from '../types';

/**
 * Generate hybrid loan amortization schedule
 * 
 * Two phases:
 * 1. Fixed period: EMI calculated with fixed rate, tenure = total tenure
 * 2. Floating period: EMI recalculated with floating rate, tenure = remaining months
 * 
 * @param principal - Initial loan amount
 * @param fixedRate - Fixed period annual interest rate (%)
 * @param floatingRate - Floating period starting annual rate (%)
 * @param fixedPeriodMonths - Months with fixed rate
 * @param totalTenureYears - Total loan tenure in years
 * @param floatingRateChanges - Rate changes AFTER fixed period (month numbers relative to loan start)
 * @returns Complete amortization schedule with fixed → floating transition
 */
export function generateHybridRateSchedule(
    principal: number,
    fixedRate: number,
    floatingRate: number,
    fixedPeriodMonths: number,
    totalTenureYears: number,
    floatingRateChanges: RateChange[] = []
): AmortizationSchedule {
    // Validate inputs
    if (!isFinite(principal) || !isFinite(fixedRate) || !isFinite(floatingRate) ||
        !isFinite(fixedPeriodMonths) || !isFinite(totalTenureYears)) {
        throw new Error('Invalid input: All parameters must be finite numbers');
    }

    if (principal <= 0 || totalTenureYears <= 0) {
        return {
            schedule: [],
            totalInterest: 0,
            totalPrincipal: 0,
            totalAmount: 0,
        };
    }

    const totalMonths = totalTenureYears * 12;

    if (fixedPeriodMonths <= 0 || fixedPeriodMonths >= totalMonths) {
        throw new Error('Invalid fixed period: must be between 0 and total tenure');
    }

    const schedule: AmortizationRow[] = [];
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;

    // Phase 1: Fixed rate period
    const fixedEMI = calculateEMI(principal, fixedRate, totalTenureYears);
    const fixedMonthlyRate = fixedRate / 12 / 100;
    let balance = principal;

    for (let month = 1; month <= fixedPeriodMonths; month++) {
        if (balance <= 0) break;

        const openingBalance = balance;
        const interest = balance * fixedMonthlyRate;
        let principalPaid = fixedEMI - interest;

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

    // Phase 2: Floating rate period
    const remainingMonths = totalMonths - fixedPeriodMonths;
    const outstandingPrincipal = balance;

    // Recalculate EMI for floating phase
    let floatingEMI = calculateAdjustedEMI(outstandingPrincipal, floatingRate, remainingMonths);

    // Filter rate changes to only those in floating period
    // Adjust month numbers to be relative to floating period start
    const adjustedRateChanges = floatingRateChanges
        .filter(rc => rc.fromMonth > fixedPeriodMonths)
        .map(rc => ({
            fromMonth: rc.fromMonth - fixedPeriodMonths,
            newRate: rc.newRate,
        }));

    // Sort rate changes
    const sortedChanges = [...adjustedRateChanges].sort((a, b) => a.fromMonth - b.fromMonth);

    // Create rate map for floating period
    const rateMap = new Map<number, number>();
    let currentRate = floatingRate;

    for (let floatingMonth = 1; floatingMonth <= remainingMonths; floatingMonth++) {
        const change = sortedChanges.find(c => c.fromMonth === floatingMonth);
        if (change) {
            currentRate = change.newRate;
        }
        rateMap.set(floatingMonth, currentRate);
    }

    // Generate floating period schedule
    for (let floatingMonth = 1; floatingMonth <= remainingMonths; floatingMonth++) {
        if (balance <= 0) break;

        const absoluteMonth = fixedPeriodMonths + floatingMonth;
        const openingBalance = balance;
        const rate = rateMap.get(floatingMonth) || currentRate;
        const monthlyRate = rate / 12 / 100;

        // Check if EMI needs recalculation (rate changed)
        const previousRate = floatingMonth === 1 ? floatingRate : rateMap.get(floatingMonth - 1) || rate;
        if (floatingMonth === 1 || rate !== previousRate) {
            const remainingFromHere = remainingMonths - floatingMonth + 1;
            floatingEMI = calculateAdjustedEMI(balance, rate, remainingFromHere);
        }

        const interest = balance * monthlyRate;
        let principalPaid = floatingEMI - interest;

        // Don't overpay
        if (principalPaid > balance) {
            principalPaid = balance;
        }

        const actualEMI = interest + principalPaid;
        const closingBalance = balance - principalPaid;

        cumulativeInterest += interest;
        cumulativePrincipal += principalPaid;

        const year = Math.ceil(absoluteMonth / 12);

        schedule.push({
            month: absoluteMonth,
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
 * Calculate EMI difference between fixed and floating periods
 * 
 * Shows how much EMI changes when transitioning to floating rate
 * 
 * @param principal - Initial loan amount
 * @param fixedRate - Fixed period rate (%)
 * @param floatingRate - Floating period starting rate (%)
 * @param fixedPeriodMonths - Months in fixed period
 * @param totalTenureYears - Total tenure in years
 * @returns Object with fixed EMI, floating EMI, and difference
 */
export function calculateHybridEMIDifference(
    principal: number,
    fixedRate: number,
    floatingRate: number,
    fixedPeriodMonths: number,
    totalTenureYears: number
): {
    fixedEMI: number;
    floatingEMI: number;
    difference: number;
    percentageChange: number;
} {
    const totalMonths = totalTenureYears * 12;
    const fixedEMI = calculateEMI(principal, fixedRate, totalTenureYears);

    // Calculate outstanding after fixed period
    const fixedMonthlyRate = fixedRate / 12 / 100;
    let balance = principal;

    for (let month = 1; month <= fixedPeriodMonths; month++) {
        const interest = balance * fixedMonthlyRate;
        const principalPaid = fixedEMI - interest;
        balance -= principalPaid;
    }

    const remainingMonths = totalMonths - fixedPeriodMonths;
    const floatingEMI = calculateAdjustedEMI(balance, floatingRate, remainingMonths);

    const difference = floatingEMI - fixedEMI;
    const percentageChange = (difference / fixedEMI) * 100;

    return {
        fixedEMI: Math.round(fixedEMI * 100) / 100,
        floatingEMI: Math.round(floatingEMI * 100) / 100,
        difference: Math.round(difference * 100) / 100,
        percentageChange: Math.round(percentageChange * 100) / 100,
    };
}

/**
 * Get transition month for hybrid loan
 * 
 * Returns month number where loan switches from fixed to floating
 * Useful for chart markers
 * 
 * @param fixedPeriodMonths - Months in fixed period
 * @returns Month number of transition (1-based)
 */
export function getTransitionMonth(fixedPeriodMonths: number): number {
    return fixedPeriodMonths + 1;
}

/**
 * Calculate weighted average rate for hybrid loan
 * 
 * Averages fixed and floating rates weighted by outstanding principal
 * 
 * @param schedule - Hybrid amortization schedule
 * @param fixedRate - Fixed period rate (%)
 * @param floatingRate - Floating period starting rate (%)
 * @param fixedPeriodMonths - Months in fixed period
 * @returns Weighted average annual rate (%)
 */
export function calculateHybridAverageRate(
    schedule: AmortizationRow[],
    fixedRate: number,
    floatingRate: number,
    fixedPeriodMonths: number
): number {
    if (schedule.length === 0) return fixedRate;

    let weightedSum = 0;
    let totalWeight = 0;

    for (const row of schedule) {
        const rate = row.month <= fixedPeriodMonths ? fixedRate : floatingRate;
        weightedSum += rate * row.openingBalance;
        totalWeight += row.openingBalance;
    }

    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : fixedRate;
}

/**
 * Scenario comparison type for hybrid loans
 */
export interface HybridRateScenario {
    optimistic: {
        schedule: AmortizationSchedule;
        totalInterest: number;
        averageRate: number;
    };
    realistic: {
        schedule: AmortizationSchedule;
        totalInterest: number;
        averageRate: number;
    };
    pessimistic: {
        schedule: AmortizationSchedule;
        totalInterest: number;
        averageRate: number;
    };
}

/**
 * Generate scenario comparison for hybrid rate loan
 * 
 * Creates three scenarios:
 * - Optimistic: Floating rates decrease after fixed period
 * - Realistic: Configured rate increases in floating period
 * - Pessimistic: Double the rate increases in floating period
 * 
 * @param principal - Initial loan amount
 * @param fixedRate - Fixed period annual rate (%)
 * @param floatingRate - Floating period starting rate (%)
 * @param fixedPeriodMonths - Months in fixed period
 * @param tenureYears - Total loan tenure in years
 * @param changeFrequencyMonths - Months between rate changes (in floating period)
 * @param baseIncreasePercent - Expected rate increase per change (%)
 * @param decreasePercent - Optimistic rate decrease per change (%)
 * @returns Three scenarios with schedules and metrics
 */
export function generateScenarioComparison(
    principal: number,
    fixedRate: number,
    floatingRate: number,
    fixedPeriodMonths: number,
    tenureYears: number,
    changeFrequencyMonths: number,
    baseIncreasePercent: number = 0.25,
    decreasePercent: number = 0.1
): HybridRateScenario {
    const totalMonths = tenureYears * 12;

    // Generate rate changes for floating period only (after fixed period ends)
    // Optimistic: Rate decreases
    const optimisticChanges = generatePeriodicRateChanges(
        floatingRate,
        -decreasePercent,
        changeFrequencyMonths,
        totalMonths
    ).filter((change: RateChange) => change.fromMonth > fixedPeriodMonths);

    const optimistic = generateHybridRateSchedule(
        principal,
        fixedRate,
        floatingRate,
        fixedPeriodMonths,
        tenureYears,
        optimisticChanges
    );

    // Realistic: Moderate increases
    const realisticChanges = generatePeriodicRateChanges(
        floatingRate,
        baseIncreasePercent,
        changeFrequencyMonths,
        totalMonths
    ).filter((change: RateChange) => change.fromMonth > fixedPeriodMonths);

    const realistic = generateHybridRateSchedule(
        principal,
        fixedRate,
        floatingRate,
        fixedPeriodMonths,
        tenureYears,
        realisticChanges
    );

    // Pessimistic: Double the increase rate
    const pessimisticChanges = generatePeriodicRateChanges(
        floatingRate,
        baseIncreasePercent * 2,
        changeFrequencyMonths,
        totalMonths
    ).filter((change: RateChange) => change.fromMonth > fixedPeriodMonths);

    const pessimistic = generateHybridRateSchedule(
        principal,
        fixedRate,
        floatingRate,
        fixedPeriodMonths,
        tenureYears,
        pessimisticChanges
    );

    return {
        optimistic: {
            schedule: optimistic,
            totalInterest: optimistic.totalInterest,
            averageRate: calculateHybridAverageRate(optimistic.schedule, fixedRate, floatingRate, fixedPeriodMonths),
        },
        realistic: {
            schedule: realistic,
            totalInterest: realistic.totalInterest,
            averageRate: calculateHybridAverageRate(realistic.schedule, fixedRate, floatingRate, fixedPeriodMonths),
        },
        pessimistic: {
            schedule: pessimistic,
            totalInterest: pessimistic.totalInterest,
            averageRate: calculateHybridAverageRate(pessimistic.schedule, fixedRate, floatingRate, fixedPeriodMonths),
        },
    };
}
