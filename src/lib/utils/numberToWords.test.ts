import { describe, it, expect } from 'vitest'
import { convertToWords, formatAmountInWords } from '@/lib/utils/numberToWords'

describe('convertToWords (Indian English, ₹)', () => {
  it('returns "Zero Rupees" for zero', () => {
    expect(convertToWords(0)).toBe('Zero Rupees')
  })

  it('uses the Indian lakh scale', () => {
    expect(convertToWords(100000)).toBe('One Lakh Rupees Only')
    expect(convertToWords(500000)).toBe('Five Lakh Rupees Only')
  })
})

describe('formatAmountInWords', () => {
  it('capitalises the first letter', () => {
    expect(formatAmountInWords(500000)).toBe('Five Lakh Rupees Only')
  })
})
