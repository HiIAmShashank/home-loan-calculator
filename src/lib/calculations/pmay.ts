/**
 * PMAY (Pradhan Mantri Awas Yojana) Subsidy Calculations
 *
 * Defaults to the live PMAY-Urban 2.0 Interest Subsidy Scheme (ISS); the closed
 * Credit Linked Subsidy Scheme (CLSS) is reachable only as a historical mode.
 * Scheme parameters are versioned in src/lib/pmayConfig.ts.
 */

import type { PMAYInputs, PMAYResult, PMAYScheme } from '../types';
import {
    getPMAYScheme,
    DEFAULT_PMAY_SCHEME,
    type PMAYSchemeConfig,
} from '../pmayConfig';
import { calculateEMI } from './emi';

/** Find the income band a household falls into, or undefined if income exceeds the top band. */
function findBand(config: PMAYSchemeConfig, annualIncome: number) {
    return config.bands.find(band => annualIncome <= band.maxIncome);
}

/**
 * Calculate the PMAY interest subsidy for the given scheme.
 *
 * For PMAY-U 2.0 ISS (default): a flat 4% subsidy on the first ₹8L of the loan,
 * present-valued over a 12-year horizon at 8.5% and capped at the ₹1.5L NPV
 * ceiling. Eligibility gates: first-time buyer, house ≤₹35L, loan ≤₹25L,
 * household income ≤₹9L. CLSS (historical) uses its own pre-2022 bands and caps.
 *
 * @param inputs - PMAY eligibility and loan details
 * @param scheme - scheme version (defaults to PMAY-U 2.0 ISS)
 * @returns Subsidy calculation with NPV
 */
export function calculatePMAYSubsidy(
    inputs: PMAYInputs,
    scheme: PMAYScheme = DEFAULT_PMAY_SCHEME
): PMAYResult {
    const {
        annualIncome,
        loanAmount,
        interestRate,
        tenureYears,
        propertyValue,
        isFirstTime,
    } = inputs;

    const config = getPMAYScheme(scheme);

    const ineligible = (
        category: PMAYResult['category'],
        reason: string,
        extra: Partial<Pick<PMAYResult, 'subsidyRate' | 'maxLoanForSubsidy'>> = {}
    ): PMAYResult => ({
        eligible: false,
        scheme,
        category,
        subsidyRate: 0,
        maxLoanForSubsidy: 0,
        eligibleLoan: 0,
        subsidyNPV: 0,
        effectiveRate: interestRate,
        savingsPerMonth: 0,
        totalSavings: 0,
        reason,
        ...extra,
    });

    const band = findBand(config, annualIncome);
    if (!band) {
        const ceiling = config.bands[config.bands.length - 1].maxIncome;
        return ineligible(
            'INELIGIBLE',
            `Annual income exceeds the ${config.label} ceiling of ₹${(ceiling / 100000).toFixed(1)}L`
        );
    }

    if (!isFirstTime) {
        return ineligible(band.category, 'PMAY subsidy is only for first-time home buyers', {
            subsidyRate: band.subsidyRatePoints,
            maxLoanForSubsidy: band.maxLoanForSubsidy,
        });
    }

    if (propertyValue > config.maxPropertyValue) {
        return ineligible(
            band.category,
            `Property value ₹${(propertyValue / 100000).toFixed(1)}L exceeds the ${config.label} limit of ₹${(config.maxPropertyValue / 100000).toFixed(1)}L`,
            { subsidyRate: band.subsidyRatePoints, maxLoanForSubsidy: band.maxLoanForSubsidy }
        );
    }

    if (loanAmount > config.maxLoanForScheme) {
        return ineligible(
            band.category,
            `Loan amount ₹${(loanAmount / 100000).toFixed(1)}L exceeds the ${config.label} eligibility limit of ₹${(config.maxLoanForScheme / 100000).toFixed(1)}L`,
            { subsidyRate: band.subsidyRatePoints, maxLoanForSubsidy: band.maxLoanForSubsidy }
        );
    }

    // Subsidy is computed only on the first slice of the loan, over the subsidy horizon.
    const eligibleLoan = Math.min(loanAmount, band.maxLoanForSubsidy);
    const subsidyTenure = Math.min(tenureYears, config.subsidyTenureCap);

    // NPV of the interest subsidy = present value of the EMI differential between
    // the market rate and the subsidised (rate − subsidy points) rate, on the
    // eligible loan slice, discounted at the scheme's discount rate.
    const subsidisedRate = Math.max(0, interestRate - band.subsidyRatePoints);
    const emiAtMarketRate = calculateEMI(eligibleLoan, interestRate, subsidyTenure);
    const emiAtSubsidizedRate = calculateEMI(eligibleLoan, subsidisedRate, subsidyTenure);
    const grossSavingsPerMonth = emiAtMarketRate - emiAtSubsidizedRate;

    const monthlyDiscount = config.discountRate / 12;
    let grossSubsidyNPV = 0;
    for (let month = 1; month <= subsidyTenure * 12; month++) {
        grossSubsidyNPV += grossSavingsPerMonth / Math.pow(1 + monthlyDiscount, month);
    }

    // Apply the statutory NPV ceiling (Infinity for schemes without one). When the
    // cap binds, scale the monthly saving and the effective-rate reduction by the
    // same ratio so all three headline figures reconcile to the capped benefit.
    const subsidyNPV = Math.min(grossSubsidyNPV, config.maxSubsidyNPV);
    const capRatio = grossSubsidyNPV > 0 ? subsidyNPV / grossSubsidyNPV : 0;
    const savingsPerMonth = grossSavingsPerMonth * capRatio;

    // Effective rate blends the subsidy across the whole loan (subsidy only on the eligible slice).
    const effectiveRate = interestRate - band.subsidyRatePoints * (eligibleLoan / loanAmount) * capRatio;

    return {
        eligible: true,
        scheme,
        category: band.category,
        subsidyRate: band.subsidyRatePoints,
        maxLoanForSubsidy: band.maxLoanForSubsidy,
        eligibleLoan,
        subsidyNPV,
        effectiveRate,
        savingsPerMonth,
        totalSavings: subsidyNPV,
    };
}
