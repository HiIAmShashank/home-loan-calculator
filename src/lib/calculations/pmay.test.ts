import { describe, it, expect } from 'vitest'
import { calculatePMAYSubsidy } from '@/lib/calculations/pmay'
import type { PMAYInputs } from '@/lib/types'

const issBase: PMAYInputs = {
  annualIncome: 800000,
  loanAmount: 2500000,
  propertyValue: 3500000,
  interestRate: 9,
  tenureYears: 20,
  isFirstTime: true,
}

describe('calculatePMAYSubsidy — PMAY-U 2.0 ISS', () => {
  it('caps the subsidy NPV at ₹1.5L and subsidises only the first ₹8L', () => {
    const result = calculatePMAYSubsidy(issBase)
    expect(result.eligible).toBe(true)
    expect(result.category).toBe('MIG')
    expect(result.eligibleLoan).toBe(800000)
    expect(result.subsidyNPV).toBe(150000)
    expect(result.totalSavings).toBe(150000)
  })

  it('reconciles the capped monthly saving back to the NPV (PV at 8.5% over 12yr)', () => {
    const { savingsPerMonth, subsidyNPV } = calculatePMAYSubsidy(issBase)
    const monthlyDiscount = 0.085 / 12
    let pv = 0
    for (let m = 1; m <= 12 * 12; m++) pv += savingsPerMonth / Math.pow(1 + monthlyDiscount, m)
    expect(pv).toBeCloseTo(subsidyNPV, 0)
  })

  it('does not cap a small loan (capRatio 1 ⇒ effective rate = full 4pp reduction)', () => {
    const result = calculatePMAYSubsidy({
      ...issBase,
      annualIncome: 500000,
      loanAmount: 200000,
      propertyValue: 3000000,
    })
    expect(result.subsidyNPV).toBeLessThan(150000)
    expect(result.effectiveRate).toBeCloseTo(5, 5) // 9 − 4, since eligible slice == whole loan
  })

  it('is independent of tenure beyond the 12yr horizon (20yr == 25yr == 30yr)', () => {
    const at = (tenureYears: number) => calculatePMAYSubsidy({ ...issBase, tenureYears }).totalSavings
    expect(at(20)).toBe(at(25))
    expect(at(25)).toBe(at(30))
  })

  it.each([
    ['income above ₹9L', { annualIncome: 1000000 }],
    ['property above ₹35L', { propertyValue: 4000000 }],
    ['loan above ₹25L', { loanAmount: 3000000 }],
    ['not a first-time buyer', { isFirstTime: false }],
  ])('is ineligible when %s', (_label, override) => {
    expect(calculatePMAYSubsidy({ ...issBase, ...override }).eligible).toBe(false)
  })
})

describe('calculatePMAYSubsidy — CLSS pre-2022 (historical)', () => {
  it('applies a 6.5pp reduction (not 0.065pp) on the eligible slice', () => {
    // LIG, ₹6L loan fully eligible → effective rate = 9 − 6.5 = 2.5
    const result = calculatePMAYSubsidy(
      { annualIncome: 500000, loanAmount: 600000, propertyValue: 4000000, interestRate: 9, tenureYears: 20, isFirstTime: true },
      'CLSS-pre-2022',
    )
    expect(result.effectiveRate).toBeCloseTo(2.5, 5)
  })

  it('blends the subsidy across the whole loan (₹12L loan, MIG1 4pp on first ₹9L → eff 6%)', () => {
    const result = calculatePMAYSubsidy(
      { annualIncome: 1000000, loanAmount: 1200000, propertyValue: 4000000, interestRate: 9, tenureYears: 20, isFirstTime: true },
      'CLSS-pre-2022',
    )
    expect(result.effectiveRate).toBeCloseTo(6, 5) // 9 − 4 × (9/12)
  })

  it('routes income into EWS / LIG / MIG1 / MIG2 bands', () => {
    const cat = (annualIncome: number) =>
      calculatePMAYSubsidy(
        { annualIncome, loanAmount: 600000, propertyValue: 4000000, interestRate: 9, tenureYears: 20, isFirstTime: true },
        'CLSS-pre-2022',
      ).category
    expect([cat(200000), cat(500000), cat(1000000), cat(1500000)]).toEqual(['EWS', 'LIG', 'MIG1', 'MIG2'])
  })
})
