/**
 * Constants for Home Loan Calculator
 *
 * Year-agnostic rates and limits. Financial-year-specific income-tax rules
 * (slabs, standard deduction, 87A rebate, cess) live in src/lib/taxConfig.ts.
 *
 * PMAY scheme parameters are versioned by scheme in src/lib/pmayConfig.ts.
 */

// ============================================================================
// STAMP DUTY RATES (STATE-WISE)
// ============================================================================

export const STAMP_DUTY_RATES: Record<string, { men: number; women: number }> = {
    Maharashtra: { men: 0.06, women: 0.04 }, // Note: Mumbai may have additional metro cess - verify locally
    Karnataka: { men: 0.056, women: 0.056 },
    Delhi: { men: 0.06, women: 0.04 },
    TamilNadu: { men: 0.07, women: 0.07 },
    Telangana: { men: 0.045, women: 0.045 },
    Gujarat: { men: 0.049, women: 0.049 },
    UttarPradesh: { men: 0.07, women: 0.06 },
    WestBengal: { men: 0.065, women: 0.055 },
    Rajasthan: { men: 0.06, women: 0.055 },
    MadhyaPradesh: { men: 0.075, women: 0.075 },
    Haryana: { men: 0.07, women: 0.05 },
    Punjab: { men: 0.07, women: 0.07 },
    Kerala: { men: 0.08, women: 0.07 },
    AndhraPradesh: { men: 0.05, women: 0.05 },
    Odisha: { men: 0.06, women: 0.06 },
    Jharkhand: { men: 0.06, women: 0.06 },
    Chhattisgarh: { men: 0.05, women: 0.05 },
    Assam: { men: 0.075, women: 0.075 },
    Bihar: { men: 0.06, women: 0.06 },
    Uttarakhand: { men: 0.05, women: 0.05 },
    HimachalPradesh: { men: 0.06, women: 0.06 },
    Goa: { men: 0.05, women: 0.05 },
};

// ============================================================================
// REGISTRATION FEES (STATE-WISE)
// ============================================================================

export const REGISTRATION_FEES: Record<string, { rate: number; cap: number }> = {
    Maharashtra: { rate: 0.01, cap: 30000 },
    Karnataka: { rate: 0.01, cap: 100000 },
    Delhi: { rate: 0.01, cap: 25000 },
    TamilNadu: { rate: 0.01, cap: 100000 },
    Telangana: { rate: 0.005, cap: 50000 },
    Gujarat: { rate: 0.01, cap: 30000 },
    UttarPradesh: { rate: 0.01, cap: 50000 },
    WestBengal: { rate: 0.01, cap: 50000 },
    // Default for other states
    default: { rate: 0.01, cap: 30000 },
};

// ============================================================================
// GST RATES
// ============================================================================

export const GST_RATE = 0.05; // 5% on construction value for under-construction properties
export const DEFAULT_CONSTRUCTION_RATIO = 0.7; // 70% construction, 30% land

// ============================================================================
// TAX SLABS, STANDARD DEDUCTION, 87A REBATE & CESS
// ============================================================================
// Year-specific income-tax rules live in the FY-keyed tax config
// (src/lib/taxConfig.ts) so an annual Budget change is a data edit, not code
// surgery. Only year-agnostic deduction caps remain here.

// ============================================================================
// TAX DEDUCTION LIMITS
// ============================================================================

export const SECTION_80C_LIMIT = 150000; // ₹1.5 lakh
export const SECTION_24B_LIMIT_SELF_OCCUPIED = 200000; // ₹2 lakh
export const SECTION_24B_LIMIT_LET_OUT = Infinity; // No limit
export const SECTION_80EEA_LIMIT = 150000; // ₹1.5 lakh additional for first-time buyers
export const SECTION_80EEA_PROPERTY_VALUE_LIMIT = 4500000; // ₹45 lakh
// 80EEA is available ONLY for loans sanctioned within this window (inclusive).
// Not available for any loan sanctioned after 31 Mar 2022. ISO dates (YYYY-MM-DD).
export const SECTION_80EEA_SANCTION_START = '2019-04-01';
export const SECTION_80EEA_SANCTION_END = '2022-03-31';

// ============================================================================
// LTV (Loan-to-Value) LIMITS - RBI NORMS
// ============================================================================

export const LTV_LIMITS = [
    { maxPropertyValue: 3000000, ltvRatio: 0.90 }, // Up to ₹30 lakh: 90%
    { maxPropertyValue: 7500000, ltvRatio: 0.80 }, // ₹30-75 lakh: 80%
    { maxPropertyValue: Infinity, ltvRatio: 0.75 }, // Above ₹75 lakh: 75%
];

