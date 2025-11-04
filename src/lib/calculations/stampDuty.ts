/**
 * Stamp Duty & Registration Calculations
 * Indian state-specific property transaction costs
 */

import type {
    StampDutyInputs,
    StampDutyBreakdown,
    PropertyCostBreakdown,
} from '../types';
import {
    STAMP_DUTY_RATES,
    REGISTRATION_FEES,
    GST_RATE,
} from '../constants';

/**
 * Calculate stamp duty for a property based on state and gender
 * 
 * @param propertyValue - Market value of the property in ₹
 * @param state - Indian state (e.g., 'Maharashtra', 'Karnataka')
 * @param gender - Gender of the purchaser ('male', 'female', 'joint')
 * @returns Stamp duty amount in ₹
 * 
 * @example
 * // Maharashtra property ₹50L, male
 * calculateStampDuty(5000000, 'Maharashtra', 'male')
 * // Returns: 300000 (6% of ₹50L)
 * 
 * @example
 * // Maharashtra property ₹50L, female (1% discount)
 * calculateStampDuty(5000000, 'Maharashtra', 'female')
 * // Returns: 250000 (5% of ₹50L)
 */
export function calculateStampDuty(
    propertyValue: number,
    state: string,
    gender: 'male' | 'female' | 'joint' = 'male'
): number {
    const stateRates = STAMP_DUTY_RATES[state];

    if (!stateRates) {
        // Log warning when using default rate for unlisted states
        console.warn(`Stamp duty rates not found for state: ${state}. Using default 5% rate. Please verify with local authorities.`);
        return Math.round(propertyValue * 0.05);
    }

    let rate = stateRates.men;

    if (gender === 'female' && stateRates.women !== undefined) {
        rate = stateRates.women;
    } else if (gender === 'joint' && stateRates.women !== undefined) {
        // Joint typically uses women's rate if available, else men's
        rate = stateRates.women;
    }

    return Math.round(propertyValue * rate);
}

/**
 * Calculate registration fee for property
 * 
 * @param propertyValue - Market value of the property in ₹
 * @param state - Indian state
 * @returns Registration fee amount in ₹
 * 
 * @example
 * // Maharashtra property ₹50L
 * calculateRegistrationFee(5000000, 'Maharashtra')
 * // Returns: 30000 (₹30k fixed)
 */
export function calculateRegistrationFee(
    propertyValue: number,
    state: string
): number {
    const feeStructure = REGISTRATION_FEES[state] || REGISTRATION_FEES.default;

    // Simple rate with cap
    const calculatedFee = propertyValue * feeStructure.rate;
    return Math.min(calculatedFee, feeStructure.cap);
}

/**
 * Calculate GST on under-construction property
 * 
 * GST is applicable only on under-construction properties at 5% (after abatement).
 * Note: GST applies ONLY to the construction value, NOT land value.
 * 
 * @param propertyValue - Total property value in ₹
 * @param isUnderConstruction - Whether property is under construction
 * @param constructionRatio - Ratio of construction value to total (default 0.7)
 * @returns GST amount in ₹
 * 
 * @example
 * // Under-construction flat ₹50L (70% construction, 30% land)
 * calculateGST(5000000, true, 0.7)
 * // Returns: 175000 (5% of ₹35L construction value)
 * 
 * @example
 * // Ready-to-move property (no GST)
 * calculateGST(5000000, false)
 * // Returns: 0
 */
export function calculateGST(
    propertyValue: number,
    isUnderConstruction: boolean,
    constructionRatio: number = 0.7
): number {
    if (!isUnderConstruction) {
        return 0;
    }

    // GST applies only to construction value (not land)
    const constructionValue = propertyValue * constructionRatio;
    return Math.round(constructionValue * GST_RATE);
}

/**
 * Calculate complete stamp duty breakdown
 * 
 * @param inputs - Stamp duty calculation inputs
 * @returns Detailed breakdown of all costs
 * 
 * @example
 * calculateStampDutyBreakdown({
 *   propertyValue: 5000000,
 *   state: 'Maharashtra',
 *   gender: 'female',
 *   isUnderConstruction: false
 * })
 * // Returns: {
 * //   stampDuty: 250000,
 * //   registrationFee: 30000,
 * //   gst: 0,
 * //   totalTransactionCost: 280000,
 * //   effectiveRate: 0.056 (5.6%)
 * // }
 */
