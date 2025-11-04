/**
 * EMI Calculation Module
 * 
 * Core formulas for Indian home loan EMI calculations
 * All functions are pure with no side effects
 */

/**
 * Calculate monthly EMI (Equated Monthly Installment)
 * 
 * Formula: EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]
 * Where:
 *   P = Principal loan amount
 *   R = Monthly interest rate (annual rate / 12 / 100)
 *   N = Total number of monthly payments (tenure in years × 12)
 * 
 * @param principal - Loan amount in rupees
 * @param annualRate - Annual interest rate in percentage (e.g., 9 for 9%)
 * @param tenureYears - Loan tenure in years
 * @returns Monthly EMI amount in rupees
 * 
 * @example
 * calculateEMI(6400000, 9, 20) // Returns 57562
 */
export function calculateEMI(
    principal: number,
    annualRate: number,
    tenureYears: number
): number {
    // Validate inputs
    if (!isFinite(principal) || !isFinite(annualRate) || !isFinite(tenureYears)) {
        throw new Error('Invalid input: All parameters must be finite numbers');
    }

    // Handle edge cases
    if (principal <= 0 || tenureYears <= 0) return 0;
    if (annualRate < 0) {
        throw new Error('Invalid input: Interest rate cannot be negative');
    }
    if (tenureYears > 50) {
        throw new Error('Invalid input: Loan tenure cannot exceed 50 years');
    }

    // Convert annual rate to monthly rate
    const monthlyRate = annualRate / 12 / 100;
    const numPayments = tenureYears * 12;

    // Special case: 0% interest
    if (monthlyRate === 0) {
        return principal / numPayments;
    }

    // EMI formula
    const multiplier = Math.pow(1 + monthlyRate, numPayments);
    const emi = (principal * monthlyRate * multiplier) / (multiplier - 1);

    return Math.round(emi);
}

/**
 * Calculate total interest payable over loan tenure
 * 
 * Formula: Total Interest = (EMI × N) - P
 * 
 * @param principal - Loan amount in rupees
 * @param annualRate - Annual interest rate in percentage
 * @param tenureYears - Loan tenure in years
 * @returns Total interest amount in rupees
 * 
 * @example
 * calculateTotalInterest(6400000, 9, 20) // Returns 7414880
 */
export function calculateTotalInterest(
    principal: number,
    annualRate: number,
    tenureYears: number
): number {
    const emi = calculateEMI(principal, annualRate, tenureYears);
    const numPayments = tenureYears * 12;
    const totalAmount = emi * numPayments;

    return Math.round(totalAmount - principal);
}

/**
 * Calculate total amount payable (principal + interest)
 * 
 * @param principal - Loan amount in rupees
 * @param annualRate - Annual interest rate in percentage
 * @param tenureYears - Loan tenure in years
 * @returns Total amount payable in rupees
 */
export function calculateTotalAmount(
    principal: number,
    annualRate: number,
    tenureYears: number
): number {
    const emi = calculateEMI(principal, annualRate, tenureYears);
    const numPayments = tenureYears * 12;

    return Math.round(emi * numPayments);
}

/**
 * Calculate maximum loan amount based on EMI affordability
 * 
 * Reverse EMI formula to solve for P:
 * P = [EMI × ((1+R)^N - 1)] / [R × (1+R)^N]
 * 
 * @param emi - Affordable monthly EMI in rupees
 * @param annualRate - Annual interest rate in percentage
 * @param tenureYears - Loan tenure in years
 * @returns Maximum loan amount in rupees
 * 
 * @example
 * calculateLoanAmount(60000, 9, 20) // Returns ~6618000
 */
export function calculateLoanAmount(
    emi: number,
    annualRate: number,
    tenureYears: number
): number {
    // Validate inputs
    if (!isFinite(emi) || !isFinite(annualRate) || !isFinite(tenureYears)) {
        throw new Error('Invalid input: All parameters must be finite numbers');
    }

    if (emi <= 0 || tenureYears <= 0) return 0;
    if (annualRate < 0) {
        throw new Error('Invalid input: Interest rate cannot be negative');
    }

    const monthlyRate = annualRate / 12 / 100;
    const numPayments = tenureYears * 12;

    // Special case: 0% interest
    if (monthlyRate === 0) {
        return emi * numPayments;
    }

    // Reverse EMI formula
    const multiplier = Math.pow(1 + monthlyRate, numPayments);
    const principal = (emi * (multiplier - 1)) / (monthlyRate * multiplier);

    return Math.round(principal);
}

/**
 * Calculate loan tenure required for a given EMI and loan amount
 * 
 * Solve for N in EMI formula using logarithms:
 * N = log(EMI / (EMI - P×R)) / log(1 + R)
 * 
 * @param principal - Loan amount in rupees
 * @param emi - Monthly EMI amount in rupees
 * @param annualRate - Annual interest rate in percentage
 * @returns Number of months required to repay loan
 * 
 * @example
 * calculateTenure(5000000, 60000, 9) // Returns ~120 months (10 years)
 */
