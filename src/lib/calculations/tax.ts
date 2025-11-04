/**
 * Tax Calculation Module for Indian Home Loans
 * 
 * Handles all tax benefit calculations under Old and New tax regimes
 * Sections: 80C (principal), 24(b) (interest), 80EEA (first-time buyer)
 */

import {
    SECTION_80C_LIMIT,
    SECTION_24B_LIMIT_SELF_OCCUPIED,
    SECTION_80EEA_LIMIT,
    SECTION_80EEA_PROPERTY_VALUE_LIMIT,
    TAX_SLABS_OLD,
    TAX_SLABS_NEW,
    STANDARD_DEDUCTION,
    CESS_RATE,
} from '../constants';
import type { DeductionResult, TaxInputs, TaxBreakdown, TaxRegime } from '../types';

/**
 * Calculate Section 80C deduction (Principal repayment)
 * 
 * Maximum deduction: ₹1,50,000 per year
 * Shared with other 80C investments (PPF, ELSS, insurance, etc.)
 * 
 * @param principalPaid - Principal amount paid in the year
 * @param other80CInvestments - Other 80C investments made
 * @returns Deduction details
 */
export function calculate80C(
    principalPaid: number,
    other80CInvestments: number = 0
): DeductionResult {
    const totalInvestments = principalPaid + other80CInvestments;
    const deduction = Math.min(totalInvestments, SECTION_80C_LIMIT);

    // How much of the deduction is utilized by home loan principal
    const utilized = Math.min(principalPaid, Math.max(0, SECTION_80C_LIMIT - other80CInvestments));

    return {
        deduction: Math.round(deduction),
        utilized: Math.round(utilized),
    };
}

/**
 * Calculate Section 24(b) deduction (Interest payment)
 * 
 * Self-occupied: Maximum ₹2,00,000 per year
 * Let-out: No limit (entire interest deductible)
 * 
 * @param interestPaid - Interest amount paid in the year
 * @param isLetOut - Whether property is let out (rented)
 * @returns Deduction amount
 */
export function calculate24b(
    interestPaid: number,
    isLetOut: boolean = false
): number {
    if (isLetOut) {
        // No limit for let-out property
        return Math.round(interestPaid);
    }

    // Self-occupied property limit
    return Math.round(Math.min(interestPaid, SECTION_24B_LIMIT_SELF_OCCUPIED));
}

/**
 * Calculate Section 80EEA deduction (First-time home buyer)
 * 
 * Additional deduction: ₹1,50,000 on interest
 * Conditions:
 * - First-time home buyer
 * - Property value ≤ ₹45 lakh
 * - Loan sanctioned between specific dates
 * 
 * @param isFirstTimeBuyer - Whether buyer is first-time
 * @param propertyValue - Property value
 * @param interestPaid - Interest paid in the year
 * @param section24bUsed - Amount already claimed under 24(b)
 * @returns Additional deduction amount
 */
export function calculate80EEA(
    isFirstTimeBuyer: boolean,
    propertyValue: number,
    interestPaid: number,
    section24bUsed: number = 0
): number {
    // Check eligibility
    if (!isFirstTimeBuyer) return 0;
    if (propertyValue > SECTION_80EEA_PROPERTY_VALUE_LIMIT) return 0;

    // 80EEA is additional to 24(b), so use remaining interest
    const remainingInterest = Math.max(0, interestPaid - section24bUsed);

    return Math.round(Math.min(remainingInterest, SECTION_80EEA_LIMIT));
}

/**
 * Calculate tax under old regime
 * 
 * FY 2024-25 Slabs:
 * ₹0-2.5L: 0%
 * ₹2.5-5L: 5%
 * ₹5-10L: 20%
 * Above ₹10L: 30%
 * Plus 4% cess
 * 
 * @param income - Gross income
 * @param deductions - Total deductions (80C + 24b + 80EEA + others)
 * @returns Tax amount
 */
