/**
 * LoanDetailsForm Component
 * Primary input form for home loan calculator
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import type { LoanInputs } from '@/lib/types';
import { calculateEMI } from '@/lib/calculations/emi';
import { formatIndianCurrency } from '@/lib/utils';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { FloatingRateInputs } from './FloatingRateInputs';
import { HybridRateInputs } from './HybridRateInputs';

// Validation schema
const loanFormSchema = z.object({
    propertyValue: z.number().min(100000, 'Minimum property value is ₹1 lakh').max(1000000000, 'Maximum property value is ₹100 crores'),
    downPaymentPercent: z.number().min(10, 'Minimum down payment is 10%').max(90, 'Maximum down payment is 90%'),
    loanTenure: z.number().min(1, 'Minimum tenure is 1 year').max(30, 'Maximum tenure is 30 years'),
    interestRate: z.number().min(5, 'Interest rate must be at least 5%').max(20, 'Interest rate cannot exceed 20%'),
    loanType: z.enum(['floating', 'fixed', 'hybrid']),
    // Floating rate fields
    rateIncreasePercent: z.number().min(0).max(1).optional(),
    rateChangeFrequencyMonths: z.number().min(3).max(60).optional(),
    // Hybrid rate fields
    fixedPeriodMonths: z.number().min(12).optional(),
    floatingRate: z.number().min(5).max(20).optional(),
});

type LoanFormData = z.infer<typeof loanFormSchema>;

interface LoanDetailsFormProps {
    onCalculate: (inputs: LoanInputs) => void;
    initialValues?: Partial<LoanFormData>;
}

export function LoanDetailsForm({ onCalculate, initialValues }: LoanDetailsFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<LoanFormData>({
        resolver: zodResolver(loanFormSchema),
        defaultValues: {
            propertyValue: initialValues?.propertyValue || 5000000, // ₹50L default
            downPaymentPercent: initialValues?.downPaymentPercent || 20,
            loanTenure: initialValues?.loanTenure || 20,
            interestRate: initialValues?.interestRate || 9,
            loanType: initialValues?.loanType || 'floating',
            // Floating defaults
            rateIncreasePercent: 0.25,
            rateChangeFrequencyMonths: 12,
            // Hybrid defaults
            fixedPeriodMonths: 24,
            floatingRate: 9.5,
        },
    });

    const [formattedPropertyValue, setFormattedPropertyValue] = useState('');
    const [calculatedEMI, setCalculatedEMI] = useState<number>(0);
    const [calculationError, setCalculationError] = useState<string | null>(null);

    // Watch all form values for auto-calculation
    const propertyValue = watch('propertyValue');
    const downPaymentPercent = watch('downPaymentPercent');
    const loanTenure = watch('loanTenure');
    const interestRate = watch('interestRate');
    const loanType = watch('loanType');
    const rateIncreasePercent = watch('rateIncreasePercent') || 0.25;
    const rateChangeFrequencyMonths = watch('rateChangeFrequencyMonths') || 12;
    const fixedPeriodMonths = watch('fixedPeriodMonths') || 24;
    const floatingRate = watch('floatingRate') || 9.5;

    // Auto-calculate EMI when inputs change
    useEffect(() => {
        try {
            if (propertyValue && downPaymentPercent && loanTenure && interestRate) {
                const loanAmount = propertyValue * (1 - downPaymentPercent / 100);
                const emi = calculateEMI(loanAmount, interestRate, loanTenure);
                setCalculatedEMI(emi);
                setCalculationError(null);
            }
        } catch (error) {
            setCalculationError(error instanceof Error ? error.message : 'Calculation error occurred');
            setCalculatedEMI(0);
        }
    }, [propertyValue, downPaymentPercent, loanTenure, interestRate]);

    // Handle property value input with Indian formatting
    const handlePropertyValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        if (rawValue) {
            const numValue = parseInt(rawValue, 10);
            setValue('propertyValue', numValue);
            setFormattedPropertyValue(rawValue);
        } else {
            setValue('propertyValue', 0);
            setFormattedPropertyValue('');
        }
    };

    const handlePropertyValueBlur = () => {
        if (propertyValue) {
            setFormattedPropertyValue(formatIndianCurrency(propertyValue).replace('₹', '').trim());
        }
    };
    const handlePropertyValueFocus = () => {
        setFormattedPropertyValue(propertyValue.toString());
    };

    const onSubmit = (data: LoanFormData) => {
        const loanAmount = data.propertyValue * (1 - data.downPaymentPercent / 100);
        const downPayment = data.propertyValue * (data.downPaymentPercent / 100);

        const loanInputs: LoanInputs = {
            propertyValue: data.propertyValue,
            downPayment,
            loanAmount,
            interestRate: data.interestRate,
            loanTenure: data.loanTenure,
            loanType: data.loanType,
            // Include floating/hybrid fields
            rateIncreasePercent: data.rateIncreasePercent,
            rateChangeFrequencyMonths: data.rateChangeFrequencyMonths,
            fixedPeriodMonths: data.fixedPeriodMonths,
            floatingRate: data.floatingRate,
        };

        onCalculate(loanInputs);
    };

    const downPaymentAmount = propertyValue * (downPaymentPercent / 100);
    const loanAmount = propertyValue - downPaymentAmount;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Home loan calculation form">
            <div className="space-y-4">
                {/* Property Value */}
                <div>
                    <label htmlFor="propertyValue" className="block text-sm font-medium text-gray-700 mb-1">
                        Property Value
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <input
                            id="propertyValue"
                            type="text"
                            value={formattedPropertyValue || propertyValue}
                            onChange={handlePropertyValueChange}
                            onBlur={handlePropertyValueBlur}
                            onFocus={handlePropertyValueFocus}
                            className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="50,00,000"
                            aria-label="Property value in rupees"
                            aria-describedby="propertyValue-help propertyValue-error"
                            aria-invalid={!!errors.propertyValue}
                            aria-required="true"
                        />
                    </div>
                    {errors.propertyValue && (
                        <p id="propertyValue-error" className="mt-1 text-sm text-red-600" role="alert">{errors.propertyValue.message}</p>
                    )}
                    <p id="propertyValue-help" className="mt-1 text-xs text-gray-500">
                        Enter property market value
                    </p>
                </div>

                {/* Down Payment Percentage */}
                <div>
                    <label htmlFor="downPaymentPercent" className="block text-sm font-medium text-gray-700 mb-1">
                        Down Payment: <span aria-live="polite">{downPaymentPercent}%</span> ({formatIndianCurrency(downPaymentAmount)})
                    </label>
                    <input
                        id="downPaymentPercent"
                        type="range"
                        min="10"
                        max="90"
                        step="0.05"
                        {...register('downPaymentPercent', { valueAsNumber: true })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        aria-label="Down payment percentage"
                        aria-valuemin={10}
                        aria-valuemax={90}
                        aria-valuenow={downPaymentPercent}
                        aria-valuetext={`${downPaymentPercent} percent, ${formatIndianCurrency(downPaymentAmount)}`}
                    />
                    {errors.downPaymentPercent && (
                        <p id="downPaymentPercent-error" className="mt-1 text-sm text-red-600" role="alert">{errors.downPaymentPercent.message}</p>
                    )}
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>10% (Min)</span>
                        <span>90% (Max)</span>
                    </div>
                </div>

                {/* Loan Amount (Calculated) */}
                <div className="bg-blue-50 p-3 rounded-md" role="status" aria-live="polite" aria-atomic="true">
                    <p className="text-sm text-gray-600" id="loanAmount-label">Loan Amount</p>
                    <p className="text-2xl font-bold text-blue-600" aria-labelledby="loanAmount-label">{formatIndianCurrency(loanAmount)}</p>
                </div>

                {/* Interest Rate */}
                <div>
                    <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-1">
                        Interest Rate: <span aria-live="polite">{interestRate}%</span> p.a.
                    </label>
                    <input
                        id="interestRate"
                        type="range"
                        min="5"
                        max="20"
                        step="0.05"
                        {...register('interestRate', { valueAsNumber: true })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        aria-label="Interest rate percentage per annum"
                        aria-valuemin={5}
                        aria-valuemax={20}
                        aria-valuenow={interestRate}
                        aria-valuetext={`${interestRate} percent per annum`}
                    />
                    {errors.interestRate && (
                        <p id="interestRate-error" className="mt-1 text-sm text-red-600" role="alert">{errors.interestRate.message}</p>
                    )}
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>5%</span>
                        <span>20%</span>
                    </div>
                </div>

                {/* Loan Tenure */}
                <div>
                    <label htmlFor="loanTenure" className="block text-sm font-medium text-gray-700 mb-1">
                        Loan Tenure: <span aria-live="polite">{loanTenure} years</span>
                    </label>
                    <input
                        id="loanTenure"
                        type="range"
                        min="1"
                        max="30"
                        step="0.05"
                        {...register('loanTenure', { valueAsNumber: true })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        aria-label="Loan tenure in years"
                        aria-valuemin={1}
                        aria-valuemax={30}
                        aria-valuenow={loanTenure}
                        aria-valuetext={`${loanTenure} years`}
                    />
                    {errors.loanTenure && (
                        <p id="loanTenure-error" className="mt-1 text-sm text-red-600" role="alert">{errors.loanTenure.message}</p>
                    )}
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1 year</span>
                        <span>30 years</span>
                    </div>
                </div>

                {/* Loan Type */}
                <div>
                    <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 mb-1">
                        Loan Type
                    </label>
                    <select
                        id="loanType"
                        {...register('loanType')}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        aria-label="Loan type selection"
                        aria-describedby="loanType-help"
                    >
                        <option value="floating">Floating Rate (Most Common)</option>
                        <option value="fixed">Fixed Rate</option>
                        <option value="hybrid">Hybrid (Fixed + Floating)</option>
                    </select>
                    {errors.loanType && (
                        <p id="loanType-error" className="mt-1 text-sm text-red-600" role="alert">{errors.loanType.message}</p>
                    )}
                </div>

                {/* Conditional: Floating Rate Inputs */}
                {loanType === 'floating' && (
                    <FloatingRateInputs
                        rateIncreasePercent={rateIncreasePercent}
                        rateChangeFrequencyMonths={rateChangeFrequencyMonths}
                        register={register}
                        setValue={setValue}
                        errors={errors}
                        baseRate={interestRate}
                        tenureYears={loanTenure}
                    />
                )}

                {/* Conditional: Hybrid Rate Inputs */}
                {loanType === 'hybrid' && (
                    <HybridRateInputs
                        fixedPeriodMonths={fixedPeriodMonths}
                        fixedRate={interestRate}
                        floatingRate={floatingRate}
                        rateIncreasePercent={rateIncreasePercent}
                        rateChangeFrequencyMonths={rateChangeFrequencyMonths}
                        register={register}
                        setValue={setValue}
                        errors={errors}
                        tenureYears={loanTenure}
                    />
                )}

                {/* Fixed Rate Note */}
                {loanType === 'fixed' && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-xs text-gray-600">
                            <strong>Fixed Rate:</strong> EMI remains constant throughout the {loanTenure}-year tenure at {interestRate}% p.a.
                        </p>
                    </div>
                )}

                {/* EMI Preview */}
                {calculationError && (
                    <ErrorMessage message={calculationError} type="error" />
                )}

                {calculatedEMI > 0 && !calculationError && (
                    <div className="bg-green-50 p-4 rounded-md border border-green-200" role="status" aria-live="polite" aria-atomic="true">
                        <p className="text-sm text-gray-600" id="emi-preview-label">Estimated Monthly EMI</p>
                        <p className="text-3xl font-bold text-green-600" aria-labelledby="emi-preview-label">{formatIndianCurrency(calculatedEMI)}</p>
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
                Calculate Detailed Breakdown
            </button>
        </form>
    );
}
