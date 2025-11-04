/**
 * Affordability Calculation Module
 * Determine maximum affordable loan based on income and FOIR
 */

import type { AffordabilityInputs, AffordabilityResult } from '../types';
import { calculateEMI } from './emi';

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
    } = inputs;

    const totalIncome = monthlyIncome + coApplicantIncome;
    const totalObligations = existingEMIs + otherObligations;

    // Available monthly amount for new EMI
    const maxAllowedEMI = (totalIncome * (foirPercentage / 100)) - totalObligations;

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