export function calculateTaxOld(
    income: number,
    deductions: number = 0
): number {
    // Standard deduction applies
    const taxableIncome = Math.max(0, income - deductions - STANDARD_DEDUCTION);

    let tax = 0;
    let remaining = taxableIncome;

    for (const slab of TAX_SLABS_OLD) {
        if (remaining <= 0) break;

        const slabAmount = slab.max === Infinity
            ? remaining
            : Math.min(remaining, slab.max - slab.min);

        tax += slabAmount * slab.rate;
        remaining -= slabAmount;
    }

    // Add Health & Education Cess (4%)
    tax = tax * (1 + CESS_RATE);

    return Math.round(tax);
}

/**
 * Calculate tax under new regime
 * 
 * FY 2024-25 Slabs:
 * ₹0-3L: 0%
 * ₹3-6L: 5%
 * ₹6-9L: 10%
 * ₹9-12L: 15%
 * ₹12-15L: 20%
 * Above ₹15L: 30%
 * 
 * NOTE: NO deductions allowed except standard deduction
 * 
 * @param income - Gross income
 * @returns Tax amount
 */
export function calculateTaxNew(income: number): number {
    // Only standard deduction applies in new regime
    const taxableIncome = Math.max(0, income - STANDARD_DEDUCTION);

    let tax = 0;
    let remaining = taxableIncome;

    for (const slab of TAX_SLABS_NEW) {
        if (remaining <= 0) break;

        const slabAmount = slab.max === Infinity
            ? remaining
            : Math.min(remaining, slab.max - slab.min);

        tax += slabAmount * slab.rate;
        remaining -= slabAmount;
    }

    // Add Health & Education Cess (4%)
    tax = tax * (1 + CESS_RATE);

    return Math.round(tax);
}

/**
 * Calculate comprehensive tax savings from home loan
 * 
 * Compares tax in both regimes and provides recommendation
 * 
 * @param inputs - Complete tax calculation inputs
 * @returns Complete tax breakdown with savings
 */
export function calculateTaxSavings(inputs: TaxInputs): TaxBreakdown {
    const {
        annualIncome,
        principalPaid,
        interestPaid,
        isFirstTimeBuyer,
        propertyValue,
        other80CInvestments = 0,
    } = inputs;

    // Calculate tax under new regime (no deductions)
    const taxNew = calculateTaxNew(annualIncome);

    // Calculate deductions under old regime
    const section80C = calculate80C(principalPaid, other80CInvestments);
    const section24b = calculate24b(interestPaid, false); // Assuming self-occupied
    const section80EEA = calculate80EEA(isFirstTimeBuyer, propertyValue, interestPaid, section24b);

    const totalDeductions = section80C.deduction + section24b + section80EEA;

    // Calculate tax under old regime with home loan deductions
    const taxOldWithLoan = calculateTaxOld(annualIncome, totalDeductions);

    // Calculate tax under old regime without home loan (only other investments)
    const taxOldWithoutLoan = calculateTaxOld(annualIncome, other80CInvestments);

    // Determine which regime is better
    const oldRegimeBetter = taxOldWithLoan < taxNew;
    const recommendedRegime: TaxRegime = oldRegimeBetter ? 'old' : 'new';

    // Calculate savings under old regime
    const savingsOldRegime = taxOldWithoutLoan - taxOldWithLoan;

    return {
        deductions: {
            section80C: section80C.utilized,
            section24b,
            section80EEA,
            total: section80C.utilized + section24b + section80EEA,
        },
        taxWithoutLoan: taxOldWithoutLoan,
        taxWithLoan: taxOldWithLoan,
        savings: savingsOldRegime,
        effectiveTaxRate: (taxOldWithLoan / annualIncome) * 100,
        recommendedRegime,
    };
}

