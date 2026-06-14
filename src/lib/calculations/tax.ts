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
    SECTION_80EEA_SANCTION_START,
    SECTION_80EEA_SANCTION_END,
} from '../constants';
import { getTaxConfig, DEFAULT_FINANCIAL_YEAR } from '../taxConfig';
import type { FinancialYear, TaxSlab, RebateConfig } from '../taxConfig';
import type { DeductionResult, TaxInputs, TaxBreakdown, TaxRegime } from '../types';

/**
 * Compute slab tax on a taxable income against a progressive slab table.
 */
function computeSlabTax(taxableIncome: number, slabs: TaxSlab[]): number {
    let tax = 0;
    let remaining = taxableIncome;

    for (const slab of slabs) {
        if (remaining <= 0) break;

        const slabAmount = slab.max === Infinity
            ? remaining
            : Math.min(remaining, slab.max - slab.min);

        tax += slabAmount * slab.rate;
        remaining -= slabAmount;
    }

    return tax;
}

/**
 * Compute the Section 87A rebate: a full rebate of computed tax, capped at
 * rebate.maxRebate, when taxable income is at or below rebate.incomeThreshold.
 * Applied to tax before the Health & Education cess. (Marginal relief just
 * above the threshold is not modelled — tracked in the Open Backlog.)
 */
function computeRebate(taxableIncome: number, taxBeforeCess: number, rebate: RebateConfig): number {
    if (taxableIncome > rebate.incomeThreshold) return 0;
    return Math.min(taxBeforeCess, rebate.maxRebate);
}

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
 * Conditions (all must hold):
 * - First-time home buyer
 * - Property value ≤ ₹45 lakh
 * - Loan sanctioned within 1 Apr 2019 – 31 Mar 2022 (inclusive)
 *
 * The deduction is unavailable for any loan sanctioned after Mar 2022, so it
 * defaults OFF: a missing sanction date yields ₹0.
 *
 * @param isFirstTimeBuyer - Whether buyer is first-time
 * @param propertyValue - Property value
 * @param interestPaid - Interest paid in the year
 * @param section24bUsed - Amount already claimed under 24(b)
 * @param loanSanctionDate - Loan sanction date (ISO YYYY-MM-DD); undefined = ineligible
 * @returns Additional deduction amount
 */
export function calculate80EEA(
    isFirstTimeBuyer: boolean,
    propertyValue: number,
    interestPaid: number,
    section24bUsed: number = 0,
    loanSanctionDate?: string
): number {
    // Check eligibility
    if (!isFirstTimeBuyer) return 0;
    if (propertyValue > SECTION_80EEA_PROPERTY_VALUE_LIMIT) return 0;
    // Sanction-date window gate — default OFF when no date is supplied
    if (!loanSanctionDate) return 0;
    if (loanSanctionDate < SECTION_80EEA_SANCTION_START || loanSanctionDate > SECTION_80EEA_SANCTION_END) {
        return 0;
    }

    // 80EEA is additional to 24(b), so use remaining interest
    const remainingInterest = Math.max(0, interestPaid - section24bUsed);

    return Math.round(Math.min(remainingInterest, SECTION_80EEA_LIMIT));
}

/**
 * Calculate tax under old regime
 *
 * Slabs, standard deduction and cess are sourced from the FY-keyed tax config.
 *
 * @param income - Gross income
 * @param deductions - Total deductions (80C + 24b + 80EEA + others)
 * @param fy - Financial year (defaults to the current default FY)
 * @returns Tax amount
 */
export function calculateTaxOld(
    income: number,
    deductions: number = 0,
    fy: FinancialYear = DEFAULT_FINANCIAL_YEAR
): number {
    const config = getTaxConfig(fy);
    const regime = config.old;

    // Standard deduction applies
    const taxableIncome = Math.max(0, income - deductions - regime.standardDeduction);

    let tax = computeSlabTax(taxableIncome, regime.slabs);

    // Section 87A rebate, applied before cess
    tax -= computeRebate(taxableIncome, tax, regime.rebate);

    // Add Health & Education Cess
    tax = tax * (1 + config.cessRate);

    return Math.round(tax);
}

/**
 * Calculate tax under new regime
 *
 * Slabs, standard deduction and cess are sourced from the FY-keyed tax config.
 * No deductions are allowed except the standard deduction.
 *
 * @param income - Gross income
 * @param fy - Financial year (defaults to the current default FY)
 * @returns Tax amount
 */
export function calculateTaxNew(
    income: number,
    fy: FinancialYear = DEFAULT_FINANCIAL_YEAR
): number {
    const config = getTaxConfig(fy);
    const regime = config.new;

    // Only standard deduction applies in new regime
    const taxableIncome = Math.max(0, income - regime.standardDeduction);

    let tax = computeSlabTax(taxableIncome, regime.slabs);

    // Section 87A rebate, applied before cess
    tax -= computeRebate(taxableIncome, tax, regime.rebate);

    // Add Health & Education Cess
    tax = tax * (1 + config.cessRate);

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
export function calculateTaxSavings(
    inputs: TaxInputs,
    fy: FinancialYear = DEFAULT_FINANCIAL_YEAR
): TaxBreakdown {
    const {
        annualIncome,
        principalPaid,
        interestPaid,
        isFirstTimeBuyer,
        propertyValue,
        other80CInvestments = 0,
        loanSanctionDate,
    } = inputs;

    // Calculate tax under new regime (no deductions)
    const taxNew = calculateTaxNew(annualIncome, fy);

    // Calculate deductions under old regime
    const section80C = calculate80C(principalPaid, other80CInvestments);
    const section24b = calculate24b(interestPaid, false); // Assuming self-occupied
    const section80EEA = calculate80EEA(isFirstTimeBuyer, propertyValue, interestPaid, section24b, loanSanctionDate);

    const totalDeductions = section80C.deduction + section24b + section80EEA;

    // Calculate tax under old regime with home loan deductions
    const taxOldWithLoan = calculateTaxOld(annualIncome, totalDeductions, fy);

    // Calculate tax under old regime without home loan (only other investments)
    const taxOldWithoutLoan = calculateTaxOld(annualIncome, other80CInvestments, fy);

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
        effectiveTaxRate: annualIncome > 0 ? (taxOldWithLoan / annualIncome) * 100 : 0,
        taxNewRegime: taxNew,
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
