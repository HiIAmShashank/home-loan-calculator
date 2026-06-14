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
import { AmountInWords } from '@/components/ui/AmountInWords';
import { AmountWithTooltip } from '@/components/ui/AmountWithTooltip';

const taxFormSchema = z.object({
    annualIncome: z.number().min(0, 'Income must be positive').max(100000000, 'Maximum income exceeded'),
    principalPaid: z.number().min(0).max(10000000),
    interestPaid: z.number().min(0).max(10000000),
    other80CInvestments: z.number().min(0).max(150000),
    isFirstTimeBuyer: z.boolean(),
    propertyValue: z.number().min(0),
    loanSanctionDate: z
        .union([z.literal(''), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date')])
        .optional(),
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
            principalPaid: defaultPrincipal,
            interestPaid: defaultInterest,
            other80CInvestments: 0,
            isFirstTimeBuyer: false,
            propertyValue: defaultPropertyValue,
            loanSanctionDate: '',
            isJoint: false,
            coBorrowerIncome: 0,
        },
    });

    const isJoint = watch('isJoint');
    const isFirstTimeBuyer = watch('isFirstTimeBuyer');
    const annualIncome = watch('annualIncome');
    const principalPaid = watch('principalPaid');
    const interestPaid = watch('interestPaid');
    const propertyValue = watch('propertyValue');

    const onSubmit = (data: TaxFormData) => {
        const inputs: TaxInputs = {
            annualIncome: data.annualIncome,
            principalPaid: data.principalPaid,
            interestPaid: data.interestPaid,
            other80CInvestments: data.other80CInvestments,
            isFirstTimeBuyer: data.isFirstTimeBuyer,
            propertyValue: data.propertyValue,
            loanSanctionDate: data.loanSanctionDate || undefined,
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
                0.5,
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
                        {annualIncome > 0 && <AmountInWords amount={annualIncome} className="mt-1" />}
                        {errors.annualIncome && (
                            <p className="mt-1 text-sm text-red-600">{errors.annualIncome.message}</p>
                        )}
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
                            {principalPaid > 0 && <AmountInWords amount={principalPaid} className="mt-1" />}
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
                            {interestPaid > 0 && <AmountInWords amount={interestPaid} className="mt-1" />}
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
                        {watch('other80CInvestments') > 0 && <AmountInWords amount={watch('other80CInvestments')} className="mt-1" />}
                    </div>

                    {/* First Time Buyer */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            {...register('isFirstTimeBuyer')}
                            className="mr-2 h-4 w-4 text-blue-600"
                        />
                        <label className="text-sm text-gray-700">
                            First-time home buyer (Section 80EEA — additional ₹1.5L, see eligibility below)
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
                        {propertyValue > 0 && <AmountInWords amount={propertyValue} className="mt-1" />}
                    </div>

                    {/* Loan Sanction Date (gates Section 80EEA; only relevant for first-time buyers) */}
                    {isFirstTimeBuyer && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Loan Sanction Date
                            </label>
                            <input
                                type="date"
                                {...register('loanSanctionDate')}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.loanSanctionDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.loanSanctionDate.message}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Section 80EEA applies <strong>only</strong> to loans sanctioned between 1 Apr 2019 and 31 Mar 2022.
                                It is unavailable for loans sanctioned after Mar 2022, so it is off unless a date inside that window is entered.
                            </p>
                        </div>
                    )}

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
                                {(watch('coBorrowerIncome') ?? 0) > 0 && <AmountInWords amount={watch('coBorrowerIncome') ?? 0} className="mt-1" />}
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
                    {/* Regime Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Old Regime */}
                        <div className={`p-6 rounded-lg shadow ${taxBreakdown.recommendedRegime === 'old' ? 'bg-green-50 border-2 border-green-500' : 'bg-white border border-gray-200'}`}>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm text-gray-600">Old Regime (with home loan)</p>
                                {taxBreakdown.recommendedRegime === 'old' && (
                                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">★ Recommended</span>
                                )}
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatIndianCurrency(taxBreakdown.taxWithLoan)}
                            </p>
                            <AmountInWords amount={taxBreakdown.taxWithLoan} className="mt-2" />
                            {taxBreakdown.savings > 0 && (
                                <p className="text-sm text-green-700 mt-3">
                                    Saves {formatIndianCurrency(taxBreakdown.savings)} vs {formatIndianCurrency(taxBreakdown.taxWithoutLoan)} without the loan
                                </p>
                            )}
                        </div>
                        {/* New Regime */}
                        <div className={`p-6 rounded-lg shadow ${taxBreakdown.recommendedRegime === 'new' ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white border border-gray-200'}`}>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm text-gray-600">New Regime</p>
                                {taxBreakdown.recommendedRegime === 'new' && (
                                    <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">★ Recommended</span>
                                )}
                            </div>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatIndianCurrency(taxBreakdown.taxNewRegime)}
                            </p>
                            <AmountInWords amount={taxBreakdown.taxNewRegime} className="mt-2" />
                            <p className="text-sm text-gray-500 mt-3">
                                No home-loan deductions apply in the new regime.
                            </p>
                        </div>
                    </div>

                    {/* Recommendation */}
                    <div className={`p-4 rounded-lg ${taxBreakdown.recommendedRegime === 'old' ? 'bg-green-50' : 'bg-blue-50'}`}>
                        <p className="text-sm text-gray-700">
                            💡 <strong>Recommended: {taxBreakdown.recommendedRegime === 'old' ? 'Old Regime' : 'New Regime'}</strong>
                            {taxBreakdown.recommendedRegime === 'old'
                                ? ' — with home-loan deductions, the old regime gives the lower tax liability.'
                                : ' — the new regime is lower even after the old regime’s home-loan deductions.'}
                        </p>
                    </div>

                    {/* Deduction Breakdown */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Deduction Breakdown (Old Regime)</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Section 80C (Principal)</span>
                                <span className="font-medium"><AmountWithTooltip amount={taxBreakdown.deductions.section80C} /></span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Section 24(b) (Interest)</span>
                                <span className="font-medium"><AmountWithTooltip amount={taxBreakdown.deductions.section24b} /></span>
                            </div>
                            {taxBreakdown.deductions.section80EEA > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Section 80EEA (First-time)</span>
                                    <span className="font-medium text-green-600"><AmountWithTooltip amount={taxBreakdown.deductions.section80EEA} /></span>
                                </div>
                            )}
                            <div className="border-t pt-3 flex justify-between items-center font-bold">
                                <span className="text-gray-900">Total Deductions</span>
                                <span className="text-blue-600">{formatIndianCurrency(taxBreakdown.deductions.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 20-Year Projection — only meaningful when the old regime (with its home-loan
                        deductions) is the recommended choice and there is an actual saving */}
                    {taxBreakdown.recommendedRegime === 'old' && taxBreakdown.savings > 0 && (
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-bold mb-2">20-Year Cumulative Savings (Old Regime)</h3>
                            <p className="text-4xl font-bold">{formatIndianCurrency(taxBreakdown.savings * 20)}</p>
                            <AmountInWords amount={taxBreakdown.savings * 20} className="text-sm opacity-90 mt-2" variant="light" />
                            <p className="text-sm opacity-90 mt-2">
                                Old-regime home-loan tax savings, assuming similar deductions over a 20-year tenure
                            </p>
                        </div>
                    )}

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
