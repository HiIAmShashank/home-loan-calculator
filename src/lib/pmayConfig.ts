/**
 * Scheme-versioned PMAY (Pradhan Mantri Awas Yojana) configuration.
 *
 * Models the PMAY interest-subsidy parameters per scheme version so a scheme
 * change is a data edit rather than code surgery (mirrors the FY-keyed tax
 * config / Decision D3). Consumed by src/lib/calculations/pmay.ts.
 *
 * The DEFAULT scheme is PMAY-Urban 2.0 (ISS), the live scheme since 1 Sep 2024
 * (Decision D4). The earlier Credit Linked Subsidy Scheme (CLSS) closed to new
 * applications — MIG on 31 Mar 2021, EWS/LIG on 31 Mar 2022 — and is retained
 * ONLY as a clearly-labelled historical mode for loans sanctioned before then.
 *
 * Re-verify these figures against an official MoHUA / NHB source whenever a new
 * scheme is added — this is the data that goes stale. Figures below were
 * re-verified on 2026-06-14 against pmaymis.gov.in and PLI sources (HDFC, ICICI,
 * NHB): ISS subsidy 4.00% on the first ₹8L, ₹1.8L nominal cap (₹1.5L NPV cap at
 * an 8.5% discount), loan ≤₹25L, house ≤₹35L, 12-year horizon, MIG income ≤₹9L.
 */

import type { PMAYCategory, PMAYScheme } from './types';

export interface PMAYBand {
    category: PMAYCategory;
    /** Lower bound of the household-income band (display only). */
    minIncome: number;
    /** Upper bound of the household-income band; bands are matched by `income <= maxIncome`. */
    maxIncome: number;
    /** Interest subsidy expressed in percentage POINTS knocked off the loan rate (e.g. 4 = 4pp). */
    subsidyRatePoints: number;
    /** Subsidy is computed only on the first this-much of the loan principal. */
    maxLoanForSubsidy: number;
    /** Carpet-area ceiling in square metres (informational). */
    maxCarpetArea: number;
}

export interface PMAYSchemeConfig {
    id: PMAYScheme;
    /** Human-readable scheme name for UI copy. */
    label: string;
    /** Income/subsidy bands, ordered ascending by `maxIncome`. */
    bands: PMAYBand[];
    /** Hard property-value eligibility ceiling (Infinity if the scheme has none). */
    maxPropertyValue: number;
    /** Hard total-loan eligibility ceiling (Infinity if the scheme has none). */
    maxLoanForScheme: number;
    /** Years over which the subsidy NPV is computed (the subsidy horizon). */
    subsidyTenureCap: number;
    /** Annual discount rate used to present-value the subsidy stream. */
    discountRate: number;
    /** Statutory cap on the subsidy NPV (Infinity if none). */
    maxSubsidyNPV: number;
    /** Nominal gross subsidy headline, for UI copy (Infinity if none). */
    maxSubsidyNominal: number;
}

export const PMAY_SCHEMES: Record<PMAYScheme, PMAYSchemeConfig> = {
    /**
     * PMAY-Urban 2.0, Interest Subsidy Scheme (ISS) — live since 1 Sep 2024.
     * A flat 4% subsidy on the first ₹8L of the loan for all categories, over a
     * 12-year horizon, NPV-discounted at 8.5% and capped at ₹1.5L NPV (the
     * ₹1.8L "up to" headline is the nominal sum of 5 yearly ₹36,000 DBT
     * instalments). Hard gates: house ≤₹35L, loan ≤₹25L, household income ≤₹9L.
     */
    'PMAY-U-2.0-ISS': {
        id: 'PMAY-U-2.0-ISS',
        label: 'PMAY-Urban 2.0 (ISS)',
        bands: [
            { category: 'EWS', minIncome: 0, maxIncome: 300000, subsidyRatePoints: 4, maxLoanForSubsidy: 800000, maxCarpetArea: 120 },
            { category: 'LIG', minIncome: 300001, maxIncome: 600000, subsidyRatePoints: 4, maxLoanForSubsidy: 800000, maxCarpetArea: 120 },
            { category: 'MIG', minIncome: 600001, maxIncome: 900000, subsidyRatePoints: 4, maxLoanForSubsidy: 800000, maxCarpetArea: 120 },
        ],
        maxPropertyValue: 3500000,
        maxLoanForScheme: 2500000,
        subsidyTenureCap: 12,
        discountRate: 0.085,
        maxSubsidyNPV: 150000,
        maxSubsidyNominal: 180000,
    },
    /**
     * Historical PMAY-CLSS (closed: MIG 31 Mar 2021, EWS/LIG 31 Mar 2022).
     * Retained only for loans sanctioned before closure (Decision D4); not a
     * current option. EWS/LIG 6.5% on ₹6L, MIG-I 4% on ₹9L, MIG-II 3% on ₹12L,
     * over a 20-year horizon, NPV-discounted at the CLSS-era 9%. Property cap
     * ₹45L (metro proxy); no overall loan ceiling.
     */
    'CLSS-pre-2022': {
        id: 'CLSS-pre-2022',
        label: 'PMAY-CLSS (historical, pre-2022 sanction)',
        bands: [
            { category: 'EWS', minIncome: 0, maxIncome: 300000, subsidyRatePoints: 6.5, maxLoanForSubsidy: 600000, maxCarpetArea: 30 },
            { category: 'LIG', minIncome: 300001, maxIncome: 600000, subsidyRatePoints: 6.5, maxLoanForSubsidy: 600000, maxCarpetArea: 60 },
            { category: 'MIG1', minIncome: 600001, maxIncome: 1200000, subsidyRatePoints: 4, maxLoanForSubsidy: 900000, maxCarpetArea: 160 },
            { category: 'MIG2', minIncome: 1200001, maxIncome: 1800000, subsidyRatePoints: 3, maxLoanForSubsidy: 1200000, maxCarpetArea: 200 },
        ],
        maxPropertyValue: 4500000,
        maxLoanForScheme: Infinity,
        subsidyTenureCap: 20,
        discountRate: 0.09,
        maxSubsidyNPV: Infinity,
        maxSubsidyNominal: Infinity,
    },
};

export const DEFAULT_PMAY_SCHEME: PMAYScheme = 'PMAY-U-2.0-ISS';

export function getPMAYScheme(scheme: PMAYScheme = DEFAULT_PMAY_SCHEME): PMAYSchemeConfig {
    const config = PMAY_SCHEMES[scheme];
    if (!config) {
        throw new Error(`No PMAY configuration for scheme "${scheme}"`);
    }
    return config;
}
