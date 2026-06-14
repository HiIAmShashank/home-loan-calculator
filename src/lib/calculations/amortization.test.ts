import { describe, it, expect } from 'vitest'
import {
  generateAmortizationSchedule,
  generateScheduleWithLumpSum,
  generateScheduleWithReducedEMI,
} from '@/lib/calculations/amortization'
import { calculateEMI } from '@/lib/calculations/emi'

const P = 5000000
const RATE = 9
const YEARS = 20

describe('generateAmortizationSchedule', () => {
  it('produces one row per month and fully repays the principal', () => {
    const { schedule, totalPrincipal } = generateAmortizationSchedule(P, RATE, YEARS)
    expect(schedule).toHaveLength(YEARS * 12)
    expect(totalPrincipal).toBeCloseTo(P, 0)
    expect(schedule.at(-1)!.closingBalance).toBe(0)
  })

  it('reconciles totalAmount to totalInterest + totalPrincipal', () => {
    const { totalAmount, totalInterest, totalPrincipal } = generateAmortizationSchedule(P, RATE, YEARS)
    expect(totalAmount).toBeCloseTo(totalInterest + totalPrincipal, 0)
  })

  it('returns an empty schedule for non-positive principal', () => {
    expect(generateAmortizationSchedule(0, RATE, YEARS).schedule).toHaveLength(0)
  })

  it('shortens the loan when a monthly extra payment is supplied', () => {
    const withExtra = generateAmortizationSchedule(P, RATE, YEARS, 20000)
    expect(withExtra.schedule.length).toBeLessThan(YEARS * 12)
    // never overpays: principal in any row cannot exceed that row's opening balance
    expect(withExtra.schedule.every(r => r.principal <= r.openingBalance)).toBe(true)
  })
})

describe('generateScheduleWithLumpSum (reduce-tenure)', () => {
  it('a lump-sum prepayment shortens the tenure', () => {
    const base = generateAmortizationSchedule(P, RATE, YEARS)
    const lump = generateScheduleWithLumpSum(P, RATE, YEARS, [{ month: 12, amount: 1000000 }])
    expect(lump.schedule.length).toBeLessThan(base.schedule.length)
    expect(lump.totalInterest).toBeLessThan(base.totalInterest)
  })
})

describe('generateScheduleWithReducedEMI (reduce-EMI)', () => {
  it('holds the tenure fixed and lowers the EMI on a lump-sum prepayment', () => {
    const originalEMI = calculateEMI(P, RATE, YEARS)
    const red = generateScheduleWithReducedEMI(P, RATE, YEARS, [{ month: 12, amount: 1000000 }])
    expect(red.schedule).toHaveLength(YEARS * 12)
    expect(red.finalEMI).toBeLessThan(originalEMI)
  })

  it('leaves the EMI unchanged when there are no prepayments', () => {
    const red = generateScheduleWithReducedEMI(P, RATE, YEARS, [])
    expect(red.finalEMI).toBeCloseTo(calculateEMI(P, RATE, YEARS), 1)
    expect(red.schedule).toHaveLength(YEARS * 12)
  })

  it('reconciles totals: totalPrincipal === principal and totalAmount === principal + interest', () => {
    const red = generateScheduleWithReducedEMI(P, RATE, YEARS, [{ month: 12, amount: 1000000 }])
    expect(red.totalPrincipal).toBeCloseTo(P, 2)
    expect(red.totalAmount).toBeCloseTo(red.totalPrincipal + red.totalInterest, 2)
  })

  it('drives the recomputed EMI monotonically down as more prepayments are added', () => {
    const finalEMIafter = (months: number) => {
      const prepayments = Array.from({ length: months }, (_, i) => ({ month: i + 1, amount: 20000 }))
      return generateScheduleWithReducedEMI(P, RATE, YEARS, prepayments).finalEMI
    }
    const series = [1, 12, 60, 120].map(finalEMIafter)
    for (let i = 1; i < series.length; i++) {
      expect(series[i]).toBeLessThanOrEqual(series[i - 1])
    }
  })

  it('saves less interest than reduce-tenure for the same lump sum', () => {
    const lump = generateScheduleWithLumpSum(P, RATE, YEARS, [{ month: 12, amount: 1000000 }])
    const red = generateScheduleWithReducedEMI(P, RATE, YEARS, [{ month: 12, amount: 1000000 }])
    // reduce-EMI keeps paying for the full tenure, so it pays more interest than reduce-tenure
    expect(red.totalInterest).toBeGreaterThan(lump.totalInterest)
  })
})
