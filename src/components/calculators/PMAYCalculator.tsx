/**
 * PMAYCalculator Component
 * Pradhan Mantri Awas Yojana (PMAY) subsidy calculator.
 * Defaults to PMAY-Urban 2.0 (ISS); CLSS is reachable as a pre-2022 historical mode.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { PMAYInputs, PMAYResult, PMAYScheme } from '@/lib/types';
import { calculatePMAYSubsidy } from '@/lib/calculations/pmay';
import { formatIndianCurrency, formatToLakhsCrores } from '@/lib/utils';
import { getPMAYScheme, DEFAULT_PMAY_SCHEME } from '@/lib/pmayConfig';
import { AmountInWords } from '@/components/ui/AmountInWords';

const pmayFormSchema = z.object({
    annualIncome: z.number().min(0).max(20000000),
    loanAmount: z.number().min(100000).max(100000000),
    interestRate: z.number().min(5).max(20),
    tenureYears: z.number().min(1).max(30),
    propertyValue: z.number().min(100000).max(100000000),
    isFirstTime: z.boolean(),
    isPre2022Sanction: z.boolean(),
});

type PMAYFormData = z.infer<typeof pmayFormSchema>;

interface PMAYCalculatorProps {
    defaultLoanAmount?: number;
    defaultRate?: number;
    defaultTenure?: number;
    defaultPropertyValue?: number;
}

/** Resolve the active scheme from the pre-2022 historical toggle. */
function schemeFor(isPre2022Sanction: boolean): PMAYScheme {
    return isPre2022Sanction ? 'CLSS-pre-2022' : DEFAULT_PMAY_SCHEME;
}

/** Label the income band a household falls into under the active scheme. */
function getIncomeCategory(scheme: PMAYScheme, income: number): string {
    const config = getPMAYScheme(scheme);
    const band = config.bands.find(b => income <= b.maxIncome);
    if (!band) {
        const ceiling = config.bands[config.bands.length - 1].maxIncome;
        return `Not eligible (income > ₹${(ceiling / 100000).toFixed(0)}L)`;
    }
    return band.category;
}