export function calculateTenure(
    principal: number,
    emi: number,
    annualRate: number
): number {
    // Validate inputs
    if (!isFinite(principal) || !isFinite(emi) || !isFinite(annualRate)) {
        throw new Error('Invalid input: All parameters must be finite numbers');
    }
    
    if (principal <= 0 || emi <= 0) return 0;
    if (annualRate < 0) {
        throw new Error('Invalid input: Interest rate cannot be negative');
    }

    const monthlyRate = annualRate / 12 / 100;

    // Special case: 0% interest
    if (monthlyRate === 0) {
        return Math.ceil(principal / emi);
    }

    // Check if EMI is sufficient
    const minEMI = principal * monthlyRate;
    if (emi <= minEMI) {
        // EMI too low, loan will never be paid off
        return Infinity;
    }

    // Calculate tenure using logarithm
    const numerator = Math.log(emi / (emi - principal * monthlyRate));
    const denominator = Math.log(1 + monthlyRate);
    const months = numerator / denominator;

    return Math.round(months);
}

/**
 * Calculate effective interest rate including processing fees
 * 
 * Processing fees increase the effective principal, thus increasing the effective rate
 * 
 * @param principal - Loan amount in rupees
 * @param annualRate - Stated annual interest rate in percentage
 * @param processingFee - One-time processing fee in rupees
 * @param tenureYears - Loan tenure in years
 * @returns Effective annual interest rate in percentage
 */
export function calculateEffectiveRate(
    principal: number,
    annualRate: number,
    processingFee: number,
    tenureYears: number
): number {
    // Net amount received after deducting processing fee
    const netPrincipal = principal - processingFee;

    // EMI is calculated on full principal
    const emi = calculateEMI(principal, annualRate, tenureYears);

    // Find rate that would give same EMI on net principal
    // Use iterative approximation (binary search)
    let low = 0;
    let high = 50; // Max 50% rate
    let effectiveRate = annualRate;

    for (let i = 0; i < 100; i++) {
        const mid = (low + high) / 2;
        const testEMI = calculateEMI(netPrincipal, mid, tenureYears);

        if (Math.abs(testEMI - emi) < 1) {
            effectiveRate = mid;
            break;
        }

        if (testEMI < emi) {
            low = mid;
        } else {
            high = mid;
        }
    }

    return Math.round(effectiveRate * 100) / 100;
}

/**
 * Calculate interest as percentage of principal
 * 
 * @param principal - Loan amount in rupees
 * @param annualRate - Annual interest rate in percentage
 * @param tenureYears - Loan tenure in years
 * @returns Interest as percentage of principal
 * 
 * @example
 * calculateInterestPercentage(6400000, 9, 20) // Returns 115.86 (115.86% of principal)
 */
export function calculateInterestPercentage(
    principal: number,
    annualRate: number,
    tenureYears: number
): number {
    const totalInterest = calculateTotalInterest(principal, annualRate, tenureYears);
    return (totalInterest / principal) * 100;
}

/**
 * Calculate how many years until interest drops below 50% of EMI
 * 
 * In early years, most of EMI goes to interest. This calculates when principal
 * component starts dominating.
 * 
 * @param principal - Loan amount in rupees
 * @param annualRate - Annual interest rate in percentage
 * @param tenureYears - Loan tenure in years
 * @returns Number of years until interest < 50% of EMI
 */
export function calculateInterestCrossoverYear(
    principal: number,
    annualRate: number,
    tenureYears: number
): number {
    const monthlyRate = annualRate / 12 / 100;
    const emi = calculateEMI(principal, annualRate, tenureYears);

    let balance = principal;

    for (let month = 1; month <= tenureYears * 12; month++) {
        const interest = balance * monthlyRate;
        const principalPaid = emi - interest;

        // Check if principal component > interest component
        if (principalPaid > interest) {
            return Math.ceil(month / 12);
        }

        balance -= principalPaid;
    }

    return tenureYears;
}

/**
 * Calculate outstanding principal after N months
 * 
 * Formula: Outstanding = P × [(1+R)^N - (1+R)^M] / [(1+R)^N - 1]
 * Where M = months elapsed
 * 
 * @param principal - Original loan amount in rupees
 * @param annualRate - Annual interest rate in percentage
 * @param tenureYears - Total loan tenure in years
 * @param monthsElapsed - Number of months elapsed
 * @returns Outstanding principal in rupees
 * 
 * @example
 * calculateOutstanding(5000000, 9, 20, 60) // Returns ~4435000 (after 5 years)
 */
export function calculateOutstanding(
    principal: number,
    annualRate: number,
    tenureYears: number,
    monthsElapsed: number
): number {
    if (monthsElapsed <= 0) return principal;
    if (monthsElapsed >= tenureYears * 12) return 0;

    const monthlyRate = annualRate / 12 / 100;
    const totalMonths = tenureYears * 12;

    // Special case: 0% interest
    if (monthlyRate === 0) {
        const emi = principal / totalMonths;
        return principal - (emi * monthsElapsed);
    }

    // Outstanding formula
    const multiplierTotal = Math.pow(1 + monthlyRate, totalMonths);
    const multiplierElapsed = Math.pow(1 + monthlyRate, monthsElapsed);

    const outstanding = principal * (multiplierTotal - multiplierElapsed) / (multiplierTotal - 1);

    return Math.round(outstanding);
}
