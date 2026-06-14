/**
 * Rent vs Buy Analysis Module
 *
 * Compares buying a home (mortgage + maintenance, building equity in an
 * appreciating asset) against renting and investing the money that buying would
 * have tied up. All functions are pure with no side effects.
 *
 * The result swings hard on the appreciation-vs-investment-return assumptions, so
 * the maths is kept deliberately explicit and the inputs are surfaced in the UI.
 */

import type {
    RentVsBuyInputs,
    BuyAnalysis,
    RentAnalysis,
    RentVsBuyResult,
} from '../types';
import { calculateEMI, calculateOutstanding } from './emi';

const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Build the buy- and rent-side positions for a given analysis horizon (years).
 *
 * Buy side: the buyer pays the upfront (down payment + stamp duty), then the EMI
 * (until the loan ends) plus maintenance for the whole horizon; their asset is the
 * appreciated property net of the loan still outstanding at the horizon.
 *
 * Rent side (opportunity cost): the renter invests the buyer's upfront and, each
 * year, any surplus from buying costing more than renting, compounding at the
 * investment return; their cost is the escalated rent paid over the horizon.
 */
function analyseAtHorizon(
    inputs: RentVsBuyInputs,
    years: number
): { buy: BuyAnalysis; rent: RentAnalysis } {
    const {
        propertyValue,
        downPayment,
        loanTenure,
        interestRate,
        stampDutyRate,
        maintenanceCost,
        propertyAppreciation,
        monthlyRent,
        rentEscalation,
        investmentReturn,
    } = inputs;

    const loanAmount = propertyValue - downPayment;
    const stampDuty = Math.round(propertyValue * (stampDutyRate / 100));
    const upfrontCosts = downPayment + stampDuty;

    const emi = calculateEMI(loanAmount, interestRate, loanTenure);
    const monthlyOutflow = round2(emi + maintenanceCost);

    // The EMI runs only until the loan matures; maintenance runs the full horizon.
    const emiMonths = Math.min(loanTenure, years) * 12;
    const totalEMIPaid = emi * emiMonths;
    const totalMaintenance = maintenanceCost * years * 12;
    const totalCashOutflow = round2(upfrontCosts + totalEMIPaid + totalMaintenance);

    const futurePropertyValue = round2(
        propertyValue * Math.pow(1 + propertyAppreciation / 100, years)
    );
    const outstandingLoan = round2(
        calculateOutstanding(loanAmount, interestRate, loanTenure, years * 12)
    );
    const netEquity = round2(futurePropertyValue - outstandingLoan);

    const buy: BuyAnalysis = {
        upfrontCosts,
        monthlyOutflow,
        totalCashOutflow,
        futurePropertyValue,
        outstandingLoan,
        netEquity,
        netPosition: round2(netEquity - totalCashOutflow),
    };

    // Rent side — escalate yearly and accumulate the opportunity-cost corpus.
    const annualBuyMaintenance = maintenanceCost * 12;
    const annualEMI = emi * 12;
    let corpus = upfrontCosts;
    let totalRentPaid = 0;

    for (let y = 1; y <= years; y++) {
        // Grow the existing corpus for the year, then invest this year's surplus.
        corpus *= 1 + investmentReturn / 100;

        const annualRent = monthlyRent * 12 * Math.pow(1 + rentEscalation / 100, y - 1);
        totalRentPaid += annualRent;

        const annualBuyOutflow = (y <= loanTenure ? annualEMI : 0) + annualBuyMaintenance;
        const surplus = annualBuyOutflow - annualRent;
        if (surplus > 0) {
            corpus += surplus;
        }
    }

    const investmentCorpus = round2(corpus);
    const rent: RentAnalysis = {
        totalRentPaid: round2(totalRentPaid),
        investmentCorpus,
        netPosition: round2(investmentCorpus - round2(totalRentPaid)),
        monthlyRent,
    };

    return { buy, rent };
}

/**
 * Analyse a rent-vs-buy decision over the chosen horizon.
 *
 * Returns both net positions, the break-even year (the first year buying's net
 * position catches up to renting's — 0 if it never does within the horizon), a
 * 'buy' | 'rent' recommendation, and the signed difference (buy − rent).
 *
 * @param inputs - Property, loan, rent, and investment assumptions
 * @returns Side-by-side buy/rent analysis with a recommendation
 */
export function calculateRentVsBuy(inputs: RentVsBuyInputs): RentVsBuyResult {
    const { buy, rent } = analyseAtHorizon(inputs, inputs.analysisYears);

    // Break-even: the first year buying's net position reaches renting's.
    let breakEvenYear = 0;
    for (let y = 1; y <= inputs.analysisYears; y++) {
        const yearly = analyseAtHorizon(inputs, y);
        if (yearly.buy.netPosition >= yearly.rent.netPosition) {
            breakEvenYear = y;
            break;
        }
    }

    const difference = round2(buy.netPosition - rent.netPosition);

    return {
        buyAnalysis: buy,
        rentAnalysis: rent,
        breakEvenYear,
        recommendation: difference >= 0 ? 'buy' : 'rent',
        difference,
    };
}
