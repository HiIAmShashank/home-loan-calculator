import { describe, it, expect } from 'vitest'
import { calculateBalanceTransfer } from '@/lib/calculations/balanceTransfer'
import { calculateEMI } from '@/lib/calculations/emi'
import type { BalanceTransferInputs } from '@/lib/types'

const OUTSTANDING = 5000000
const CURRENT_EMI = calculateEMI(OUTSTANDING, 9.5, 15)

const base: BalanceTransferInputs = {
  currentOutstanding: OUTSTANDING,
  currentInterestRate: 9.5,
  currentTenureRemaining: 15,
  currentEMI: CURRENT_EMI,
  newInterestRate: 8.0,
  newTenure: 15,
  processingFee: 10000,
  legalCharges: 5000,
  foreclosureCharges: 0,
  stampDutyOnTransfer: 0,
}

describe('calculateBalanceTransfer', () => {
  it('recommends a clearly beneficial switch (big rate drop, low costs)', () => {
    const r = calculateBalanceTransfer(base)

    expect(r.newLoan.amount).toBe(OUTSTANDING)
    expect(r.newLoan.emi).toBeLessThan(CURRENT_EMI)
    expect(r.savings.monthlySaving).toBeGreaterThan(0)
    expect(r.savings.grossSavings).toBeGreaterThan(0)
    expect(r.savings.netSavings).toBeGreaterThan(0)
    expect(r.savings.breakEvenMonths).toBeLessThanOrEqual(r.currentLoan.tenure)
    expect(r.recommendation).toBe(true)
  })

  it('does not recommend a switch whose costs exceed the savings', () => {
    const r = calculateBalanceTransfer({
      ...base,
      newInterestRate: 9.4, // tiny drop ⇒ small gross saving
      processingFee: 600000, // dwarfs the interest saved
    })

    expect(r.savings.grossSavings).toBeGreaterThan(0) // a saving exists…
    expect(r.savings.netSavings).toBeLessThan(0) // …but it is wiped out by costs
    expect(r.recommendation).toBe(false)
  })

  it('keepSameEMI holds the instalment fixed and shortens the tenure', () => {
    const r = calculateBalanceTransfer({ ...base, keepSameEMI: true, newTenure: undefined })

    expect(r.newLoan.emi).toBe(CURRENT_EMI) // same monthly outflow
    expect(r.newLoan.tenure).toBeLessThan(r.currentLoan.tenure) // but finishes sooner
    expect(r.savings.monthlySaving).toBe(0) // no monthly cash saving
    expect(r.savings.breakEvenMonths).toBe(Infinity) // break-even is not a monthly-cash concept here
    expect(r.savings.grossSavings).toBeGreaterThan(0) // benefit is interest/tenure reduction
    expect(r.recommendation).toBe(true) // recommended on positive net savings alone
  })

  it('topUpLoan increases the new principal and its EMI', () => {
    const withTopUp = calculateBalanceTransfer({ ...base, topUpLoan: 1000000 })
    const without = calculateBalanceTransfer(base)

    expect(withTopUp.newLoan.amount).toBe(OUTSTANDING + 1000000)
    expect(without.newLoan.amount).toBe(OUTSTANDING)
    expect(withTopUp.newLoan.emi).toBeGreaterThan(without.newLoan.emi)
  })

  it('break-even months is costs ÷ monthly saving, rounded up', () => {
    const r = calculateBalanceTransfer(base)
    const { total } = r.costs
    const ms = r.savings.monthlySaving

    expect(total).toBe(15000) // 10000 + 5000 + 0 + 0
    expect(ms).toBeGreaterThan(0)
    expect(r.savings.breakEvenMonths).toBe(Math.ceil(total / ms))
    // the ceil boundary: one month short does not cover the costs; the chosen month does
    expect((r.savings.breakEvenMonths - 1) * ms).toBeLessThan(total)
    expect(r.savings.breakEvenMonths * ms).toBeGreaterThanOrEqual(total)
  })

  it('does not throw and reports an unserviceable switch when the EMI cannot cover the new rate', () => {
    // Keeping a ₹52,206 EMI against ₹50L at 15% can never amortise (monthly
    // interest alone is ₹62,500), so the solved tenure is infinite.
    const r = calculateBalanceTransfer({ ...base, keepSameEMI: true, newInterestRate: 15 })

    expect(Number.isFinite(r.newLoan.tenure)).toBe(false)
    expect(r.recommendation).toBe(false)
    expect(r.savings.netSavings).toBeLessThan(0)
  })

  it('sums the four switching costs into costs.total', () => {
    const r = calculateBalanceTransfer({
      ...base,
      processingFee: 12000,
      legalCharges: 4000,
      foreclosureCharges: 8000,
      stampDutyOnTransfer: 3000,
    })
    expect(r.costs.total).toBe(12000 + 4000 + 8000 + 3000)
  })
})