export function calculateStampDutyBreakdown(
    inputs: StampDutyInputs
): StampDutyBreakdown {
    const stampDuty = calculateStampDuty(
        inputs.propertyValue,
        inputs.state,
        inputs.gender
    );

    const registrationFee = calculateRegistrationFee(
        inputs.propertyValue,
        inputs.state
    );

    const gst = calculateGST(
        inputs.propertyValue,
        inputs.isUnderConstruction || false,
        inputs.constructionRatio
    );

    const totalTransactionCost = stampDuty + registrationFee + gst;
    const effectiveRate = totalTransactionCost / inputs.propertyValue;

    return {
        stampDuty,
        registrationFee,
        gst,
        totalTransactionCost,
        effectiveRate,
    };
}

/**
 * Calculate total property acquisition cost including all fees
 * 
 * @param propertyValue - Market value of the property in ₹
 * @param state - Indian state
 * @param gender - Gender for stamp duty calculation
 * @param isUnderConstruction - Whether property is under construction
 * @param legalFees - Legal/lawyer fees (default ₹10k)
 * @param otherFees - Other miscellaneous fees (brokerage, society, etc.)
 * @returns Complete property cost breakdown
 * 
 * @example
 * calculatePropertyCost(5000000, 'Maharashtra', 'female', false, 10000, 50000)
 * // Returns: {
 * //   propertyValue: 5000000,
 * //   stampDuty: 250000,
 * //   registrationFee: 30000,
 * //   gst: 0,
 * //   legalFees: 10000,
 * //   otherFees: 50000,
 * //   totalCost: 5340000
 * // }
 */
export function calculatePropertyCost(
    propertyValue: number,
    state: string,
    gender: 'male' | 'female' | 'joint' = 'male',
    isUnderConstruction: boolean = false,
    legalFees: number = 10000,
    otherFees: number = 0
): PropertyCostBreakdown {
    const breakdown = calculateStampDutyBreakdown({
        propertyValue,
        state,
        gender,
        isUnderConstruction: isUnderConstruction || false,
    });

    const totalCost =
        propertyValue +
        breakdown.totalTransactionCost +
        legalFees +
        otherFees;

    return {
        propertyValue,
        stampDuty: breakdown.stampDuty,
        registrationFee: breakdown.registrationFee,
        gst: breakdown.gst,
        legalFees,
        otherFees,
        totalCost,
    };
}

/**
 * Compare stamp duty costs across multiple states
 * 
 * @param propertyValue - Market value of the property in ₹
 * @param states - Array of state names to compare
 * @param gender - Gender for stamp duty calculation
 * @returns Array of breakdowns for each state, sorted by total cost (ascending)
 * 
 * @example
 * compareStampDutyAcrossStates(5000000, ['Maharashtra', 'Karnataka', 'Delhi'], 'female')
 * // Returns sorted array with cheapest state first
 */
export function compareStampDutyAcrossStates(
    propertyValue: number,
    states: string[],
    gender: 'male' | 'female' | 'joint' = 'male'
): Array<StampDutyBreakdown & { state: string }> {
    const comparisons = states.map((state) => {
        const breakdown = calculateStampDutyBreakdown({
            propertyValue,
            state,
            gender,
            isUnderConstruction: false,
        });

        return {
            state,
            ...breakdown,
        };
    });

    // Sort by total transaction cost (cheapest first)
    return comparisons.sort(
        (a, b) => a.totalTransactionCost - b.totalTransactionCost
    );
}

/**
 * Calculate maximum property value affordable given budget for stamp duty
 * 
 * @param stampDutyBudget - Available budget for stamp duty in ₹
 * @param state - Indian state
 * @param gender - Gender for stamp duty calculation
 * @returns Maximum affordable property value in ₹
 * 
 * @example
 * // If you have ₹3L for stamp duty in Maharashtra (female - 5% rate)
 * calculateAffordablePropertyValue(300000, 'Maharashtra', 'female')
 * // Returns: 6000000 (₹60L property → ₹3L stamp duty)
 */
export function calculateAffordablePropertyValue(
    stampDutyBudget: number,
    state: string,
    gender: 'male' | 'female' | 'joint' = 'male'
): number {
    const stateRates = STAMP_DUTY_RATES[state];

    if (!stateRates) {
        // Default to 5% if state not found
        return Math.round(stampDutyBudget / 0.05);
    }

    let rate = stateRates.men;

    if (gender === 'female' && stateRates.women !== undefined) {
        rate = stateRates.women;
    } else if (gender === 'joint' && stateRates.women !== undefined) {
        rate = stateRates.women;
    }

    return Math.round(stampDutyBudget / rate);
}
