/**
 * Affordability Calculator Component
 * Calculate maximum affordable loan based on income and FOIR
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    calculateAffordability,
    compareAffordabilityScenarios,
} from '@/lib/calculations/affordability';
import { formatIndianCurrency, formatToLakhsCrores } from '@/lib/utils';
import type { AffordabilityResult } from '@/lib/types';
import { AmountInWords } from '@/components/ui/AmountInWords';

// ============================================================================
// FORM SCHEMA
// ============================================================================

const affordabilitySchema = z.object({
    monthlyIncome: z.number().min(10000, 'Minimum ₹10,000').max(10000000, 'Maximum ₹1Cr'),
    coApplicantIncome: z.number().min(0).max(10000000).optional(),
    existingEMIs: z.number().min(0).max(5000000).optional(),
    otherObligations: z.number().min(0).max(1000000).optional(),
    downPaymentAvailable: z.number().min(0).max(100000000, 'Maximum ₹10Cr'),
    interestRate: z.number().min(5).max(20),
    tenureYears: z.number().min(1).max(30),
    foirPercentage: z.number().min(40).max(60),
});

type AffordabilityFormData = z.infer<typeof affordabilitySchema>;

// ============================================================================
// COMPONENT
// ============================================================================

export function AffordabilityCalculator() {
    const [result, setResult] = useState<AffordabilityResult | null>(null);
    const [scenarios, setScenarios] = useState<Array<AffordabilityResult & { scenario: string; foirPercentage: number }>>([]);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<AffordabilityFormData>({
        resolver: zodResolver(affordabilitySchema),
        defaultValues: {
            monthlyIncome: 100000,
            coApplicantIncome: 0,
            existingEMIs: 0,
            otherObligations: 0,
            downPaymentAvailable: 1500000,
            interestRate: 8.5,
            tenureYears: 20,
            foirPercentage: 50,
        },
    });

    const formValues = watch();
    const totalIncome = (formValues.monthlyIncome || 0) + (formValues.coApplicantIncome || 0);

    const onSubmit = (data: AffordabilityFormData) => {
        const affordabilityResult = calculateAffordability(data);
        setResult(affordabilityResult);

        const scenarioResults = compareAffordabilityScenarios(data);
        setScenarios(scenarioResults);
    };

    // Helper to get FOIR badge color
    const getFOIRBadge = (foir: number) => {
        if (foir <= 50) return { color: 'bg-green-100 text-green-800', label: 'Conservative' };
        if (foir <= 55) return { color: 'bg-blue-100 text-blue-800', label: 'Moderate' };
        return { color: 'bg-orange-100 text-orange-800', label: 'Aggressive' };
    };

    const foirBadge = getFOIRBadge(formValues.foirPercentage || 50);

    return (
        <div className="w-full p-6 space-y-6" role="region" aria-labelledby="afford-calc-heading">

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" role="complementary" aria-label="FOIR calculation information">
                <div className="flex items-start gap-3">
                    <span className="text-2xl" role="img" aria-label="Information">ℹ️</span>
                    <div className="flex-1 text-sm">
                        <p className="font-semibold text-blue-900 mb-1">FOIR-Based Calculation</p>
                        <p className="text-blue-800">
                            FOIR (Fixed Obligation to Income Ratio) determines how much of your income can go towards loan EMIs.
                            Conservative: 50% | Moderate: 55% | Aggressive: 60%. Includes RBI LTV compliance checks.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6" aria-label="Loan affordability calculation form">
                <h2 className="text-xl font-semibold text-gray-900">Income & Obligations</h2>

                {/* Income Section */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monthly Income <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            {...register('monthlyIncome', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="₹1,00,000"
                        />
                        {formValues.monthlyIncome > 0 && <AmountInWords amount={formValues.monthlyIncome} className="mt-1" />}
                        {errors.monthlyIncome && (
                            <p className="text-red-500 text-sm mt-1">{errors.monthlyIncome.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Co-Applicant Income
                        </label>
                        <input
                            type="number"
                            {...register('coApplicantIncome', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="₹0"
                        />
                        {(formValues.coApplicantIncome ?? 0) > 0 && <AmountInWords amount={formValues.coApplicantIncome ?? 0} className="mt-1" />}
                        {errors.coApplicantIncome && (
                            <p className="text-red-500 text-sm mt-1">{errors.coApplicantIncome.message}</p>
                        )}
                    </div>
                </div>

                {/* Total Income Display */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Total Monthly Income</span>
                        <span className="text-xl font-bold text-gray-900">{formatIndianCurrency(totalIncome)}</span>
                    </div>
                </div>

                {/* Obligations */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Existing Loan EMIs
                        </label>
                        <input
                            type="number"
                            {...register('existingEMIs', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="₹0"
                        />
                        {(formValues.existingEMIs ?? 0) > 0 && <AmountInWords amount={formValues.existingEMIs ?? 0} className="mt-1" />}
                        <p className="text-xs text-gray-500 mt-1">Car loan, personal loan, etc.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Other Monthly Obligations
                        </label>
                        <input
                            type="number"
                            {...register('otherObligations', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="₹0"
                        />
                        {(formValues.otherObligations ?? 0) > 0 && <AmountInWords amount={formValues.otherObligations ?? 0} className="mt-1" />}
                        <p className="text-xs text-gray-500 mt-1">Credit card payments, etc.</p>
                    </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 pt-4">Loan Parameters</h2>

                {/* Down Payment */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Down Payment Available <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        {...register('downPaymentAvailable', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="₹15,00,000"
                    />
                    {formValues.downPaymentAvailable > 0 && <AmountInWords amount={formValues.downPaymentAvailable} className="mt-1" />}
                    {errors.downPaymentAvailable && (
                        <p className="text-red-500 text-sm mt-1">{errors.downPaymentAvailable.message}</p>
                    )}
                </div>

                {/* Interest & Tenure */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Interest Rate (% p.a.)
                        </label>
                        <input
                            type="number"
                            step="0.05"
                            {...register('interestRate', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        {errors.interestRate && (
                            <p className="text-red-500 text-sm mt-1">{errors.interestRate.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loan Tenure (Years)
                        </label>
                        <input
                            type="number"
                            {...register('tenureYears', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        {errors.tenureYears && (
                            <p className="text-red-500 text-sm mt-1">{errors.tenureYears.message}</p>
                        )}
                    </div>
                </div>

                {/* FOIR Slider */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">
                            FOIR - Fixed Obligation to Income Ratio
                        </label>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${foirBadge.color}`}>
                            {formValues.foirPercentage}% - {foirBadge.label}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="40"
                        max="60"
                        step="0.05"
                        {...register('foirPercentage', { valueAsNumber: true })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>40% (Safe)</span>
                        <span>50% (Balanced)</span>
                        <span>60% (Maximum)</span>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                    Calculate Affordability
                </button>
            </form>

            {/* Results */}
            {result && (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
                            <div className="text-sm opacity-90 mb-1">Maximum Loan Amount</div>
                            <div className="text-3xl font-bold">{formatToLakhsCrores(result.maxLoanAmount)}</div>
                            <AmountInWords amount={result.maxLoanAmount} className="text-sm opacity-90 mt-2" variant="light" />
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
                            <div className="text-sm opacity-90 mb-1">Maximum Property Value</div>
                            <div className="text-3xl font-bold">{formatToLakhsCrores(result.maxPropertyValue)}</div>
                            <AmountInWords amount={result.maxPropertyValue} className="text-sm opacity-90 mt-2" variant="light" />
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
                            <div className="text-sm opacity-90 mb-1">Maximum EMI</div>
                            <div className="text-3xl font-bold">{formatIndianCurrency(result.maxAffordableEMI)}</div>
                            <AmountInWords amount={result.maxAffordableEMI} className="text-sm opacity-90 mt-2" variant="light" />
                        </div>
                    </div>

                    {/* Monthly Breakdown */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Gross Income</span>
                                <span className="font-semibold text-gray-900">{formatIndianCurrency(result.monthlyBreakdown.grossIncome)}</span>
                            </div>
                            <div className="flex justify-between items-center text-red-600">
                                <span>Existing Obligations</span>
                                <span className="font-semibold">- {formatIndianCurrency(result.monthlyBreakdown.existingObligations)}</span>
                            </div>
                            <div className="flex justify-between items-center text-blue-600">
                                <span>Maximum EMI ({formValues.foirPercentage}% FOIR)</span>
                                <span className="font-semibold">- {formatIndianCurrency(result.monthlyBreakdown.maxEMI)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Disposable Income</span>
                                <span className={`font-bold ${result.monthlyBreakdown.disposableIncome < 15000 ? 'text-red-600' : 'text-green-600'}`}>
                                    {formatIndianCurrency(result.monthlyBreakdown.disposableIncome)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Loan Details */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Down Payment</span>
                                    <span className="font-semibold">{formatIndianCurrency(result.downPaymentRequired)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Loan Amount</span>
                                    <span className="font-semibold">{formatIndianCurrency(result.maxLoanAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Property Value</span>
                                    <span className="font-semibold">{formatIndianCurrency(result.maxPropertyValue)}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">LTV Ratio</span>
                                    <span className="font-semibold">{result.ltvRatio.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">RBI Compliance</span>
                                    <span className={`font-semibold ${result.rbiCompliant ? 'text-green-600' : 'text-red-600'}`}>
                                        {result.rbiCompliant ? '✓ Compliant' : '✗ Non-Compliant'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-yellow-900 mb-3">Recommendations</h3>
                            <ul className="space-y-2">
                                {result.recommendations.map((rec, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-yellow-800">
                                        <span className="mt-0.5">•</span>
                                        <span>{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* FOIR Scenarios Comparison */}
                    {scenarios.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">FOIR Scenarios Comparison</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Scenario</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">FOIR</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Max EMI</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Max Loan</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Max Property</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">LTV</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scenarios.map((scenario, idx) => {
                                            const isCurrent = scenario.foirPercentage === formValues.foirPercentage;
                                            return (
                                                <tr
                                                    key={idx}
                                                    className={`border-b border-gray-100 ${isCurrent ? 'bg-blue-50' : ''}`}
                                                >
                                                    <td className="py-3 px-4">
                                                        <span className={`font-medium ${isCurrent ? 'text-blue-700' : 'text-gray-900'}`}>
                                                            {scenario.scenario}
                                                            {isCurrent && ' ✓'}
                                                        </span>
                                                    </td>
                                                    <td className="text-right py-3 px-4 text-gray-600">{scenario.foirPercentage}%</td>
                                                    <td className="text-right py-3 px-4 font-medium">{formatIndianCurrency(scenario.maxAffordableEMI)}</td>
                                                    <td className="text-right py-3 px-4 font-medium">{formatToLakhsCrores(scenario.maxLoanAmount)}</td>
                                                    <td className="text-right py-3 px-4 font-medium">{formatToLakhsCrores(scenario.maxPropertyValue)}</td>
                                                    <td className="text-right py-3 px-4">
                                                        <span className={scenario.ltvRatio > 80 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                                                            {scenario.ltvRatio.toFixed(1)}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
