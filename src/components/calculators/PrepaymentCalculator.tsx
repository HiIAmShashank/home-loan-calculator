/**
 * PrepaymentCalculator Component
 * Analyze impact of prepayments on loan tenure and interest savings
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    generateAmortizationSchedule,
    generateScheduleWithLumpSum,
    compareSchedules
} from '@/lib/calculations/amortization';
import { formatIndianCurrency } from '@/lib/utils';
import { AmountInWords } from '@/components/ui/AmountInWords';
import { AmountWithTooltip } from '@/components/ui/AmountWithTooltip';

const prepaymentFormSchema = z.object({
    principal: z.number().min(100000).max(100000000),
    annualRate: z.number().min(5).max(20),
    tenureYears: z.number().min(1).max(30),
    prepaymentType: z.enum(['lump-sum', 'monthly', 'yearly']),
    prepaymentAmount: z.number().min(0).max(50000000),
    startMonth: z.number().min(1).max(360),
    impactPreference: z.enum(['reduce-tenure', 'reduce-emi']),
});

type PrepaymentFormData = z.infer<typeof prepaymentFormSchema>;

interface PrepaymentCalculatorProps {
    defaultPrincipal?: number;
    defaultRate?: number;
    defaultTenure?: number;
}

export function PrepaymentCalculator({
    defaultPrincipal = 5000000,
    defaultRate = 9,
    defaultTenure = 20,
}: PrepaymentCalculatorProps) {
    const [baseSchedule, setBaseSchedule] = useState<ReturnType<typeof generateAmortizationSchedule> | null>(null);
    const [prepaySchedule, setPrepaySchedule] = useState<ReturnType<typeof generateAmortizationSchedule> | null>(null);
    const [comparison, setComparison] = useState<ReturnType<typeof compareSchedules> | null>(null);
    const [scenarios, setScenarios] = useState<Array<{ amount: number; interestSaved: number; monthsSaved: number }>>([]);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<PrepaymentFormData>({
        resolver: zodResolver(prepaymentFormSchema),
        defaultValues: {
            principal: defaultPrincipal,
            annualRate: defaultRate,
            tenureYears: defaultTenure,
            prepaymentType: 'monthly',
            prepaymentAmount: 5000,
            startMonth: 1,
            impactPreference: 'reduce-tenure',
        },
    });

    const prepaymentType = watch('prepaymentType');
    const prepaymentAmount = watch('prepaymentAmount');
    const principal = watch('principal');

    const onSubmit = (data: PrepaymentFormData) => {
        const base = generateAmortizationSchedule(data.principal, data.annualRate, data.tenureYears);
        let withPrepayment;

        if (data.prepaymentType === 'lump-sum') {
            withPrepayment = generateScheduleWithLumpSum(
                data.principal,
                data.annualRate,
                data.tenureYears,
                [{ month: data.startMonth, amount: data.prepaymentAmount }]
            );
        } else {
            // For recurring, create multiple lump sum payments
            const frequency = data.prepaymentType === 'monthly' ? 1 : 12;
            const payments: Array<{ month: number; amount: number }> = [];
            for (let m = data.startMonth; m <= data.tenureYears * 12; m += frequency) {
                payments.push({ month: m, amount: data.prepaymentAmount });
            }
            withPrepayment = generateScheduleWithLumpSum(
                data.principal,
                data.annualRate,
                data.tenureYears,
                payments
            );
        }

        setBaseSchedule(base);
        setPrepaySchedule(withPrepayment);
        const result = compareSchedules(base, withPrepayment);
        setComparison(result);

        // Generate multiple scenarios for comparison
        if (data.prepaymentType === 'monthly') {
            const amounts = [5000, 10000, 15000, 20000];
            const scenarioResults = amounts.map(amount => {
                const payments: Array<{ month: number; amount: number }> = [];
                for (let m = 1; m <= data.tenureYears * 12; m++) {
                    payments.push({ month: m, amount });
                }
                const schedule = generateScheduleWithLumpSum(
                    data.principal,
                    data.annualRate,
                    data.tenureYears,
                    payments
                );
                const comp = compareSchedules(base, schedule);
                return {
                    amount,
                    interestSaved: comp.interestSaved,
                    monthsSaved: comp.monthsSaved,
                };
            });
            setScenarios(scenarioResults);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow" role="region" aria-labelledby="prepay-calc-heading">
                <p className="text-sm text-gray-600 mb-6">
                    See how extra payments can reduce your loan tenure and save on interest
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Prepayment calculation form">
                    {/* Base Loan Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Loan Amount (₹)
                            </label>
                            <input
                                type="number"
                                {...register('principal', { valueAsNumber: true })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                            {principal > 0 && <AmountInWords amount={principal} className="mt-1" />}
                            {errors.principal && (
                                <p className="mt-1 text-sm text-red-600">{errors.principal.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Interest Rate (%)
                            </label>
                            <input
                                type="number"
                                step="0.05"
                                {...register('annualRate', { valueAsNumber: true })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.annualRate && (
                                <p className="mt-1 text-sm text-red-600">{errors.annualRate.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tenure (Years)
                            </label>
                            <input
                                type="number"
                                {...register('tenureYears', { valueAsNumber: true })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.tenureYears && (
                                <p className="mt-1 text-sm text-red-600">{errors.tenureYears.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Prepayment Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prepayment Type
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="lump-sum"
                                    {...register('prepaymentType')}
                                    className="mr-2"
                                />
                                <span className="text-sm">One-time Lump Sum</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="monthly"
                                    {...register('prepaymentType')}
                                    className="mr-2"
                                />
                                <span className="text-sm">Monthly Extra Payment</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="yearly"
                                    {...register('prepaymentType')}
                                    className="mr-2"
                                />
                                <span className="text-sm">Yearly Extra Payment</span>
                            </label>
                        </div>
                    </div>

                    {/* Prepayment Amount and Start Month */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {prepaymentType === 'lump-sum' ? 'Lump Sum Amount (₹)' : 'Extra Payment Amount (₹)'}
                            </label>
                            <input
                                type="number"
                                {...register('prepaymentAmount', { valueAsNumber: true })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder={prepaymentType === 'monthly' ? '5,000' : '1,00,000'}
                            />
                            {errors.prepaymentAmount && (
                                <p className="mt-1 text-sm text-red-600">{errors.prepaymentAmount.message}</p>
                            )}
                            {(prepaymentAmount ?? 0) > 0 && <AmountInWords amount={prepaymentAmount ?? 0} className="mt-1" />}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Month
                            </label>
                            <input
                                type="number"
                                {...register('startMonth', { valueAsNumber: true })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="1"
                            />
                            {errors.startMonth && (
                                <p className="mt-1 text-sm text-red-600">{errors.startMonth.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Impact Preference */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            How to use extra payment?
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="reduce-tenure"
                                    {...register('impactPreference')}
                                    className="mr-2"
                                />
                                <span className="text-sm">Reduce Tenure (keep EMI same)</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="reduce-emi"
                                    {...register('impactPreference')}
                                    className="mr-2"
                                />
                                <span className="text-sm">Reduce EMI (keep tenure same)</span>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Calculate Prepayment Impact
                    </button>
                </form>
            </div>

            {/* Results */}
            {comparison && (
                <div className="space-y-6">
                    {/* Key Savings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
                            <p className="text-sm opacity-90 mb-1">Interest Saved</p>
                            <p className="text-3xl font-bold">{formatIndianCurrency(comparison.interestSaved)}</p>
                            <AmountInWords amount={comparison.interestSaved} className="text-sm opacity-90 mt-2" variant="light" />
                        </div>
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
                            <p className="text-sm opacity-90 mb-1">Months Saved</p>
                            <p className="text-3xl font-bold">{comparison.monthsSaved}</p>
                            <p className="text-sm opacity-90">({(comparison.monthsSaved / 12).toFixed(1)} years)</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow">
                            <p className="text-sm opacity-90 mb-1">Total Savings</p>
                            <p className="text-3xl font-bold">{formatIndianCurrency(comparison.totalSaved)}</p>
                            <AmountInWords amount={comparison.totalSaved} className="text-sm opacity-90 mt-2" variant="light" />
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Comparison</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Without Prepayment</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">With Prepayment</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Difference</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-6 py-4 text-sm text-gray-900">Total Interest</td>
                                        <td className="px-6 py-4 text-sm text-right text-gray-900">
                                            <AmountWithTooltip amount={baseSchedule?.totalInterest || 0} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right text-blue-600 font-medium">
                                            <AmountWithTooltip amount={prepaySchedule?.totalInterest || 0} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right text-green-600 font-medium">
                                            -<AmountWithTooltip amount={comparison.interestSaved} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 text-sm text-gray-900">Total Amount Paid</td>
                                        <td className="px-6 py-4 text-sm text-right text-gray-900">
                                            <AmountWithTooltip amount={baseSchedule?.totalAmount || 0} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right text-blue-600 font-medium">
                                            <AmountWithTooltip amount={prepaySchedule?.totalAmount || 0} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right text-green-600 font-medium">
                                            -<AmountWithTooltip amount={comparison.totalSaved} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 text-sm text-gray-900">Tenure (Months)</td>
                                        <td className="px-6 py-4 text-sm text-right text-gray-900">
                                            {baseSchedule?.schedule.length || 0}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right text-blue-600 font-medium">
                                            {prepaySchedule?.schedule.length || 0}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right text-green-600 font-medium">
                                            -{comparison.monthsSaved} months
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ROI Analysis */}
                    {prepaymentAmount > 0 && prepaySchedule && (
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Return on Investment</h3>
                            <p className="text-sm text-gray-700 mb-2">
                                Every ₹{prepaymentAmount.toLocaleString('en-IN')} you pay extra saves you approximately{' '}
                                <span className="font-bold text-blue-600">
                                    {formatIndianCurrency((comparison.interestSaved / (prepaymentType === 'lump-sum' ? prepaymentAmount : prepaymentAmount * prepaySchedule.schedule.length)) * prepaymentAmount)}
                                </span>{' '}
                                in interest.
                            </p>
                            <p className="text-xs text-gray-600">
                                ROI: {(((comparison.interestSaved) / (prepaymentType === 'lump-sum' ? prepaymentAmount : prepaymentAmount * prepaySchedule.schedule.length)) * 100).toFixed(1)}% over the loan tenure
                            </p>
                        </div>
                    )}

                    {/* Multiple Scenarios */}
                    {scenarios.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Compare Different Monthly Prepayments</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {scenarios.map((scenario, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg border-2 ${scenario.amount === prepaymentAmount
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 bg-white'
                                            }`}
                                    >
                                        <p className="text-sm text-gray-600 mb-1">Extra ₹{scenario.amount.toLocaleString('en-IN')}/month</p>
                                        <p className="text-lg font-bold text-green-600 mb-2">
                                            Save {formatIndianCurrency(scenario.interestSaved)}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Finish {scenario.monthsSaved} months early
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
