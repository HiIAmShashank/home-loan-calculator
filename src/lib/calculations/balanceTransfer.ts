/**
 * Balance Transfer (Loan Refinance) Calculation Module
 *
 * Compares an existing home loan against refinancing the outstanding balance
 * (optionally with a top-up) to a new lender at a different rate, netting off the
 * one-time switching costs. All functions are pure with no side effects.
 */

import type { BalanceTransferInputs, BalanceTransferAnalysis } from '../types';
import { calculateEMI, calculateTenure } from './emi';

const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Analyse a balance-transfer / refinance decision.
 *
 * Current loan: the user's actual remaining path is trusted as entered — the
 * stated EMI paid over the remaining tenure, so totalInterest = EMI×months −
 * outstanding.
 *
 * New loan: the outstanding (optionally + topUpLoan) at the new rate. Either the
 * requested newTenure is used (the EMI is solved for), or — when keepSameEMI is
 * set — the current EMI is held fixed and the tenure is solved for, so the saving
 * shows up as a shorter loan rather than a lower instalment.
 *
 * Savings: gross = interest saved (current − new); net = gross − switching costs;
 * monthlySaving = currentEMI − newEMI; breakEvenMonths = costs ÷ monthlySaving
 * (rounded up). When the EMI is kept the same there is no monthly cash saving, so
 * break-even is reported as Infinity and the recommendation rests on net savings.
 *
 * @param inputs - Current loan, new-loan terms, and switching costs
 * @returns Side-by-side comparison with costs, savings, and a recommendation flag
 */
export function calculateBalanceTransfer(
    inputs: BalanceTransferInputs
): BalanceTransferAnalysis {
    const {
        currentOutstanding,
        // currentInterestRate is intentionally unused: the current loan's path is
        // derived from the user's actual EMI over the remaining tenure, which the
        // stated rate would only redundantly reproduce.
        currentTenureRemaining,
        currentEMI,
        newInterestRate,
        newTenure,
        processingFee,
        legalCharges,
        foreclosureCharges,
        stampDutyOnTransfer,
        topUpLoan = 0,
        keepSameEMI = false,
    } = inputs;

    // Current loan — trust the user's actual instalment over the remaining tenure.
    const currentRemainingMonths = Math.round(currentTenureRemaining * 12);
    const currentTotalPayment = round2(currentEMI * currentRemainingMonths);
    const currentTotalInterest = round2(currentTotalPayment - currentOutstanding);

    const currentLoan = {
        outstanding: round2(currentOutstanding),
        emi: round2(currentEMI),
        tenure: currentRemainingMonths,
        totalInterest: currentTotalInterest,
        totalPayment: currentTotalPayment,
    };

    // New loan — refinance the outstanding, optionally topped up.
    const newAmount = currentOutstanding + topUpLoan;

    let newEMI: number;
    let newTenureMonths: number;

    if (keepSameEMI) {
        // Keep paying the same EMI on the cheaper rate ⇒ the loan finishes sooner.
        newEMI = currentEMI;
        newTenureMonths = calculateTenure(newAmount, currentEMI, newInterestRate);
    } else {
        // Use the requested new tenure (falling back to the current remaining one).
        const newTenureYears = newTenure ?? currentTenureRemaining;
        newTenureMonths = Math.round(newTenureYears * 12);
        newEMI = calculateEMI(newAmount, newInterestRate, newTenureYears);
    }

    const newTotalPayment = round2(newEMI * newTenureMonths);
    const newTotalInterest = round2(newTotalPayment - newAmount);

    const newLoan = {
        amount: round2(newAmount),
        emi: round2(newEMI),
        tenure: newTenureMonths,
        totalInterest: newTotalInterest,
        totalPayment: newTotalPayment,
    };

    // Switching costs.
    const costsTotal = processingFee + legalCharges + foreclosureCharges + stampDutyOnTransfer;
    const costs = {
        processingFee,
        legalCharges,
        foreclosureCharges,
        stampDutyOnTransfer,
        total: round2(costsTotal),
    };

    // Savings.
    const grossSavings = round2(currentTotalInterest - newTotalInterest);
    const netSavings = round2(grossSavings - costsTotal);
    const monthlySaving = round2(currentEMI - newEMI);
    const breakEvenMonths = monthlySaving > 0
        ? Math.ceil(costsTotal / monthlySaving)
        : Infinity;

    // Recommend when net savings are positive and — where the switch lowers the
    // EMI — the costs are recovered within the remaining tenure. When the EMI is
    // kept the same (no monthly saving), the recommendation rests on net savings.
    const recommendation = netSavings > 0
        && (monthlySaving > 0 ? breakEvenMonths <= currentRemainingMonths : true);

    return {
        currentLoan,
        newLoan,
        costs,
        savings: {
            grossSavings,
            netSavings,
            monthlySaving,
            breakEvenMonths,
        },
        recommendation,
    };
}
