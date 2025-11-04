/**
 * TaxBenefitsCalculator Component
 * Calculate tax savings under home loan (Section 80C, 24b, 80EEA)
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { TaxInputs, TaxBreakdown } from '@/lib/types';
import { calculateTaxSavings, calculateJointLoanBenefits } from '@/lib/calculations/tax';
import { formatIndianCurrency } from '@/lib/utils';

const taxFormSchema = z.object({
    annualIncome: z.number().min(0, 'Income must be positive').max(100000000, 'Maximum income exceeded'),
    taxRegime: z.enum(['old', 'new']),
    principalPaid: z.number().min(0).max(10000000),
    interestPaid: z.number().min(0).max(10000000),
    other80CInvestments: z.number().min(0).max(150000),
    isFirstTimeBuyer: z.boolean(),
    propertyValue: z.number().min(0),
    isJoint: z.boolean(),
    coBorrowerIncome: z.number().min(0).optional(),
});

type TaxFormData = z.infer<typeof taxFormSchema>;

interface TaxBenefitsCalculatorProps {
    defaultPrincipal?: number;
    defaultInterest?: number;
    defaultPropertyValue?: number;
}

export function TaxBenefitsCalculator({
    defaultPrincipal = 0,
    defaultInterest = 0,
    defaultPropertyValue = 0,
}: TaxBenefitsCalculatorProps) {
    const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdown | null>(null);
    const [jointBreakdown, setJointBreakdown] = useState<ReturnType<typeof calculateJointLoanBenefits> | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<TaxFormData>({
        resolver: zodResolver(taxFormSchema),
        defaultValues: {
            annualIncome: 1200000, // ₹12L default
            taxRegime: 'old',
            principalPaid: defaultPrincipal,
            interestPaid: defaultInterest,
            other80CInvestments: 0,
            isFirstTimeBuyer: false,
            propertyValue: defaultPropertyValue,
            isJoint: false,
            coBorrowerIncome: 0,
        },
    });

    const isJoint = watch('isJoint');

    const onSubmit = (data: TaxFormData) => {
        const inputs: TaxInputs = {
            annualIncome: data.annualIncome,
            taxRegime: data.taxRegime,
            principalPaid: data.principalPaid,
            interestPaid: data.interestPaid,
            other80CInvestments: data.other80CInvestments,
            isFirstTimeBuyer: data.isFirstTimeBuyer,
            propertyValue: data.propertyValue,
            isJointLoan: false,
        };

        const breakdown = calculateTaxSavings(inputs);
        setTaxBreakdown(breakdown);

        // Calculate joint benefits if applicable
        if (data.isJoint && data.coBorrowerIncome) {
            const joint = calculateJointLoanBenefits(
                data.annualIncome,
                data.coBorrowerIncome,
                data.principalPaid,
                data.interestPaid,
                data.other80CInvestments,
                data.isFirstTimeBuyer,
                data.propertyValue
            );
            setJointBreakdown(joint);
        } else {
            setJointBreakdown(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow" role="region" aria-labelledby="tax-calc-heading">
                <h2 id="tax-calc-heading" className="text-2xl font-bold text-gray-900 mb-4">Tax Benefits Calculator</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Calculate your tax savings under Section 80C (principal), 24(b) (interest), and 80EEA (first-time buyer)
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Tax benefits calculation form">
                    {/* Annual Income */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Annual Income (₹)
                        </label>
                        <input
                            type="number"
                            {...register('annualIncome', { valueAsNumber: true })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="12,00,000"
                        />
                        {errors.annualIncome && (
                            <p className="mt-1 text-sm text-red-600">{errors.annualIncome.message}</p>
                        )}
                    </div>

                    {/* Tax Regime */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tax Regime
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="old"
                                    {...register('taxRegime')}
                                    className="mr-2"
                                />
                                <span className="text-sm">Old Regime (with deductions)</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="new"
                                    {...register('taxRegime')}
                                    className="mr-2"
                                />
                                <span className="text-sm">New Regime (no deductions)</span>
                            </label>
                        </div>
                    </div>

                    {/* Loan Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Principal Paid (Annual)
                            </label>
                            <input
                                type="number"
                                {...register('principalPaid', { valueAsNumber: true })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Interest Paid (Annual)
                            </label>
                            <input
                                type="number"
                                {...register('interestPaid', { valueAsNumber: true })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Other Investments */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Other 80C Investments (ELSS, PPF, etc.)
                        </label>
                        <input
                            type="number"
                            {...register('other80CInvestments', { valueAsNumber: true })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                        />
                    </div>

                    {/* First Time Buyer */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            {...register('isFirstTimeBuyer')}
                            className="mr-2 h-4 w-4 text-blue-600"
                        />
                        <label className="text-sm text-gray-700">
                            First-time home buyer (eligible for Section 80EEA - additional ₹1.5L if property ≤₹45L)
                        </label>
                    </div>

                    {/* Property Value */}
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

                    {/* Joint Loan */}
                    <div className="border-t pt-4">
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                {...register('isJoint')}
                                className="mr-2 h-4 w-4 text-blue-600"
                            />
                            <label className="text-sm font-medium text-gray-700">
                                Joint Loan (both co-borrowers can claim full deductions)
                            </label>
                        </div>

                        {isJoint && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Co-borrower Annual Income (₹)
                                </label>
                                <input
                                    type="number"
                                    {...register('coBorrowerIncome', { valueAsNumber: true })}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="12,00,000"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Calculate Tax Savings
                    </button>
                </form>
            </div>

            {/* Results */}
            {taxBreakdown && (
                <div className="space-y-6">
                    {/* Regime Recommendation */}
                    <div className={`p-6 rounded-lg shadow ${taxBreakdown.recommendedRegime === 'old' ? 'bg-green-50 border-2 border-green-500' : 'bg-blue-50 border-2 border-blue-500'
                        }`}>
                        <h3 className="text-lg font-bold mb-2">
                            💡 Recommended: {taxBreakdown.recommendedRegime === 'old' ? 'Old Regime' : 'New Regime'}
                        </h3>
                        <p className="text-sm text-gray-700">
                            {taxBreakdown.recommendedRegime === 'old'
                                ? 'With home loan deductions, the old regime saves you more tax.'
                                : 'Despite deductions, the new regime results in lower tax liability.'}
                        </p>
                    </div>

                    {/* Tax Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Tax Without Loan</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatIndianCurrency(taxBreakdown.taxWithoutLoan)}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Tax With Loan</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatIndianCurrency(taxBreakdown.taxWithLoan)}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow border border-green-200">
                            <p className="text-sm text-gray-600 mb-1">Annual Tax Savings</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatIndianCurrency(taxBreakdown.savings)}
                            </p>
                        </div>
                    </div>

                    {/* Deduction Breakdown */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Deduction Breakdown</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Section 80C (Principal)</span>
                                <span className="font-medium">{formatIndianCurrency(taxBreakdown.deductions.section80C)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Section 24(b) (Interest)</span>
                                <span className="font-medium">{formatIndianCurrency(taxBreakdown.deductions.section24b)}</span>
                            </div>
                            {taxBreakdown.deductions.section80EEA > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Section 80EEA (First-time)</span>
                                    <span className="font-medium text-green-600">{formatIndianCurrency(taxBreakdown.deductions.section80EEA)}</span>
                                </div>
                            )}
                            <div className="border-t pt-3 flex justify-between items-center font-bold">
                                <span className="text-gray-900">Total Deductions</span>
                                <span className="text-blue-600">{formatIndianCurrency(taxBreakdown.deductions.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 20-Year Projection */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-bold mb-2">20-Year Cumulative Savings</h3>
                        <p className="text-4xl font-bold">{formatIndianCurrency(taxBreakdown.savings * 20)}</p>
                        <p className="text-sm opacity-90 mt-2">
                            Assuming similar deductions over 20-year loan tenure
                        </p>
                    </div>

                    {/* Joint Loan Benefits */}
                    {jointBreakdown && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                🤝 Joint Loan Benefits
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Primary Borrower Savings</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {formatIndianCurrency(jointBreakdown.primarySavings)}
                                    </p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Co-borrower Savings</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {formatIndianCurrency(jointBreakdown.coSavings)}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-500">
                                <p className="text-sm text-gray-600 mb-1">Combined Annual Savings</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {formatIndianCurrency(jointBreakdown.totalSavings)}
                                </p>
                                <p className="text-xs text-gray-600 mt-2">
                                    💡 Both borrowers can claim full deductions, doubling your tax benefits!
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
