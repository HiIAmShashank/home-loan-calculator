import { describe, it, expect } from 'vitest'
import {
  calculateTaxNew,
  calculateTaxOld,
  calculate80C,
  calculate24b,
  calculate80EEA,
  calculateTaxSavings,
  calculateJointLoanBenefits,
} from '@/lib/calculations/tax'

// All expected figures hand-checked against FY2025-26 / AY2026-27 (Budget 2025)
// rules and reconciled with the live config in taxConfig.ts.

describe('calculateTaxNew (FY2025-26)', () => {
  it.each([
    // ₹8L: taxable ₹7.25L (after ₹75k std) is ≤₹12L, so the 87A rebate zeroes it.
    // (The ₹16,900 once noted in the Phase 1 retro was the pre-rebate slab+cess figure.)
    [800000, 0],
    [1200000, 0], // full rebate at the ₹12L taxable threshold
    [1275000, 0], // ₹75k std brings taxable to exactly ₹12L → still rebated
    [1280000, 63180], // taxable just over ₹12L → no rebate
    [1600000, 113100],
    [2400000, 292500],
    [3000000, 475800],
  ])('income ₹%d → tax ₹%d', (income, expected) => {
    expect(calculateTaxNew(income)).toBe(expected)
  })
})

describe('calculateTaxOld (FY2025-26)', () => {
  it('rebates fully at the ₹5L taxable threshold (₹5.5L gross, no deductions)', () => {
    expect(calculateTaxOld(550000)).toBe(0)
  })

  it('is positive just above the threshold (₹5.6L gross)', () => {
    expect(calculateTaxOld(560000)).toBeGreaterThan(0)
  })

  it('is unchanged from the FY2024-25 anchor where the old regime did not change', () => {
    expect(calculateTaxOld(1200000, 200000, 'FY2025-26')).toBe(
      calculateTaxOld(1200000, 200000, 'FY2024-25'),
    )
  })
})

describe('calculate80C / calculate24b', () => {
  it('caps 80C at ₹1.5L', () => {
    expect(calculate80C(200000).deduction).toBe(150000)
  })

  it('caps self-occupied 24(b) at ₹2L but is unlimited when let out', () => {
    expect(calculate24b(300000, false)).toBe(200000)
    expect(calculate24b(300000, true)).toBe(300000)
  })
})

describe('calculate80EEA (sanction-date gated)', () => {
  it('grants the deduction in-window, net of 24(b) already used', () => {
    // ₹3L interest − ₹2L claimed under 24(b) = ₹1L remaining, under the ₹1.5L cap
    expect(calculate80EEA(true, 4000000, 300000, 200000, '2020-06-15')).toBe(100000)
  })

  it('treats both window boundaries as inclusive', () => {
    expect(calculate80EEA(true, 4000000, 300000, 0, '2019-04-01')).toBe(150000)
    expect(calculate80EEA(true, 4000000, 300000, 0, '2022-03-31')).toBe(150000)
  })

  it('returns 0 outside the window', () => {
    expect(calculate80EEA(true, 4000000, 300000, 0, '2019-03-31')).toBe(0)
    expect(calculate80EEA(true, 4000000, 300000, 0, '2022-04-01')).toBe(0)
  })

  it('defaults OFF (no date), and gates on first-time + property ≤₹45L', () => {
    expect(calculate80EEA(true, 4000000, 300000, 0)).toBe(0)
    expect(calculate80EEA(false, 4000000, 300000, 0, '2020-06-15')).toBe(0)
    expect(calculate80EEA(true, 5000000, 300000, 0, '2020-06-15')).toBe(0)
  })
})

describe('calculateTaxSavings', () => {
  it('reports the new-regime liability equal to calculateTaxNew', () => {
    const breakdown = calculateTaxSavings({
      annualIncome: 1500000,
      principalPaid: 150000,
      interestPaid: 300000,
      isFirstTimeBuyer: false,
      propertyValue: 4000000,
      isJointLoan: false,
    })
    expect(breakdown.taxNewRegime).toBe(calculateTaxNew(1500000))
  })

  it('returns effectiveTaxRate 0 (not NaN) at zero income', () => {
    const breakdown = calculateTaxSavings({
      annualIncome: 0,
      principalPaid: 0,
      interestPaid: 0,
      isFirstTimeBuyer: false,
      propertyValue: 0,
      isJointLoan: false,
    })
    expect(breakdown.effectiveTaxRate).toBe(0)
    expect(Number.isNaN(breakdown.effectiveTaxRate)).toBe(false)
  })
})

describe('calculateJointLoanBenefits (T5 split regression)', () => {
  it('applies a 50-50 ownership split symmetrically to both borrowers', () => {
    const result = calculateJointLoanBenefits(1500000, 1500000, 300000, 400000, 0.5, false, 4000000)
    expect(result.primarySavings).toBe(result.coSavings)
    expect(result.totalSavings).toBe(result.primarySavings + result.coSavings)
    // each borrower claims half the principal (₹1.5L → capped at ₹1.5L) + half the interest (₹2L → ₹2L)
    expect(result.combinedDeduction).toBe(700000)
  })
})
