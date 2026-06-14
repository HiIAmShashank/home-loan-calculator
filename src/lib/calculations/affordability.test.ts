import { describe, it, expect } from 'vitest'
import { calculateAffordability } from '@/lib/calculations/affordability'
import type { AffordabilityInputs } from '@/lib/types'

const base: AffordabilityInputs = {
  monthlyIncome: 100000,
  downPaymentAvailable: 1000000,
  interestRate: 9,
  tenureYears: 20,
  foirPercentage: 50,
}

describe('calculateAffordability — pooled vs per-applicant FOIR', () => {
  it('equal incomes ⇒ per-applicant equals pooled', () => {
    const inputs = { ...base, coApplicantIncome: 100000 }
    const pooled = calculateAffordability({ ...inputs, foirMode: 'pooled' })
    const perApplicant = calculateAffordability({ ...inputs, foirMode: 'per-applicant' })
    expect(pooled.maxAffordableEMI).toBe(100000)
    expect(perApplicant.maxAffordableEMI).toBe(100000)
  })

  it('unequal incomes ⇒ per-applicant is more conservative than pooled', () => {
    const inputs = { ...base, monthlyIncome: 200000, coApplicantIncome: 25000 }
    const pooled = calculateAffordability({ ...inputs, foirMode: 'pooled' })
    const perApplicant = calculateAffordability({ ...inputs, foirMode: 'per-applicant' })
    // pooled: (2L + 25k) × 50% = 1,12,500
    expect(pooled.maxAffordableEMI).toBe(112500)
    // per-applicant: 2L × min(50,60)% + 25k × min(50,40)% = 1,00,000 + 10,000 = 1,10,000
    expect(perApplicant.maxAffordableEMI).toBe(110000)
    expect(perApplicant.maxAffordableEMI).toBeLessThan(pooled.maxAffordableEMI)
  })

  it('income-band edges pick the 40 / 50 / 60 caps (slider held high so the cap binds)', () => {
    const at = (monthlyIncome: number) =>
      calculateAffordability({ ...base, monthlyIncome, foirPercentage: 60, foirMode: 'per-applicant' }).maxAffordableEMI
    expect(at(30000)).toBe(30000 * 0.4) // ≤₹30k → 40%
    expect(at(30001)).toBeCloseTo(30001 * 0.5, 5) // >₹30k → 50%
    expect(at(75000)).toBe(75000 * 0.5) // ≤₹75k → 50%
    expect(at(75001)).toBeCloseTo(75001 * 0.6, 5) // >₹75k → 60%
  })

  it('the slider acts as a ceiling below the band cap', () => {
    // a >₹75k earner (band cap 60%) with the slider at 40% is capped to 40%, not 60%
    const result = calculateAffordability({ ...base, monthlyIncome: 100000, foirPercentage: 40, foirMode: 'per-applicant' })
    expect(result.maxAffordableEMI).toBe(100000 * 0.4)
  })

  it('a zero co-applicant contributes nothing (no band lookup)', () => {
    const result = calculateAffordability({ ...base, monthlyIncome: 100000, coApplicantIncome: 0, foirMode: 'per-applicant' })
    expect(result.maxAffordableEMI).toBe(100000 * 0.5)
  })

  it('subtracts obligations after combining applicant capacities', () => {
    const result = calculateAffordability({
      ...base,
      monthlyIncome: 200000,
      coApplicantIncome: 25000,
      existingEMIs: 10000,
      foirMode: 'per-applicant',
    })
    expect(result.maxAffordableEMI).toBe(110000 - 10000)
  })

  it('surfaces the per-applicant recommendation only when the mode is on and a co-applicant exists', () => {
    const tag = /Per-applicant FOIR applied/
    const withCo = calculateAffordability({ ...base, coApplicantIncome: 25000, monthlyIncome: 200000, foirMode: 'per-applicant' })
    const pooled = calculateAffordability({ ...base, coApplicantIncome: 25000, monthlyIncome: 200000, foirMode: 'pooled' })
    const noCo = calculateAffordability({ ...base, coApplicantIncome: 0, foirMode: 'per-applicant' })
    expect(withCo.recommendations.some(r => tag.test(r))).toBe(true)
    expect(pooled.recommendations.some(r => tag.test(r))).toBe(false)
    expect(noCo.recommendations.some(r => tag.test(r))).toBe(false)
  })
})
