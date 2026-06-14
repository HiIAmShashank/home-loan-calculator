import { describe, it, expect, vi } from 'vitest'
import {
  calculateStampDuty,
  calculateRegistrationFee,
  calculateGST,
  calculateStampDutyBreakdown,
} from '@/lib/calculations/stampDuty'

describe('calculateStampDuty', () => {
  it('applies the state male rate (Maharashtra 6% on ₹50L)', () => {
    expect(calculateStampDuty(5000000, 'Maharashtra', 'male')).toBe(300000)
  })

  it('applies the lower female / joint rate where the state offers one', () => {
    expect(calculateStampDuty(5000000, 'Maharashtra', 'female')).toBe(200000) // 4%
    expect(calculateStampDuty(5000000, 'Maharashtra', 'joint')).toBe(200000) // women's rate
  })

  it('uses the same rate for both genders when the state has no concession', () => {
    expect(calculateStampDuty(5000000, 'Karnataka', 'female')).toBe(280000) // 5.6%
  })

  it('falls back to a default 5% and warns for an unlisted state', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(calculateStampDuty(5000000, 'Atlantis', 'male')).toBe(250000)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe('calculateRegistrationFee', () => {
  it('caps the fee (Maharashtra 1% capped at ₹30k)', () => {
    expect(calculateRegistrationFee(5000000, 'Maharashtra')).toBe(30000)
  })
})

describe('calculateGST', () => {
  it('charges 5% on the construction portion of an under-construction property', () => {
    expect(calculateGST(5000000, true, 0.7)).toBe(175000) // 5% of ₹35L
  })

  it('charges nothing on a ready-to-move property', () => {
    expect(calculateGST(5000000, false)).toBe(0)
  })
})

describe('calculateStampDutyBreakdown', () => {
  it('sums the transaction cost and computes the effective rate', () => {
    const breakdown = calculateStampDutyBreakdown({
      propertyValue: 5000000,
      state: 'Maharashtra',
      gender: 'female',
      isUnderConstruction: false,
    })
    expect(breakdown.stampDuty).toBe(200000)
    expect(breakdown.registrationFee).toBe(30000)
    expect(breakdown.gst).toBe(0)
    expect(breakdown.totalTransactionCost).toBe(230000)
    expect(breakdown.effectiveRate).toBeCloseTo(0.046, 4)
  })
})