export function PMAYCalculator({
    defaultLoanAmount = 2000000,
    defaultRate = 9,
    defaultTenure = 20,
    defaultPropertyValue = 3000000,
}: PMAYCalculatorProps) {
    const [result, setResult] = useState<PMAYResult | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<PMAYFormData>({
        resolver: zodResolver(pmayFormSchema),
        defaultValues: {
            annualIncome: 800000, // ₹8L (MIG under ISS)
            loanAmount: defaultLoanAmount,
            interestRate: defaultRate,
            tenureYears: defaultTenure,
            propertyValue: defaultPropertyValue,
            isFirstTime: true,
            isPre2022Sanction: false,
        },
    });

    const annualIncome = watch('annualIncome');
    const loanAmount = watch('loanAmount');
    const propertyValue = watch('propertyValue');
    const isFirstTime = watch('isFirstTime');
    const isPre2022Sanction = watch('isPre2022Sanction');

    const activeScheme = schemeFor(isPre2022Sanction);
    const activeConfig = getPMAYScheme(activeScheme);

    const onSubmit = (data: PMAYFormData) => {
        const inputs: PMAYInputs = {
            annualIncome: data.annualIncome,
            loanAmount: data.loanAmount,
            interestRate: data.interestRate,
            tenureYears: data.tenureYears,
            propertyValue: data.propertyValue,
            isFirstTime: data.isFirstTime,
        };

        setResult(calculatePMAYSubsidy(inputs, schemeFor(data.isPre2022Sanction)));
    };

    return (
        <div className="space-y-6">
            {/* Info Banner */}
            {activeScheme === 'PMAY-U-2.0-ISS' ? (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded" role="complementary" aria-labelledby="pmay-info-heading">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 id="pmay-info-heading" className="text-sm font-medium text-blue-800">About PMAY-Urban 2.0 — Interest Subsidy Scheme (ISS)</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>The current scheme (live since Sep 2024) gives first-time buyers an interest subsidy:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>4% subsidy on the first ₹8L of the loan, over a 12-year horizon</li>
                                    <li>Up to ₹1.8L total (paid as 5 yearly instalments)</li>
                                    <li>Eligibility: house value ≤ ₹35L, loan ≤ ₹25L, household income ≤ ₹9L</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded" role="complementary" aria-labelledby="pmay-info-heading">
                    <div className="ml-1">
                        <h3 id="pmay-info-heading" className="text-sm font-medium text-amber-800">Historical mode: PMAY-CLSS (pre-2022 sanction)</h3>
                        <div className="mt-2 text-sm text-amber-700">
                            <p>CLSS closed to new applications (MIG: 31 Mar 2021; EWS/LIG: 31 Mar 2022). These figures apply <strong>only</strong> to loans sanctioned before closure — not to current applicants. EWS/LIG 6.5% on ₹6L · MIG-I 4% on ₹9L · MIG-II 3% on ₹12L.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Annual Income */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Annual Household Income (₹)
                        </label>
                        <input
                            type="number"
                            {...register('annualIncome', { valueAsNumber: true })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="8,00,000"
                        />
                        {annualIncome > 0 && <AmountInWords amount={annualIncome} className="mt-1" />}
                        {errors.annualIncome && (
                            <p className="mt-1 text-sm text-red-600">{errors.annualIncome.message}</p>
                        )}
                        <p className="mt-1 text-xs text-blue-600">
                            Your category: {getIncomeCategory(activeScheme, annualIncome)}
                        </p>
                    </div>

                    {/* Loan Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Loan Amount (₹)
                            </label>
                            <input
                                type="number"
                                {...register('loanAmount', { valueAsNumber: true })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                            {loanAmount > 0 && <AmountInWords amount={loanAmount} className="mt-1" />}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                House / Property Value (₹)
                            </label>
                            <input
                                type="number"
                                {...register('propertyValue', { valueAsNumber: true })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                            {propertyValue > 0 && <AmountInWords amount={propertyValue} className="mt-1" />}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Interest Rate (%)
                            </label>
                            <input
                                type="number"
                                step="0.05"
                                {...register('interestRate', { valueAsNumber: true })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Loan Tenure (Years)
                            </label>
                            <input
                                type="number"
                                {...register('tenureYears', { valueAsNumber: true })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Subsidy is computed over the first {activeConfig.subsidyTenureCap} years.
                            </p>
                        </div>
                    </div>

                    {/* First Time Buyer */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            {...register('isFirstTime')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            I am a first-time home buyer (Required for PMAY)
                        </label>
                    </div>

                    {!isFirstTime && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <p className="text-sm text-yellow-700">
                                ⚠️ PMAY subsidy is only available for first-time home buyers
                            </p>
                        </div>
                    )}

                    {/* Historical scheme toggle */}
                    <div className="flex items-center pt-2 border-t border-gray-100">
                        <input
                            type="checkbox"
                            {...register('isPre2022Sanction')}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            My loan was sanctioned before 2022 (use historical PMAY-CLSS rules)
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Calculate PMAY Subsidy
                    </button>
                </form>
            </div>

            {/* Results */}
            {result && (
                <div className="space-y-6">
                    <p className="text-xs text-gray-500 text-center">
                        Scheme: <span className="font-medium text-gray-700">{getPMAYScheme(result.scheme).label}</span>
                    </p>
                    {result.eligible ? (
                        <>
                            {/* Eligibility Status */}
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <svg className="h-8 w-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h3 className="text-xl font-bold">You are Eligible for PMAY!</h3>
                                        <p className="text-sm opacity-90">Category: {result.category}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Subsidy Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-6 rounded-lg shadow border-2 border-green-500">
                                    <p className="text-sm text-gray-600 mb-1">Subsidy Amount (NPV)</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {formatIndianCurrency(result.subsidyNPV)}
                                    </p>
                                    <AmountInWords amount={result.subsidyNPV} className="mt-2" />
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">Monthly Savings</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {formatIndianCurrency(result.savingsPerMonth || 0)}
                                    </p>
                                    <AmountInWords amount={result.savingsPerMonth || 0} className="mt-2" />
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">Effective Rate</p>
                                    <p className="text-3xl font-bold text-purple-600">
                                        {result.effectiveRate.toFixed(2)}%
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        vs {watch('interestRate')}% market rate
                                    </p>
                                </div>
                            </div>

                            {/* Subsidy Details */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Subsidy Breakdown</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Category</span>
                                        <span className="font-medium">{result.category}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Subsidy Rate</span>
                                        <span className="font-medium text-green-600">{result.subsidyRate}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Eligible Loan Amount</span>
                                        <span className="font-medium">{formatToLakhsCrores(result.eligibleLoan)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Max Loan for Subsidy ({result.category})</span>
                                        <span className="font-medium">{formatToLakhsCrores(result.maxLoanForSubsidy)}</span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between items-center">
                                        <span className="font-medium text-gray-900">Total Subsidy Benefit (NPV)</span>
                                        <span className="text-xl font-bold text-green-600">
                                            {formatIndianCurrency(result.totalSavings || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Comparison Table */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {activeConfig.label} — Category Bands
                                </h3>
                                <p className="text-xs text-gray-500 mb-4">
                                    House value ≤ {formatToLakhsCrores(activeConfig.maxPropertyValue)}
                                    {Number.isFinite(activeConfig.maxLoanForScheme) && (
                                        <> · Loan ≤ {formatToLakhsCrores(activeConfig.maxLoanForScheme)}</>
                                    )} · Subsidy horizon {activeConfig.subsidyTenureCap} yrs
                                </p>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Income Range</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subsidy Rate</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Loan for Subsidy</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {activeConfig.bands.map((band) => (
                                                <tr key={band.category} className={band.category === result.category ? 'bg-green-50' : ''}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {band.category}
                                                        {band.category === result.category && (
                                                            <span className="ml-2 text-green-600">✓</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ₹{(band.minIncome / 100000).toFixed(1)}L - ₹{(band.maxIncome / 100000).toFixed(1)}L
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                        {band.subsidyRatePoints}%
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ₹{(band.maxLoanForSubsidy / 100000).toFixed(0)}L
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                            <div className="flex items-start">
                                <svg className="h-6 w-6 text-red-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h3 className="text-lg font-bold text-red-800 mb-2">Not Eligible for PMAY</h3>
                                    <p className="text-sm text-red-700">{result.reason}</p>

                                    {result.category !== 'INELIGIBLE' && (
                                        <div className="mt-4 text-sm text-red-700">
                                            <p className="font-medium mb-2">Category: {result.category}</p>
                                            <p>Subsidy Rate: {result.subsidyRate}%</p>
                                            <p>Max Loan for Subsidy: {formatToLakhsCrores(result.maxLoanForSubsidy)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
