/**
 * Type definitions for Home Loan Calculator
 */

// ============================================================================
// LOAN TYPES
// ============================================================================

export type LoanType = 'floating' | 'fixed' | 'hybrid';
export type Gender = 'male' | 'female';
export type TaxRegime = 'old' | 'new';
export type PrepaymentFrequency = 'monthly' | 'yearly';
export type PMAYCategory = 'EWS' | 'LIG' | 'MIG1' | 'MIG2';
export type FOIRLevel = 'conservative' | 'moderate' | 'aggressive';

// ============================================================================
// CORE LOAN INPUTS
// ============================================================================

export interface LoanInputs {
    propertyValue: number;
    downPayment: number;
    loanAmount: number; // Principal loan amount
    loanTenure: number; // Years
    interestRate: number; // % per annum
    loanType: LoanType;
    processingFee?: number;
    prepaymentOption?: PrepaymentOption;
}

export interface PrepaymentOption {
    enabled: boolean;
    amount: number;
    frequency: PrepaymentFrequency;
    startMonth?: number;
}

// ============================================================================
// PROPERTY DETAILS
// ============================================================================

export interface PropertyDetails {
    value: number;
    state: string;
    city: string;
    carpetArea: number; // sq ft
    isUnderConstruction: boolean;
    constructionToLandRatio?: number; // For GST calculation
    buyerGender: Gender;
}

// ============================================================================
// AMORTIZATION
// ============================================================================

export interface AmortizationRow {
    month: number;
    year: number;
    openingBalance: number;
    emi: number;
    interest: number;
    principal: number;
    closingBalance: number;
    cumulativeInterest: number;
    cumulativePrincipal: number;
}

export interface AmortizationSchedule {
    schedule: AmortizationRow[];
    totalInterest: number;
    totalPrincipal: number;
    totalAmount: number;
}

// ============================================================================
// TAX CALCULATIONS
// ============================================================================

export interface TaxInputs {
    annualIncome: number;
    taxRegime: TaxRegime;
    principalPaid: number;
    interestPaid: number;
    isFirstTimeBuyer: boolean;
    propertyValue: number;
    isJointLoan: boolean;
    coBorrowerIncome?: number;
    ownershipSplit?: number; // Percentage
    other80CInvestments?: number;
}

export interface DeductionResult {
    deduction: number;
    utilized: number;
}

export interface TaxDeductions {
    section80C: number;
    section24b: number;
    section80EEA: number;
    total: number;
}

export interface TaxBreakdown {
    deductions: TaxDeductions;
    taxWithoutLoan: number;
    taxWithLoan: number;
    savings: number;
    effectiveTaxRate: number;
    recommendedRegime: TaxRegime;
}

// ============================================================================
// COST BREAKDOWN
// ============================================================================

export interface OneTimeCosts {
    downPayment: number;
    stampDuty: number;
    registration: number;
    gst: number;
    processingFee: number;
    legalFees: number;
    propertyInsurance: number;
    brokerageFee?: number;
    interiorWork?: number;
    total: number;
}

export interface OngoingCosts {
    maintenancePerMonth: number;
    propertyTaxPerYear: number;
    waterCharges: number;
    totalPerYear: number;
    totalOverLife: number;
}

export interface TotalCosts {
    oneTimeCosts: OneTimeCosts;
    loanCosts: {
        totalInterest: number;
        totalEMIPaid: number;
        preEMIInterest?: number;
    };
    ongoingCosts: OngoingCosts;
    grandTotal: number;
    futurePropertyValue?: number;
    netCost?: number;
}

// ============================================================================
// STAMP DUTY & TRANSACTION COSTS
// ============================================================================

export interface StampDutyInputs {
    propertyValue: number;
    state: string;
    gender?: 'male' | 'female' | 'joint';
    isUnderConstruction?: boolean;
    constructionRatio?: number;
}

export interface StampDutyBreakdown {
    stampDuty: number;
    registrationFee: number;
    gst: number;
    totalTransactionCost: number;
    effectiveRate: number;
}

export interface PropertyCostBreakdown {
    propertyValue: number;
    stampDuty: number;
    registrationFee: number;
    gst: number;
    legalFees: number;
    otherFees: number;
    totalCost: number;
}

// ============================================================================
// PREPAYMENT ANALYSIS
// ============================================================================

export interface PrepaymentInputs {
    principal: number;
    annualRate: number;
    tenureYears: number;
    prepaymentType: PrepaymentFrequency | 'lump-sum';
    prepaymentAmount?: number;
    startMonth?: number;
    lumpSumPayments?: Array<{
        month: number;
        amount: number;
    }>;
    reduceTenure: boolean;
}

export interface PrepaymentResult {
    newTenureMonths: number;
    newTenureYears: string;
    monthsSaved: number;
    yearsSaved: string;
    interestSaved: number;
    totalInterestPaid: number;
    totalExtraPaid: number;
    roi: number;
}

// Note: AffordabilityInputs and AffordabilityResult moved to end of file

// ============================================================================
// RENT VS BUY ANALYSIS
// ============================================================================

export interface RentVsBuyInputs {
    // Buy option
    propertyValue: number;
    downPayment: number;
    loanTenure: number;
    interestRate: number;
    stampDutyRate: number;
    maintenanceCost: number;
    propertyAppreciation: number; // % per year

