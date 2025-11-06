/**
 * PMAYCalculator Component
 * Pradhan Mantri Awas Yojana (PMAY) - Credit Linked Subsidy Scheme
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { PMAYInputs, PMAYResult } from '@/lib/types';
import { calculatePMAYSubsidy } from '@/lib/calculations/pmay';
import { formatIndianCurrency, formatToLakhsCrores } from '@/lib/utils';
import { PMAY_CRITERIA } from '@/lib/constants';

const pmayFormSchema = z.object({
    annualIncome: z.number().min(0).max(20000000),
    loanAmount: z.number().min(100000).max(100000000),
    interestRate: z.number().min(5).max(20),
    tenureYears: z.number().min(1).max(30),
    propertyValue: z.number().min(100000).max(100000000),
    isFirstTime: z.boolean(),
});

type PMAYFormData = z.infer<typeof pmayFormSchema>;

interface PMAYCalculatorProps {
    defaultLoanAmount?: number;
    defaultRate?: number;
    defaultTenure?: number;
    defaultPropertyValue?: number;
}

export function PMAYCalculator({
    defaultLoanAmount = 5000000,
    defaultRate = 9,
    defaultTenure = 20,
    defaultPropertyValue = 6000000,
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
            annualIncome: 800000, // ₹8L (MIG1)
            loanAmount: defaultLoanAmount,
            interestRate: defaultRate,
            tenureYears: defaultTenure,
            propertyValue: defaultPropertyValue,
            isFirstTime: true,
        },
    });

    const annualIncome = watch('annualIncome');
    const isFirstTime = watch('isFirstTime');

    const onSubmit = (data: PMAYFormData) => {
        const inputs: PMAYInputs = {
            annualIncome: data.annualIncome,
            loanAmount: data.loanAmount,
            interestRate: data.interestRate,
            tenureYears: data.tenureYears,
            propertyValue: data.propertyValue,
            isFirstTime: data.isFirstTime,
        };

        const subsidyResult = calculatePMAYSubsidy(inputs);
        setResult(subsidyResult);
    };

    // Determine potential category based on income
    const getIncomeCategory = (income: number): string => {
        if (income <= 300000) return 'EWS (Economically Weaker Section)';
        if (income <= 600000) return 'LIG (Low Income Group)';
        if (income <= 1200000) return 'MIG1 (Middle Income Group 1)';
        if (income <= 1800000) return 'MIG2 (Middle Income Group 2)';
        return 'Not Eligible (Income > ₹18L)';
    };

    return (
        <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded" role="complementary" aria-labelledby="pmay-info-heading">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 id="pmay-info-heading" className="text-sm font-medium text-blue-800">About PMAY Credit Linked Subsidy Scheme (CLSS)</h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <p>PMAY-CLSS provides interest subsidy on home loans for first-time buyers:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>EWS/LIG: 6.5% subsidy on loans up to ₹6L</li>
                                <li>MIG1: 4% subsidy on loans up to ₹9L</li>
                                <li>MIG2: 3% subsidy on loans up to ₹12L</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">PMAY Subsidy Calculator</h2>

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
                        {errors.annualIncome && (
                            <p className="mt-1 text-sm text-red-600">{errors.annualIncome.message}</p>
                        )}
                        <p className="mt-1 text-xs text-blue-600">
                            Your category: {getIncomeCategory(annualIncome)}
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
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Property Value (₹)
                            </label>
                            <input
                                type="number"
                                {...register('propertyValue', { valueAsNumber: true })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
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
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">Monthly Savings</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {formatIndianCurrency(result.savingsPerMonth || 0)}
                                    </p>
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
                                        <span className="font-medium text-gray-900">Total Subsidy Benefit</span>
                                        <span className="text-xl font-bold text-green-600">
                                            {formatIndianCurrency(result.totalSavings || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Comparison Table */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">PMAY Categories Comparison</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Income Range</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subsidy Rate</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Loan</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Property</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {Object.entries(PMAY_CRITERIA).map(([cat, criteria]) => (
                                                <tr key={cat} className={cat === result.category ? 'bg-green-50' : ''}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {cat}
                                                        {cat === result.category && (
                                                            <span className="ml-2 text-green-600">✓</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ₹{(criteria.minIncome / 100000).toFixed(1)}L - ₹{(criteria.maxIncome / 100000).toFixed(1)}L
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                        {criteria.subsidyRate}%
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ₹{(criteria.maxLoanForSubsidy / 100000).toFixed(0)}L
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ₹{(criteria.maxPropertyValue / 10000000).toFixed(1)}Cr
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

                                    {result.category && (
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
