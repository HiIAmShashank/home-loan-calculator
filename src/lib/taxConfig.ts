/**
 * Financial-year-keyed income-tax configuration.
 *
 * Models India income-tax rules per financial year so an annual Budget change
 * is a data edit rather than code surgery (Decision D3). Consumed by
 * src/lib/calculations/tax.ts. constants.ts retains only year-agnostic limits
 * (80C, 24(b), 80EEA caps and the 80EEA sanction window).
 *
 * Re-verify these figures against an official source whenever a new financial
 * year is added — this is the data that goes stale every Budget.
 */

export type FinancialYear = 'FY2024-25' | 'FY2025-26';

export interface TaxSlab {
    min: number;
    /** Upper bound of the band; Infinity for the top slab. */
    max: number;
    rate: number;
}

/**
 * Section 87A rebate: a full rebate of computed tax (capped at maxRebate),
 * granted when taxable income is at or below incomeThreshold. Applied before
 * the Health & Education cess.
 */
export interface RebateConfig {
    /** Maximum taxable income (after deductions) that qualifies for the rebate. */
    incomeThreshold: number;
    /** Cap on the rebate amount. */
    maxRebate: number;
}

export interface RegimeConfig {
    slabs: TaxSlab[];
    /** Standard deduction for salaried/pensioned individuals. */
    standardDeduction: number;
    rebate: RebateConfig;
}

export interface TaxConfig {
    old: RegimeConfig;
    new: RegimeConfig;
    /** Health & Education Cess applied to tax after the 87A rebate. */
    cessRate: number;
}

export const TAX_CONFIG: Record<FinancialYear, TaxConfig> = {
    /**
     * Regression anchor — reproduces the app's FY 2024-25 behaviour exactly as
     * shipped: a single ₹50,000 standard deduction for both regimes and no
     * Section 87A rebate. (Statutorily FY 2024-25 already allowed a ₹75,000
     * new-regime standard deduction and an 87A rebate; those corrections are
     * modelled under FY2025-26, the default.)
     */
    'FY2024-25': {
        old: {
            slabs: [
                { min: 0, max: 250000, rate: 0 },
                { min: 250000, max: 500000, rate: 0.05 },
                { min: 500000, max: 1000000, rate: 0.2 },
                { min: 1000000, max: Infinity, rate: 0.3 },
            ],
            standardDeduction: 50000,
            rebate: { incomeThreshold: 0, maxRebate: 0 },
        },
        new: {
            slabs: [
                { min: 0, max: 300000, rate: 0 },
                { min: 300000, max: 600000, rate: 0.05 },
                { min: 600000, max: 900000, rate: 0.1 },
                { min: 900000, max: 1200000, rate: 0.15 },
                { min: 1200000, max: 1500000, rate: 0.2 },
                { min: 1500000, max: Infinity, rate: 0.3 },
            ],
            standardDeduction: 50000,
            rebate: { incomeThreshold: 0, maxRebate: 0 },
        },
        cessRate: 0.04,
    },
    /**
     * FY 2025-26 / AY 2026-27 (post Budget 2025). New-regime slabs add a 25%
     * band (20–24L); new-regime standard deduction is ₹75,000; 87A grants a
     * full rebate (cap ₹60,000) for taxable income ≤₹12L — salaried users are
     * effectively nil up to ₹12.75L once the ₹75,000 standard deduction is in.
     * Old regime (slabs, ₹50,000 standard deduction, 87A ≤₹5L) is unchanged.
     */
    'FY2025-26': {
        old: {
            slabs: [
                { min: 0, max: 250000, rate: 0 },
                { min: 250000, max: 500000, rate: 0.05 },
                { min: 500000, max: 1000000, rate: 0.2 },
                { min: 1000000, max: Infinity, rate: 0.3 },
            ],
            standardDeduction: 50000,
            rebate: { incomeThreshold: 500000, maxRebate: 12500 },
        },
        new: {
            slabs: [
                { min: 0, max: 400000, rate: 0 },
                { min: 400000, max: 800000, rate: 0.05 },
                { min: 800000, max: 1200000, rate: 0.1 },
                { min: 1200000, max: 1600000, rate: 0.15 },
                { min: 1600000, max: 2000000, rate: 0.2 },
                { min: 2000000, max: 2400000, rate: 0.25 },
                { min: 2400000, max: Infinity, rate: 0.3 },
            ],
            standardDeduction: 75000,
            rebate: { incomeThreshold: 1200000, maxRebate: 60000 },
        },
        cessRate: 0.04,
    },
};

export const DEFAULT_FINANCIAL_YEAR: FinancialYear = 'FY2024-25';

export function getTaxConfig(fy: FinancialYear = DEFAULT_FINANCIAL_YEAR): TaxConfig {
    return TAX_CONFIG[fy];
}
