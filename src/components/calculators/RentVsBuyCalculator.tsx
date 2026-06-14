/**
 * Rent vs Buy Calculator Component
 * Compare buying a home (mortgage + maintenance, building equity) against renting
 * and investing the money buying would tie up, over a chosen horizon.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { calculateRentVsBuy } from '@/lib/calculations/rentVsBuy';
import { formatIndianCurrency, formatToLakhsCrores } from '@/lib/utils';
import type { RentVsBuyInputs, RentVsBuyResult } from '@/lib/types';
import { AmountInWords } from '@/components/ui/AmountInWords';
import { RentVsBuyChart } from '@/components/charts/RentVsBuyChart';

// ============================================================================
// FORM SCHEMA
// ============================================================================

const rentVsBuySchema = z.object({
    propertyValue: z.number().min(100000, 'Minimum ₹1,00,000').max(500000000, 'Maximum ₹50Cr'),
    downPayment: z.number().min(0).max(500000000),
    loanTenure: z.number().min(1).max(30),
    interestRate: z.number().min(1).max(20),
    stampDutyRate: z.number().min(0).max(15),
    maintenanceCost: z.number().min(0).max(1000000),
    propertyAppreciation: z.number().min(0).max(30),
    monthlyRent: z.number().min(1000, 'Minimum ₹1,000').max(5000000),
    rentEscalation: z.number().min(0).max(30),
    investmentReturn: z.number().min(0).max(30),
    analysisYears: z.number().min(1).max(30),
})
    .refine((d) => d.downPayment < d.propertyValue, {
        message: 'Down payment must be less than the property value',
        path: ['downPayment'],
    });

type RentVsBuyFormData = z.infer<typeof rentVsBuySchema>;

// ============================================================================
// COMPONENT
// ============================================================================

export function RentVsBuyCalculator() {
    const [result, setResult] = useState<RentVsBuyResult | null>(null);
    // Snapshot of the inputs the result was computed from — drives the year-by-year chart.
    const [appliedInputs, setAppliedInputs] = useState<RentVsBuyInputs | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RentVsBuyFormData>({
        resolver: zodResolver(rentVsBuySchema),
        defaultValues: {
            propertyValue: 8000000,
            downPayment: 1600000,
            loanTenure: 20,
            interestRate: 8.5,
            stampDutyRate: 6,
            maintenanceCost: 3000,
            propertyAppreciation: 7,
            monthlyRent: 25000,
            rentEscalation: 5,
            investmentReturn: 8,
            analysisYears: 15,
        },
    });

    // eslint-disable-next-line react-hooks/incompatible-library -- RHF's watch() returns un-memoizable functions; this is intended form usage with no defect.
    const formValues = watch();

    const onSubmit = (data: RentVsBuyFormData) => {
        setResult(calculateRentVsBuy(data));
        setAppliedInputs(data);
    };

    return (
        <div className="w-full p-6 space-y-6" role="region" aria-label="Rent vs Buy calculator">

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" role="complementary" aria-label="Rent vs buy information">
                <div className="flex items-start gap-3">
                    <span className="text-2xl" role="img" aria-label="Information">ℹ️</span>
                    <div className="flex-1 text-sm">
                        <p className="font-semibold text-blue-900 mb-1">Rent vs Buy</p>
                        <p className="text-blue-800">
                            Compare buying (down payment, stamp duty, EMI, maintenance — building equity in
                            an appreciating home) against renting and investing the money buying would tie up.
                            We compare your net wealth position under each path at the end of the horizon.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6" aria-label="Rent vs buy calculation form">
                <h2 className="text-xl font-semibold text-gray-900">Buy Option</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Property Value <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            {...register('propertyValue', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="₹80,00,000"
                        />
                        {formValues.propertyValue > 0 && <AmountInWords amount={formValues.propertyValue} className="mt-1" />}
                        {errors.propertyValue && (
                            <p className="text-red-500 text-sm mt-1">{errors.propertyValue.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Down Payment <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            {...register('downPayment', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="₹16,00,000"
                        />
                        {formValues.downPayment > 0 && <AmountInWords amount={formValues.downPayment} className="mt-1" />}
                        {errors.downPayment && (
                            <p className="text-red-500 text-sm mt-1">{errors.downPayment.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loan Tenure (Years) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            {...register('loanTenure', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        {errors.loanTenure && (
                            <p className="text-red-500 text-sm mt-1">{errors.loanTenure.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loan Interest Rate (% p.a.) <span className="text-red-500">*</span>
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
                            Stamp Duty Rate (% of value) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            {...register('stampDutyRate', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500 mt-1">A one-time acquisition cost, typically 5–8% depending on the state.</p>
                        {errors.stampDutyRate && (
                            <p className="text-red-500 text-sm mt-1">{errors.stampDutyRate.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monthly Maintenance <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            {...register('maintenanceCost', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="₹3,000"
                        />
                        <p className="text-xs text-gray-500 mt-1">Society / upkeep cost the buyer pays but the renter does not.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Property Appreciation (% p.a.) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            {...register('propertyAppreciation', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        {errors.propertyAppreciation && (
                            <p className="text-red-500 text-sm mt-1">{errors.propertyAppreciation.message}</p>
                        )}
                    </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 pt-4">Rent &amp; Invest Option</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monthly Rent <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            {...register('monthlyRent', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="₹25,000"
                        />
                        {formValues.monthlyRent > 0 && <AmountInWords amount={formValues.monthlyRent} className="mt-1" />}
                        {errors.monthlyRent && (
                            <p className="text-red-500 text-sm mt-1">{errors.monthlyRent.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rent Escalation (% p.a.) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            {...register('rentEscalation', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        {errors.rentEscalation && (
                            <p className="text-red-500 text-sm mt-1">{errors.rentEscalation.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Investment Return (% p.a.) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            {...register('investmentReturn', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500 mt-1">Expected return on the down payment + monthly surplus the renter invests.</p>
                        {errors.investmentReturn && (
                            <p className="text-red-500 text-sm mt-1">{errors.investmentReturn.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Analysis Horizon (Years) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            {...register('analysisYears', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500 mt-1">How long you plan to stay in the home / hold the investment.</p>
                        {errors.analysisYears && (
                            <p className="text-red-500 text-sm mt-1">{errors.analysisYears.message}</p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                    Compare Rent vs Buy
                </button>
            </form>

            {/* Results */}
            {result && appliedInputs && (
                <div className="space-y-6">
                    {/* Recommendation Banner */}
                    <div className={`rounded-lg p-6 text-white ${result.recommendation === 'buy' ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl" role="img" aria-label={result.recommendation === 'buy' ? 'Buying favoured' : 'Renting favoured'}>
                                {result.recommendation === 'buy' ? '🏠' : '🔑'}
                            </span>
                            <div>
                                <p className="text-xl font-bold">
                                    {result.recommendation === 'buy'
                                        ? 'Buying comes out ahead'
                                        : 'Renting & investing comes out ahead'}
                                </p>
                                <p className="text-sm opacity-90">
                                    By {formatIndianCurrency(Math.abs(result.difference))} over {appliedInputs.analysisYears} years.
                                    {result.recommendation === 'buy'
                                        ? ` Buying breaks even in year ${result.breakEvenYear}.`
                                        : ' Buying does not come out ahead within this horizon.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Assumption-sensitivity caveat */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4" role="note">
                        <p className="text-sm text-amber-800">
                            <span className="font-semibold">This result is highly sensitive to your assumptions.</span>{' '}
                            It swings on property appreciation ({appliedInputs.propertyAppreciation}%) versus investment
                            return ({appliedInputs.investmentReturn}%) — small changes can flip the recommendation.
                            Treat it as a guide, not a verdict, and try a few scenarios.
                        </p>
                    </div>

                    {/* Buy vs Rent Comparison */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Buy vs Rent &amp; Invest</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Buy</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Rent &amp; Invest</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4 text-gray-600">Upfront Costs</td>
                                        <td className="text-right py-3 px-4 font-medium">{formatIndianCurrency(result.buyAnalysis.upfrontCosts)}</td>
                                        <td className="text-right py-3 px-4 font-medium text-gray-400">—</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4 text-gray-600">Monthly Outflow</td>
                                        <td className="text-right py-3 px-4 font-medium">{formatIndianCurrency(result.buyAnalysis.monthlyOutflow)}</td>
                                        <td className="text-right py-3 px-4 font-medium">{formatIndianCurrency(result.rentAnalysis.monthlyRent)}</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4 text-gray-600">Total Cash Outflow / Rent Paid</td>
                                        <td className="text-right py-3 px-4 font-medium">{formatToLakhsCrores(result.buyAnalysis.totalCashOutflow)}</td>
                                        <td className="text-right py-3 px-4 font-medium">{formatToLakhsCrores(result.rentAnalysis.totalRentPaid)}</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4 text-gray-600">Asset at Horizon</td>
                                        <td className="text-right py-3 px-4 font-medium">{formatToLakhsCrores(result.buyAnalysis.netEquity)} <span className="text-xs text-gray-400">equity</span></td>
                                        <td className="text-right py-3 px-4 font-medium">{formatToLakhsCrores(result.rentAnalysis.investmentCorpus)} <span className="text-xs text-gray-400">corpus</span></td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 text-gray-700 font-medium">Net Position</td>
                                        <td className={`text-right py-3 px-4 font-bold ${result.recommendation === 'buy' ? 'text-green-600' : 'text-gray-900'}`}>{formatToLakhsCrores(result.buyAnalysis.netPosition)}</td>
                                        <td className={`text-right py-3 px-4 font-bold ${result.recommendation === 'rent' ? 'text-blue-600' : 'text-gray-900'}`}>{formatToLakhsCrores(result.rentAnalysis.netPosition)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                            Net position = the asset you hold at the horizon (home equity, or invested corpus) minus the
                            housing cash you spent getting there (total cash outflow, or total rent paid).
                        </p>
                    </div>

                    {/* Buy-side detail */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Buy Side</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Future Property Value</span>
                                    <span className="font-semibold text-gray-900">{formatToLakhsCrores(result.buyAnalysis.futurePropertyValue)}</span>
                                </div>
                                <div className="flex justify-between items-center text-red-600">
                                    <span>Outstanding Loan</span>
                                    <span className="font-semibold">- {formatToLakhsCrores(result.buyAnalysis.outstandingLoan)}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between items-center">
                                    <span className="text-gray-700 font-medium">Net Equity</span>
                                    <span className="font-bold text-gray-900">{formatToLakhsCrores(result.buyAnalysis.netEquity)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rent &amp; Invest Side</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Investment Corpus</span>
                                    <span className="font-semibold text-gray-900">{formatToLakhsCrores(result.rentAnalysis.investmentCorpus)}</span>
                                </div>
                                <div className="flex justify-between items-center text-red-600">
                                    <span>Total Rent Paid</span>
                                    <span className="font-semibold">- {formatToLakhsCrores(result.rentAnalysis.totalRentPaid)}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between items-center">
                                    <span className="text-gray-700 font-medium">Net Position</span>
                                    <span className="font-bold text-gray-900">{formatToLakhsCrores(result.rentAnalysis.netPosition)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <RentVsBuyChart inputs={appliedInputs} breakEvenYear={result.breakEvenYear} />
                </div>
            )}
        </div>
    );
}
