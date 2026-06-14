/**
 * Affordability Calculation Module
 * Determine maximum affordable loan based on income and FOIR
 */

import type { AffordabilityInputs, AffordabilityResult } from '../types';
import { calculateEMI } from './emi';

/**
 * Per-applicant FOIR ceilings by monthly income (product heuristic, not statutory).
 * Lower earners can prudently commit a smaller share of income to EMIs, so pooling a
 * high earner with a low earner overstates eligibility. The user's FOIR slider acts as
 * an overall ceiling; each applicant is additionally capped by their income band.
 */
const FOIR_INCOME_BANDS: Array<{ maxIncome: number; foirCap: number }> = [
    { maxIncome: 30000, foirCap: 40 },
    { maxIncome: 75000, foirCap: 50 },
    { maxIncome: Infinity, foirCap: 60 },
];

function foirCapForIncome(monthlyIncome: number): number {
    return FOIR_INCOME_BANDS.find(band => monthlyIncome <= band.maxIncome)!.foirCap;
}

/**
 * Calculate maximum affordable loan amount
 * 
 * FOIR (Fixed Obligation to Income Ratio) approach:
 * - Conservative: 50% FOIR
 * - Moderate: 55% FOIR  
 * - Aggressive: 60% FOIR
 * 
 * @param inputs - Income, obligations, and loan parameters
 * @returns Maximum affordable loan and property value
 */
export function calculateAffordability(inputs: AffordabilityInputs): AffordabilityResult {
    const {
        monthlyIncome,
        coApplicantIncome = 0,
        existingEMIs = 0,
        otherObligations = 0,
        downPaymentAvailable,
        interestRate,
        tenureYears,
        foirPercentage = 50, // Default conservative
        foirMode = 'pooled',
    } = inputs;

    const totalIncome = monthlyIncome + coApplicantIncome;
    const totalObligations = existingEMIs + otherObligations;

    // Available monthly amount for new EMI.
    // Pooled: a single FOIR on combined income.
    // Per-applicant: each applicant's FOIR is capped by their own income band (slider as
    // ceiling), so a high earner's headroom no longer subsidises a low earner. With equal
    // incomes (and the slider at or below each cap) this reduces to the pooled figure.
    const perApplicant = foirMode === 'per-applicant';
    const maxAllowedEMI = perApplicant
        ? monthlyIncome * (Math.min(foirPercentage, foirCapForIncome(monthlyIncome)) / 100)
            + coApplicantIncome * (Math.min(foirPercentage, foirCapForIncome(coApplicantIncome)) / 100)
            - totalObligations
        : (totalIncome * (foirPercentage / 100)) - totalObligations;

    if (maxAllowedEMI <= 0) {
        return {
            maxAffordableEMI: 0,
            maxLoanAmount: 0,
            maxPropertyValue: 0,
            downPaymentRequired: downPaymentAvailable,
            ltvRatio: 0,
            monthlyBreakdown: {
                grossIncome: totalIncome,
                maxEMI: 0,
                existingObligations: totalObligations,
                disposableIncome: totalIncome - totalObligations,
            },
            recommendations: ['Your existing obligations exceed allowed FOIR. Consider reducing debts.'],
        };
    }

    // Reverse EMI calculation to find maximum loan
    // EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]
    // Rearranging: P = EMI × [(1+R)^N - 1] / [R × (1+R)^N]

    const monthlyRate = interestRate / 12 / 100;
    const months = tenureYears * 12;
    const rateFactorPower = Math.pow(1 + monthlyRate, months);

    const maxLoanAmount = maxAllowedEMI * ((rateFactorPower - 1) / (monthlyRate * rateFactorPower));

    // Maximum property value = loan + down payment
    const maxPropertyValue = maxLoanAmount + downPaymentAvailable;

    // Calculate LTV
    const ltvRatio = (maxLoanAmount / maxPropertyValue) * 100;

    // Check RBI LTV limits
    let rbiCompliant = true;
    let rbiMessage = '';

    if (maxPropertyValue <= 3000000 && ltvRatio > 90) {
        rbiCompliant = false;
        rbiMessage = 'LTV exceeds 90% limit for properties ≤₹30L';
    } else if (maxPropertyValue <= 7500000 && ltvRatio > 80) {
        rbiCompliant = false;
        rbiMessage = 'LTV exceeds 80% limit for properties ₹30-75L';
    } else if (maxPropertyValue > 7500000 && ltvRatio > 75) {
        rbiCompliant = false;
        rbiMessage = 'LTV exceeds 75% limit for properties >₹75L';
    }

    // Recommendations
    const recommendations: string[] = [];

    if (perApplicant && coApplicantIncome > 0) {
        recommendations.push('Per-applicant FOIR applied: each income is capped by its own band before combining, so unequal incomes are not over-credited.');
    }

    if (foirPercentage < 50) {
        recommendations.push('Very conservative approach - you have room for higher EMI if needed');
    } else if (foirPercentage >= 60) {
        recommendations.push('⚠️ High FOIR - ensure you have emergency funds');
    }

    if (ltvRatio > 80) {
        recommendations.push('Consider higher down payment to reduce LTV and get better rates');
    }

    if (!rbiCompliant) {
        recommendations.push(`❌ ${rbiMessage}`);
    }

    if (totalIncome < 30000) {
        recommendations.push('💡 Co-applicant can help increase loan eligibility');
    }

    const disposableIncome = totalIncome - totalObligations - maxAllowedEMI;
    if (disposableIncome < 15000) {
        recommendations.push('⚠️ Low disposable income after EMI - budget carefully');
    }

    return {
        maxAffordableEMI: maxAllowedEMI,
        maxLoanAmount,
        maxPropertyValue,
        downPaymentRequired: downPaymentAvailable,
        ltvRatio,
        monthlyBreakdown: {
            grossIncome: totalIncome,
            maxEMI: maxAllowedEMI,
            existingObligations: totalObligations,
            disposableIncome,
        },
        rbiCompliant,
        recommendations,
    };
}

/**
 * Calculate required income for a target property
 * Reverse calculation: given property value, find required income
 */
export function calculateRequiredIncome(
    propertyValue: number,
    downPayment: number,
    interestRate: number,
    tenureYears: number,
    foirPercentage: number = 50,
    existingEMIs: number = 0
): {
    requiredMonthlyIncome: number;
    requiredAnnualIncome: number;
    emi: number;
    loanAmount: number;
} {
    const loanAmount = propertyValue - downPayment;
    const emi = calculateEMI(loanAmount, interestRate, tenureYears);

    // Required income = (EMI + existing obligations) / FOIR%
    const requiredMonthlyIncome = (emi + existingEMIs) / (foirPercentage / 100);

    return {
        requiredMonthlyIncome,
        requiredAnnualIncome: requiredMonthlyIncome * 12,
        emi,
        loanAmount,
    };
}

/**
 * Compare affordability across different FOIR scenarios
 */
export function compareAffordabilityScenarios(
    baseInputs: AffordabilityInputs
): Array<AffordabilityResult & { scenario: string; foirPercentage: number }> {
    const scenarios = [
        { name: 'Conservative', foir: 50 },
        { name: 'Moderate', foir: 55 },
        { name: 'Aggressive', foir: 60 },
    ];

    return scenarios.map(scenario => {
        const result = calculateAffordability({
            ...baseInputs,
            foirPercentage: scenario.foir,
        });

        return {
            scenario: scenario.name,
            foirPercentage: scenario.foir,
            ...result,
        };
    });
}