/**
 * Calculate joint loan tax benefits
 * 
 * For joint loans, both co-borrowers can claim deductions
 * Each can claim full limits (₹1.5L + ₹2L + ₹1.5L if eligible)
 * 
 * @param primaryIncome - Primary borrower income
 * @param coIncome - Co-borrower income
 * @param principalPaid - Total principal paid
 * @param interestPaid - Total interest paid
 * @param split - Ownership split (0.5 = 50-50)
 * @param isFirstTimeBuyer - First-time buyer status
 * @param propertyValue - Property value
 * @returns Combined tax savings for both borrowers
 */
export function calculateJointLoanBenefits(
    primaryIncome: number,
    coIncome: number,
    principalPaid: number,
    interestPaid: number,
    split: number = 0.5,
    isFirstTimeBuyer: boolean = false,
    propertyValue: number = 0
): {
    primarySavings: number;
    coSavings: number;
    totalSavings: number;
    combinedDeduction: number;
} {
    // Each borrower can claim their portion
    const primaryPrincipal = principalPaid * split;
    const primaryInterest = interestPaid * split;
    const coPrincipal = principalPaid * (1 - split);
    const coInterest = interestPaid * (1 - split);

    // Calculate for primary borrower
    const primaryBreakdown = calculateTaxSavings({
        annualIncome: primaryIncome,
        taxRegime: 'old',
        principalPaid: primaryPrincipal,
        interestPaid: primaryInterest,
        isFirstTimeBuyer,
        propertyValue,
        isJointLoan: true,
    });

    // Calculate for co-borrower
    const coBreakdown = calculateTaxSavings({
        annualIncome: coIncome,
        taxRegime: 'old',
        principalPaid: coPrincipal,
        interestPaid: coInterest,
        isFirstTimeBuyer,
        propertyValue,
        isJointLoan: true,
    });

    return {
        primarySavings: primaryBreakdown.savings,
        coSavings: coBreakdown.savings,
        totalSavings: primaryBreakdown.savings + coBreakdown.savings,
        combinedDeduction: primaryBreakdown.deductions.total + coBreakdown.deductions.total,
    };
}

/**
 * Calculate pre-EMI interest deduction
 * 
 * For under-construction properties, interest paid during construction
 * can be claimed as 1/5th over 5 years after possession
 * 
 * @param preEMIInterest - Total interest paid during construction
 * @returns Annual deduction amount for 5 years
 */
export function calculatePreEMIDeduction(preEMIInterest: number): number {
    // Deductible in 5 equal installments
    return Math.round(preEMIInterest / 5);
}

/**
 * Calculate effective tax rate after home loan benefits
 * 
 * @param income - Annual income
 * @param taxPaid - Tax paid after home loan deductions
 * @returns Effective tax rate as percentage
 */
export function calculateEffectiveTaxRate(
    income: number,
    taxPaid: number
): number {
    if (income === 0) return 0;
    return Math.round((taxPaid / income) * 10000) / 100;
}

/**
 * Estimate annual tax savings over loan tenure
 * 
 * Note: This is a simplification - actual savings vary year by year
 * as interest component decreases and principal increases
 * 
 * @param inputs - Tax calculation inputs
 * @param tenureYears - Loan tenure in years
 * @returns Array of yearly tax savings
 */
export function estimateYearlySavings(
    inputs: TaxInputs,
    tenureYears: number
): Array<{ year: number; savings: number }> {
    // Simplified: assumes constant savings (actual will vary)
    const yearOneSavings = calculateTaxSavings(inputs).savings;

    const yearlyBreakdown: Array<{ year: number; savings: number }> = [];

    for (let year = 1; year <= tenureYears; year++) {
        // In reality, savings decrease as interest decreases
        // and 80C benefit stops after principal is fully paid
        // This is a conservative estimate
        const estimatedSavings = year <= 20 ? yearOneSavings : 0;

        yearlyBreakdown.push({
            year,
            savings: Math.round(estimatedSavings),
        });
    }

    return yearlyBreakdown;
}
