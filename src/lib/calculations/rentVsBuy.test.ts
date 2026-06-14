import { describe, it, expect } from 'vitest'
import { calculateRentVsBuy } from '@/lib/calculations/rentVsBuy'
import { calculateEMI } from '@/lib/calculations/emi'
import type { RentVsBuyInputs } from '@/lib/types'

const base: RentVsBuyInputs = {
  propertyValue: 8000000,
  downPayment: 1600000, // 20%
  loanTenure: 20,
  interestRate: 8.5,
  stampDutyRate: 6,
  maintenanceCost: 3000, // monthly
  propertyAppreciation: 7,
  monthlyRent: 25000,
  rentEscalation: 5,
  investmentReturn: 8,
  analysisYears: 15,
}

describe('calculateRentVsBuy', () => {
  it('derives upfront costs from the flat stamp-duty rate (not a state lookup)', () => {
    const r = calculateRentVsBuy(base)
    // stampDutyRate is a percentage of the property value, applied directly.
    const stampDuty = Math.round(base.propertyValue * (base.stampDutyRate / 100))
    expect(r.buyAnalysis.upfrontCosts).toBe(base.downPayment + stampDuty)
  })

  it('compounds the future property value at the appreciation rate', () => {
    const r = calculateRentVsBuy(base)
    const expected = base.propertyValue * Math.pow(1 + base.propertyAppreciation / 100, base.analysisYears)
    expect(r.buyAnalysis.futurePropertyValue).toBeCloseTo(expected, 0)
  })

  it('sums escalated rent as a geometric series', () => {
    const r = calculateRentVsBuy(base)
    const g = 1 + base.rentEscalation / 100
    // Σ_{y=0..N-1} monthlyRent*12*g^y
    const expected = base.monthlyRent * 12 * ((Math.pow(g, base.analysisYears) - 1) / (g - 1))
    expect(r.rentAnalysis.totalRentPaid).toBeCloseTo(expected, 0)
  })

  it('grows the renter corpus by pure compounding when buying never frees up surplus cash', () => {
    // Rent so high that the annual buy outflow is always cheaper ⇒ no surplus is
    // ever invested, so the corpus is just the upfront invested at the return rate.
    const r = calculateRentVsBuy({ ...base, monthlyRent: 200000 })
    const stampDuty = Math.round(base.propertyValue * (base.stampDutyRate / 100))
    const upfront = base.downPayment + stampDuty
    const expected = upfront * Math.pow(1 + base.investmentReturn / 100, base.analysisYears)
    expect(r.rentAnalysis.investmentCorpus).toBeCloseTo(expected, 0)
  })

  it('zeroes the outstanding loan when the horizon outlasts the loan tenure', () => {
    const r = calculateRentVsBuy({ ...base, loanTenure: 15, analysisYears: 20 })
    expect(r.buyAnalysis.outstandingLoan).toBe(0)
    // With nothing owed, equity is the full appreciated value.
    expect(r.buyAnalysis.netEquity).toBe(r.buyAnalysis.futurePropertyValue)
  })

  it('monthly outflow is the EMI plus maintenance', () => {
    const r = calculateRentVsBuy(base)
    const emi = calculateEMI(base.propertyValue - base.downPayment, base.interestRate, base.loanTenure)
    expect(r.buyAnalysis.monthlyOutflow).toBeCloseTo(emi + base.maintenanceCost, 0)
  })

  it('recommends BUY when appreciation is high and the investment return is low', () => {
    const r = calculateRentVsBuy({
      ...base,
      propertyAppreciation: 12,
      investmentReturn: 4,
      monthlyRent: 30000,
    })
    expect(r.recommendation).toBe('buy')
    expect(r.difference).toBeGreaterThan(0)
    expect(r.buyAnalysis.netPosition).toBeGreaterThanOrEqual(r.rentAnalysis.netPosition)
  })

  it('recommends RENT when the investment return beats a low appreciation and stamp duty is steep', () => {
    const r = calculateRentVsBuy({
      ...base,
      propertyAppreciation: 2,
      investmentReturn: 13,
      stampDutyRate: 8,
      monthlyRent: 18000,
    })
    expect(r.recommendation).toBe('rent')
    expect(r.difference).toBeLessThan(0)
    expect(r.rentAnalysis.netPosition).toBeGreaterThan(r.buyAnalysis.netPosition)
  })

  it('reports a break-even year inside the horizon for a buy-favourable case, and 0 when buying never overtakes', () => {
    const buyFavourable = calculateRentVsBuy({
      ...base,
      propertyAppreciation: 12,
      investmentReturn: 4,
      monthlyRent: 30000,
    })
    expect(buyFavourable.breakEvenYear).toBeGreaterThan(0)
    expect(buyFavourable.breakEvenYear).toBeLessThanOrEqual(base.analysisYears)

    const rentFavourable = calculateRentVsBuy({
      ...base,
      propertyAppreciation: 2,
      investmentReturn: 13,
      stampDutyRate: 8,
      monthlyRent: 18000,
    })
    // Buying never overtakes renting within the horizon ⇒ sentinel 0.
    expect(rentFavourable.breakEvenYear).toBe(0)
  })

  it('difference is buy minus rent net position and agrees with the recommendation', () => {
    const r = calculateRentVsBuy(base)
    expect(r.difference).toBeCloseTo(r.buyAnalysis.netPosition - r.rentAnalysis.netPosition, 0)
    expect(r.recommendation).toBe(r.difference >= 0 ? 'buy' : 'rent')
  })
})
