import { describe, it, expect } from 'vitest'
import { getTaxConfig, TAX_CONFIG, DEFAULT_FINANCIAL_YEAR } from '@/lib/taxConfig'

describe('taxConfig FY2025-26 (default)', () => {
  const config = getTaxConfig('FY2025-26')

  it('is the default financial year', () => {
    expect(DEFAULT_FINANCIAL_YEAR).toBe('FY2025-26')
  })

  it('new-regime slabs include the 25% (₹20L–₹24L) band', () => {
    const band = config.new.slabs.find(s => s.min === 2000000 && s.max === 2400000)
    expect(band?.rate).toBe(0.25)
  })

  it('standard deduction is ₹75k (new) and ₹50k (old)', () => {
    expect(config.new.standardDeduction).toBe(75000)
    expect(config.old.standardDeduction).toBe(50000)
  })

  it('87A rebate: new ≤₹12L cap ₹60k, old ≤₹5L cap ₹12.5k', () => {
    expect(config.new.rebate).toEqual({ incomeThreshold: 1200000, maxRebate: 60000 })
    expect(config.old.rebate).toEqual({ incomeThreshold: 500000, maxRebate: 12500 })
  })

  it('applies a 4% health & education cess', () => {
    expect(config.cessRate).toBe(0.04)
  })
})

describe('taxConfig FY2024-25 (regression anchor)', () => {
  const config = getTaxConfig('FY2024-25')

  it('reproduces the shipped behaviour: single ₹50k std deduction, no 87A rebate', () => {
    expect(config.new.standardDeduction).toBe(50000)
    expect(config.old.standardDeduction).toBe(50000)
    expect(config.new.rebate).toEqual({ incomeThreshold: 0, maxRebate: 0 })
    expect(config.old.rebate).toEqual({ incomeThreshold: 0, maxRebate: 0 })
  })
})

describe('getTaxConfig', () => {
  it('throws on an unknown financial year', () => {
    // @ts-expect-error — exercising the runtime guard with an invalid FY
    expect(() => getTaxConfig('FY1999-00')).toThrow(/financial year/)
  })

  it('exposes both known financial years', () => {
    expect(Object.keys(TAX_CONFIG).sort()).toEqual(['FY2024-25', 'FY2025-26'])
  })
})
