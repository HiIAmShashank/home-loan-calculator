import { describe, it, expect } from 'vitest'
import {
  formatIndianNumber,
  formatIndianCurrency,
  formatToLakhsCrores,
  parseIndianNumber,
} from '@/lib/utils'

describe('formatIndianNumber (lakh/crore grouping)', () => {
  it('groups the integer part in the Indian system', () => {
    expect(formatIndianNumber(100000)).toBe('1,00,000')
    expect(formatIndianNumber(10000000)).toBe('1,00,00,000')
    expect(formatIndianNumber(1234567)).toBe('12,34,567')
  })

  it('leaves values under 1,000 ungrouped and returns "0" for zero', () => {
    expect(formatIndianNumber(0)).toBe('0')
    expect(formatIndianNumber(999)).toBe('999')
  })

  it('preserves sign and decimals', () => {
    expect(formatIndianNumber(-100000)).toBe('-1,00,000')
    expect(formatIndianNumber(1234.5)).toBe('1,234.5')
  })
})

describe('formatIndianCurrency', () => {
  it('prefixes the ₹ symbol on a grouped number', () => {
    expect(formatIndianCurrency(100000)).toBe('₹1,00,000')
  })
})

describe('formatToLakhsCrores', () => {
  it('abbreviates to Cr / L / K', () => {
    expect(formatToLakhsCrores(15000000)).toBe('₹1.5Cr')
    expect(formatToLakhsCrores(150000)).toBe('₹1.5L')
    expect(formatToLakhsCrores(5000)).toBe('₹5.0K')
  })
})

describe('parseIndianNumber', () => {
  it('strips the symbol and commas', () => {
    expect(parseIndianNumber('₹1,00,000')).toBe(100000)
  })

  it('expands L / Cr / K suffixes', () => {
    expect(parseIndianNumber('1.5L')).toBe(150000)
    expect(parseIndianNumber('2Cr')).toBe(20000000)
  })

  it('returns 0 for empty input', () => {
    expect(parseIndianNumber('')).toBe(0)
  })
})