// ============================================================================
// FOIR (Fixed Obligation to Income Ratio)
// ============================================================================

export const FOIR_CONSERVATIVE = 0.50; // 50%
export const FOIR_AGGRESSIVE = 0.60; // 60%

// ============================================================================
// PROPERTY TAX RATES (CITY-WISE)
// ============================================================================

export const PROPERTY_TAX_RATES: Record<string, number> = {
    Mumbai: 6, // ₹ per sq ft per year
    Delhi: 4,
    Bangalore: 3,
    Chennai: 3,
    Hyderabad: 2.5,
    Pune: 3,
    Kolkata: 3,
    Ahmedabad: 2.5,
    Jaipur: 2,
    Lucknow: 2,
    Chandigarh: 3,
    Indore: 2,
    Bhopal: 2,
    Kochi: 3,
    Coimbatore: 2.5,
    // Default for other cities
    default: 3,
};

// ============================================================================
// MAINTENANCE COSTS (TYPICAL RANGES)
// ============================================================================

export const MAINTENANCE_RATE_LOW = 2; // ₹ per sq ft per month
export const MAINTENANCE_RATE_MEDIUM = 5;
export const MAINTENANCE_RATE_HIGH = 10;
export const MAINTENANCE_RATE_DEFAULT = 5;

// ============================================================================
// TYPICAL BANK INTEREST RATES (INDICATIVE)
// ============================================================================

export const BANK_INTEREST_RATES = {
    SBI: { min: 8.5, max: 9.65 },
    HDFC: { min: 8.75, max: 9.5 },
    ICICI: { min: 8.75, max: 9.55 },
    AxisBank: { min: 8.75, max: 9.65 },
    KotakMahindra: { min: 8.7, max: 9.4 },
    PNB: { min: 8.5, max: 9.6 },
    BankOfBaroda: { min: 8.4, max: 9.5 },
    CanaraBank: { min: 8.5, max: 9.6 },
    LICHousing: { min: 8.5, max: 9.55 },
    IndiabullsHousing: { min: 9.0, max: 9.75 },
};

// ============================================================================
// TYPICAL FEES & CHARGES
// ============================================================================

export const PROCESSING_FEE_RANGE = { min: 0.0025, max: 0.01 }; // 0.25% - 1%
export const LEGAL_FEES_TYPICAL = 15000; // ₹15,000
export const VALUATION_CHARGES_TYPICAL = 5000; // ₹5,000
export const PROPERTY_INSURANCE_ANNUAL = 5000; // ₹5,000/year

// ============================================================================
// APPRECIATION & INFLATION RATES (TYPICAL)
// ============================================================================

export const PROPERTY_APPRECIATION_RATE = 0.05; // 5% per year
export const RENT_ESCALATION_RATE = 0.05; // 5% per year
export const INFLATION_RATE = 0.06; // 6% per year
export const INVESTMENT_RETURN_RATE = 0.10; // 10% per year (equity/mutual funds)

// ============================================================================
// VALIDATION LIMITS
// ============================================================================

export const VALIDATION_LIMITS = {
    propertyValue: { min: 100000, max: 100000000 }, // ₹1L - ₹10Cr
    downPayment: { min: 0, max: 100000000 },
    loanTenure: { min: 1, max: 30 }, // Years
    interestRate: { min: 1, max: 20 }, // %
    annualIncome: { min: 0, max: 100000000 },
    carpetArea: { min: 100, max: 10000 }, // sq ft
};

// ============================================================================
// UI DISPLAY CONSTANTS
// ============================================================================

export const CURRENCY_SYMBOL = '₹';
export const LAKH = 100000;
export const CRORE = 10000000;

// ============================================================================
// INDIAN STATES (FOR DROPDOWNS)
// ============================================================================

export const INDIAN_STATES = [
    'Maharashtra',
    'Karnataka',
    'Delhi',
    'TamilNadu',
    'Telangana',
    'Gujarat',
    'UttarPradesh',
    'WestBengal',
    'Rajasthan',
    'MadhyaPradesh',
    'Haryana',
    'Punjab',
    'Kerala',
    'AndhraPradesh',
    'Odisha',
    'Jharkhand',
    'Chhattisgarh',
    'Assam',
    'Bihar',
    'Uttarakhand',
    'HimachalPradesh',
    'Goa',
];

// ============================================================================
// MAJOR CITIES (FOR DROPDOWNS)
// ============================================================================

export const MAJOR_CITIES = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Hyderabad',
    'Pune',
    'Kolkata',
    'Ahmedabad',
    'Jaipur',
    'Lucknow',
    'Chandigarh',
    'Indore',
    'Bhopal',
    'Kochi',
    'Coimbatore',
];
