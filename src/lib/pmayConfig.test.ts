import { describe, it, expect } from 'vitest'
import { getPMAYScheme, PMAY_SCHEMES, DEFAULT_PMAY_SCHEME } from '@/lib/pmayConfig'

describe('PMAY-U 2.0 ISS config (default)', () => {
  const iss = getPMAYScheme('PMAY-U-2.0-ISS')

  it('is the default scheme', () => {
    expect(DEFAULT_PMAY_SCHEME).toBe('PMAY-U-2.0-ISS')
  })

  it('subsidises 4pp on the first ₹8L over a 12yr horizon at an 8.5% discount', () => {
    expect(iss.bands.every(b => b.subsidyRatePoints === 4)).toBe(true)
    expect(iss.bands.every(b => b.maxLoanForSubsidy === 800000)).toBe(true)
    expect(iss.subsidyTenureCap).toBe(12)
    expect(iss.discountRate).toBe(0.085)
  })

  it('caps the subsidy NPV at ₹1.5L with hard gates house ≤₹35L, loan ≤₹25L', () => {
    expect(iss.maxSubsidyNPV).toBe(150000)
    expect(iss.maxPropertyValue).toBe(3500000)
    expect(iss.maxLoanForScheme).toBe(2500000)
  })

  it('routes income bands EWS ≤₹3L, LIG ≤₹6L, MIG ≤₹9L', () => {
    expect(iss.bands.map(b => [b.category, b.maxIncome])).toEqual([
      ['EWS', 300000],
      ['LIG', 600000],
      ['MIG', 900000],
    ])
  })
})

describe('CLSS pre-2022 config (historical)', () => {
  const clss = getPMAYScheme('CLSS-pre-2022')

  it('uses the pre-2022 bands (6.5pp/₹6L, 4pp/₹9L, 3pp/₹12L)', () => {
    expect(clss.bands.map(b => [b.category, b.subsidyRatePoints, b.maxLoanForSubsidy])).toEqual([
      ['EWS', 6.5, 600000],
      ['LIG', 6.5, 600000],
      ['MIG1', 4, 900000],
      ['MIG2', 3, 1200000],
    ])
  })

  it('runs a 20yr horizon at a 9% discount, ₹45L property cap, no loan ceiling, no NPV cap', () => {
    expect(clss.subsidyTenureCap).toBe(20)
    expect(clss.discountRate).toBe(0.09)
    expect(clss.maxPropertyValue).toBe(4500000)
    expect(clss.maxLoanForScheme).toBe(Infinity)
    expect(clss.maxSubsidyNPV).toBe(Infinity)
  })
})

describe('getPMAYScheme', () => {
  it('throws on an unknown scheme', () => {
    // @ts-expect-error — exercising the runtime guard with an invalid scheme
    expect(() => getPMAYScheme('PMAY-U-3.0')).toThrow(/scheme/)
  })

  it('exposes both known schemes', () => {
    expect(Object.keys(PMAY_SCHEMES).sort()).toEqual(['CLSS-pre-2022', 'PMAY-U-2.0-ISS'])
  })
})
