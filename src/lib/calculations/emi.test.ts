import { describe, it, expect } from 'vitest'
import {
  calculateEMI,
  calculateTotalInterest,
  calculateTotalAmount,
  calculateLoanAmount,
  calculateTenure,
  calculateEffectiveRate,
  calculateOutstanding,
  calculateInterestPercentage,
} from '@/lib/calculations/emi'

// Reference values independently derived from the standard EMI formula
// EMI = P·R·(1+R)^N / ((1+R)^N − 1), R = annualRate/12/100, N = years·12.

describe('calculateEMI', () => {
  it('computes the standard EMI (₹50L @ 9% / 20yr)', () => {
    expect(calculateEMI(5000000, 9, 20)).toBeCloseTo(44986.3, 1)
  })

  it('computes EMI for ₹64L @ 9% / 20yr', () => {
    expect(calculateEMI(6400000, 9, 20)).toBeCloseTo(57582.46, 1)
  })

  it('handles the 0% interest edge case as simple division', () => {
    expect(calculateEMI(1200000, 0, 1)).toBe(100000)
  })

  it('returns 0 for non-positive principal or tenure', () => {
    expect(calculateEMI(0, 9, 20)).toBe(0)
    expect(calculateEMI(5000000, 9, 0)).toBe(0)
  })

  it('throws on negative rate, tenure over 50yr, or non-finite input', () => {
    expect(() => calculateEMI(5000000, -1, 20)).toThrow()
    expect(() => calculateEMI(5000000, 9, 51)).toThrow()
    expect(() => calculateEMI(NaN, 9, 20)).toThrow()
  })
})

describe('calculateTotalInterest / calculateTotalAmount', () => {
  it('totalAmount = principal + totalInterest', () => {
    const principal = 5000000
    const interest = calculateTotalInterest(principal, 9, 20)
    const total = calculateTotalAmount(principal, 9, 20)
    expect(total).toBeCloseTo(principal + interest, 0)
  })

  it('total interest is positive over the loan life', () => {
    expect(calculateTotalInterest(5000000, 9, 20)).toBeGreaterThan(0)
  })
})

describe('calculateLoanAmount (reverse EMI)', () => {
  it('solves the principal affordable at a given EMI (₹60k @ 9% / 20yr)', () => {
    expect(calculateLoanAmount(60000, 9, 20)).toBeCloseTo(6668697.24, 0)
  })

  it('is the inverse of calculateEMI', () => {
    const emi = calculateEMI(5000000, 9, 20)
    expect(calculateLoanAmount(emi, 9, 20)).toBeCloseTo(5000000, -1)
  })

  it('returns 0 for non-positive EMI', () => {
    expect(calculateLoanAmount(0, 9, 20)).toBe(0)
  })
})

describe('calculateTenure', () => {
  it('solves the tenure in months for a given EMI', () => {
    const emi = calculateEMI(5000000, 9, 10)
    expect(calculateTenure(5000000, emi, 9)).toBe(120)
  })

  it('returns Infinity when the EMI never covers the interest', () => {
    // interest-only on ₹50L @ 9% is ₹37,500/mo; ₹30k can never amortise it
    expect(calculateTenure(5000000, 30000, 9)).toBe(Infinity)
  })

  it('uses ceil division at 0% interest', () => {
    expect(calculateTenure(1200000, 100000, 0)).toBe(12)
  })
})

describe('calculateOutstanding', () => {
  it('computes the balance part-way through (₹50L @ 9% / 20yr after 60mo)', () => {
    expect(calculateOutstanding(5000000, 9, 20, 60)).toBeCloseTo(4435352.45, 0)
  })

  it('returns the full principal at month 0 and 0 at maturity', () => {
    expect(calculateOutstanding(5000000, 9, 20, 0)).toBe(5000000)
    expect(calculateOutstanding(5000000, 9, 20, 240)).toBe(0)
  })
})

describe('calculateEffectiveRate', () => {
  it('raises the effective rate above the stated rate when a fee is charged', () => {
    expect(calculateEffectiveRate(5000000, 9, 50000, 20)).toBeGreaterThan(9)
  })

  it('equals the stated rate when there is no fee', () => {
    expect(calculateEffectiveRate(5000000, 9, 0, 20)).toBeCloseTo(9, 1)
  })
})

describe('calculateInterestPercentage', () => {
  it('expresses total interest as a percentage of principal', () => {
    expect(calculateInterestPercentage(5000000, 9, 20)).toBeCloseTo(115.93, 0)
  })
})