    // Rent option
    monthlyRent: number;
    rentEscalation: number; // % per year

    // Investment alternative
    investmentReturn: number; // % per year

    // Analysis parameters
    analysisYears: number;
}

export interface BuyAnalysis {
    upfrontCosts: number;
    monthlyOutflow: number;
    totalCashOutflow: number;
    futurePropertyValue: number;
    outstandingLoan: number;
    netEquity: number;
    netPosition: number;
}

export interface RentAnalysis {
    totalRentPaid: number;
    investmentCorpus: number;
    netPosition: number;
    monthlyRent: number;
}

export interface RentVsBuyResult {
    buyAnalysis: BuyAnalysis;
    rentAnalysis: RentAnalysis;
    breakEvenYear: number;
    recommendation: 'buy' | 'rent';
    difference: number;
}

// ============================================================================
// PMAY SUBSIDY
// ============================================================================

export interface PMAYInputs {
    annualIncome: number;
    loanAmount: number;
    propertyValue: number;
    interestRate: number;
    tenureYears: number;
    isFirstTime: boolean;
}

export interface PMAYCriteria {
    minIncome: number;
    maxIncome: number;
    maxPropertyValue: number;
    subsidyRate: number;
    maxLoanForSubsidy: number;
    maxCarpetArea: number;
}

export interface PMAYResult {
    eligible: boolean;
    reason?: string;
    category: PMAYCategory | 'INELIGIBLE';
    subsidyNPV: number;
    effectiveRate: number;
    savingsPerMonth: number;
    maxLoanForSubsidy: number;
    subsidyRate: number;
    eligibleLoan: number;
    totalSavings: number;
}

// ============================================================================
// BALANCE TRANSFER
// ============================================================================

export interface BalanceTransferInputs {
    currentOutstanding: number;
    currentInterestRate: number;
    currentTenureRemaining: number;
    currentEMI: number;
    newInterestRate: number;
    newTenure?: number;
    processingFee: number;
    legalCharges: number;
    foreclosureCharges: number;
    stampDutyOnTransfer: number;
    topUpLoan?: number;
    keepSameEMI?: boolean;
}

export interface BalanceTransferAnalysis {
    currentLoan: {
        outstanding: number;
        emi: number;
        tenure: number;
        totalInterest: number;
        totalPayment: number;
    };
    newLoan: {
        amount: number;
        emi: number;
        tenure: number;
        totalInterest: number;
        totalPayment: number;
    };
    costs: {
        processingFee: number;
        legalCharges: number;
        foreclosureCharges: number;
        stampDutyOnTransfer: number;
        total: number;
    };
    savings: {
        grossSavings: number;
        netSavings: number;
        monthlySaving: number;
        breakEvenMonths: number;
    };
    recommendation: boolean;
}

// ============================================================================
// FLOATING RATE SCENARIOS
// ============================================================================

export interface RateChange {
    fromMonth: number;
    newRate: number;
}

export interface FloatingRateScenario {
    baseRate: number;
    rateChangeFrequency: 'monthly' | 'quarterly' | 'yearly';
    scenarios: {
        optimistic: RateChange[];
        realistic: RateChange[];
        pessimistic: RateChange[];
    };
}

export interface FloatingRateResult {
    schedule: AmortizationRow[];
    totalInterest: number;
    totalAmount: number;
    averageRate: number;
}

// ============================================================================
// SCENARIO COMPARISON
// ============================================================================

export interface Scenario {
    id: string;
    name: string;
    inputs: LoanInputs;
    results: CalculationResults;
}

export interface CalculationResults {
    emi: number;
    totalInterest: number;
    totalAmount: number;
    totalCost?: number;
    taxSavings?: number;
    effectiveRate?: number;
}

export interface ComparisonView {
    scenarios: Scenario[];
    comparisonMetrics: string[];
    bestScenario?: string;
    worstScenario?: string;
    recommendation?: string;
}

// ============================================================================
// CHART DATA
// ============================================================================

export interface ChartDataPoint {
    label: string;
    value: number;
    category?: string;
}

export interface TimeSeriesDataPoint {
    month: number;
    year: number;
    [key: string]: number;
}

// ============================================================================
// VALIDATION ERRORS
// ============================================================================

export interface ValidationError {
    field: string;
    message: string;
}

export interface FormState {
    isValid: boolean;
    errors: ValidationError[];
    isDirty: boolean;
}

// ============================================================================
// AFFORDABILITY CALCULATOR
// ============================================================================

export interface AffordabilityInputs {
    monthlyIncome: number;
    coApplicantIncome?: number;
    existingEMIs?: number;
    otherObligations?: number; // Credit cards, personal loans, etc.
    downPaymentAvailable: number;
    interestRate: number;
    tenureYears: number;
    foirPercentage?: number; // Fixed Obligation to Income Ratio (default 50%)
}

export interface MonthlyBreakdown {
    grossIncome: number;
    maxEMI: number;
    existingObligations: number;
    disposableIncome: number;
}

export interface AffordabilityResult {
    maxAffordableEMI: number;
    maxLoanAmount: number;
    maxPropertyValue: number;
    downPaymentRequired: number;
    ltvRatio: number;
    monthlyBreakdown: MonthlyBreakdown;
    rbiCompliant?: boolean;
    recommendations: string[];
}
