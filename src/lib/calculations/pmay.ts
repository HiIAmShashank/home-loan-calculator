/**
 * PMAY (Pradhan Mantri Awas Yojana) Subsidy Calculations
 * Credit Linked Subsidy Scheme (CLSS) for affordable housing
 */

import type { PMAYInputs, PMAYResult } from '../types';
import { PMAY_CRITERIA, PMAY_MAX_TENURE } from '../constants';
import { calculateEMI } from './emi';

/**
 * Calculate PMAY subsidy under CLSS
 * 
 * Categories:
 * - EWS: Annual income ≤₹3L, subsidy 6.5% on loan up to ₹6L
 * - LIG: Annual income ₹3-6L, subsidy 6.5% on loan up to ₹6L
 * - MIG1: Annual income ₹6-12L, subsidy 4% on loan up to ₹9L
 * - MIG2: Annual income ₹12-18L, subsidy 3% on loan up to ₹12L
 * 
 * @param inputs - PMAY eligibility and loan details
 * @returns Subsidy calculation with NPV
 */
export function calculatePMAYSubsidy(inputs: PMAYInputs): PMAYResult {
    const {
        annualIncome,
        loanAmount,
        interestRate,
        tenureYears,
        propertyValue,
        isFirstTime,
    } = inputs;

    // Determine category from income
    let pmayCategory: PMAYResult['category'];
    if (annualIncome <= 300000) pmayCategory = 'EWS';
    else if (annualIncome <= 600000) pmayCategory = 'LIG';
    else if (annualIncome <= 1200000) pmayCategory = 'MIG1';
    else if (annualIncome <= 1800000) pmayCategory = 'MIG2';
    else {
        return {
            eligible: false,
            category: 'INELIGIBLE',
            subsidyRate: 0,
            maxLoanForSubsidy: 0,
            eligibleLoan: 0,
            subsidyNPV: 0,
            effectiveRate: interestRate,
            savingsPerMonth: 0,
            totalSavings: 0,
            reason: 'Annual income exceeds ₹18L (MIG2 limit)',
        };
    }

    const criteria = PMAY_CRITERIA[pmayCategory];

    if (!criteria) {
        return {
            eligible: false,
            category: pmayCategory,
            subsidyRate: 0,
            maxLoanForSubsidy: 0,
            eligibleLoan: 0,
            subsidyNPV: 0,
            effectiveRate: interestRate,
            savingsPerMonth: 0,
            totalSavings: 0,
            reason: 'Invalid category',
        };
    }

    // Check eligibility
    if (annualIncome < criteria.minIncome || annualIncome > criteria.maxIncome) {
        return {
            eligible: false,
            category: pmayCategory,
            subsidyRate: criteria.subsidyRate,
            maxLoanForSubsidy: criteria.maxLoanForSubsidy,
            eligibleLoan: 0,
            subsidyNPV: 0,
            effectiveRate: interestRate,
            savingsPerMonth: 0,
            totalSavings: 0,
            reason: `Income not in range ₹${(criteria.minIncome / 100000).toFixed(1)}L - ₹${(criteria.maxIncome / 100000).toFixed(1)}L`,
        };
    }

    if (!isFirstTime) {
        return {
            eligible: false,
            category: pmayCategory,
            subsidyRate: criteria.subsidyRate,
            maxLoanForSubsidy: criteria.maxLoanForSubsidy,
            eligibleLoan: 0,
            subsidyNPV: 0,
            effectiveRate: interestRate,
            savingsPerMonth: 0,
            totalSavings: 0,
            reason: 'PMAY subsidy only for first-time home buyers',
        };
    }

    if (propertyValue > criteria.maxPropertyValue) {
        return {
            eligible: false,
            category: pmayCategory,
            subsidyRate: criteria.subsidyRate,
            maxLoanForSubsidy: criteria.maxLoanForSubsidy,
            eligibleLoan: 0,
            subsidyNPV: 0,
            effectiveRate: interestRate,
            savingsPerMonth: 0,
            totalSavings: 0,
            reason: `Property value ₹${(propertyValue / 100000).toFixed(1)}L exceeds limit ₹${(criteria.maxPropertyValue / 100000).toFixed(1)}L`,
        };
    }

    // Calculate eligible loan amount
    const eligibleLoan = Math.min(loanAmount, criteria.maxLoanForSubsidy);

    // Calculate subsidy tenure (max 20 years or actual tenure, whichever is less)
    const subsidyTenure = Math.min(tenureYears, PMAY_MAX_TENURE);

    // Calculate NPV of subsidy
    // Subsidy = Interest differential on eligible loan for subsidy tenure
    const emiAtMarketRate = calculateEMI(eligibleLoan, interestRate, subsidyTenure);
    const emiAtSubsidizedRate = calculateEMI(eligibleLoan, interestRate - criteria.subsidyRate, subsidyTenure);

    // NPV of subsidy (present value of interest differential)
    // Using a discount rate of 8% (typical)
    const discountRate = 0.08;
    const monthlyDiscount = discountRate / 12;
    let subsidyNPV = 0;

    for (let month = 1; month <= subsidyTenure * 12; month++) {
        const monthlyDiff = emiAtMarketRate - emiAtSubsidizedRate;
        const pv = monthlyDiff / Math.pow(1 + monthlyDiscount, month);
        subsidyNPV += pv;
    }

    // Effective interest rate after subsidy
    const effectiveRate = interestRate - (criteria.subsidyRate * (eligibleLoan / loanAmount));

    return {
        eligible: true,
        category: pmayCategory,
        subsidyRate: criteria.subsidyRate,
        maxLoanForSubsidy: criteria.maxLoanForSubsidy,
        eligibleLoan,
        subsidyNPV,
        effectiveRate,
        savingsPerMonth: emiAtMarketRate - emiAtSubsidizedRate,
        totalSavings: subsidyNPV * (subsidyTenure / tenureYears),
    };
}

/**
 * Check PMAY eligibility without full calculation
 */
export function checkPMAYEligibility(
    annualIncome: number,
    propertyValue: number,
    isFirstTime: boolean
): { eligible: boolean; category?: string; reason?: string } {
    if (!isFirstTime) {
        return { eligible: false, reason: 'Only for first-time home buyers' };
    }

    let category: string;

    if (annualIncome <= 300000) category = 'EWS';
    else if (annualIncome <= 600000) category = 'LIG';
    else if (annualIncome <= 1200000) category = 'MIG1';
    else if (annualIncome <= 1800000) category = 'MIG2';
    else {
        return { eligible: false, reason: 'Income exceeds ₹18L' };
    }

    const criteria = PMAY_CRITERIA[category];

    if (propertyValue > criteria.maxPropertyValue) {
        return {
            eligible: false,
            category,
            reason: `Property value exceeds ₹${(criteria.maxPropertyValue / 10000000).toFixed(1)}Cr for ${category}`,
        };
    }

    return { eligible: true, category };
}

/**
 * Compare subsidy across all PMAY categories
 */
export function compareAcrossCategories(
    loanAmount: number,
    interestRate: number,
    tenureYears: number,
    propertyValue: number
): Array<PMAYResult> {
    const categories = ['EWS', 'LIG', 'MIG1', 'MIG2'];

    return categories.map(cat => {
        const criteria = PMAY_CRITERIA[cat];
        const result = calculatePMAYSubsidy({
            annualIncome: (criteria.minIncome + criteria.maxIncome) / 2, // Use midpoint
            loanAmount,
            interestRate,
            tenureYears,
            propertyValue,
            isFirstTime: true,
        });

        return result;
    });
}
