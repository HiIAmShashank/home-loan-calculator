/**
 * Balance Transfer Calculator Component
 * Compare staying on the current home loan against refinancing the outstanding
 * balance (optionally with a top-up) to a new lender at a different rate.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { calculateBalanceTransfer } from '@/lib/calculations/balanceTransfer';
import { formatIndianCurrency, formatToLakhsCrores } from '@/lib/utils';
import type { BalanceTransferAnalysis } from '@/lib/types';
import { AmountInWords } from '@/components/ui/AmountInWords';
import { BalanceTransferChart } from '@/components/charts/BalanceTransferChart';

// ============================================================================
// FORM SCHEMA
// ============================================================================

const balanceTransferSchema = z.object({
    currentOutstanding: z.number().min(100000, 'Minimum ₹1,00,000').max(100000000, 'Maximum ₹10Cr'),
    currentInterestRate: z.number().min(5).max(20),
    currentTenureRemaining: z.number().min(1).max(30),
    currentEMI: z.number().min(1000, 'Minimum ₹1,000').max(2000000),
    newInterestRate: z.number().min(5).max(20),
    // Optional because keepSameEMI solves for the tenure instead. A blank input is
    // normalised to undefined via setValueAs at the register site.
    newTenure: z.number().min(1).max(30).optional(),
    keepSameEMI: z.boolean(),
    topUpLoan: z.number().min(0).max(50000000),
    processingFee: z.number().min(0).max(5000000),
    legalCharges: z.number().min(0).max(5000000),
    foreclosureCharges: z.number().min(0).max(5000000),
    stampDutyOnTransfer: z.number().min(0).max(5000000),
})
    .refine((d) => d.keepSameEMI || d.newTenure !== undefined, {
        message: 'Enter a new tenure, or check "keep the same EMI"',
        path: ['newTenure'],
    })
    .refine((d) => d.currentEMI * d.currentTenureRemaining * 12 >= d.currentOutstanding, {
        message: 'EMI × tenure must at least repay the outstanding balance',
        path: ['currentEMI'],
    });

type BalanceTransferFormData = z.infer<typeof balanceTransferSchema>;

// ============================================================================
// HELPERS
// ============================================================================

function formatMonths(months: number): string {
    if (!Number.isFinite(months)) return '—';
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (years === 0) return `${rem} mo`;
    if (rem === 0) return `${years} yr`;
    return `${years} yr ${rem} mo`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BalanceTransferCalculator() {
    const [result, setResult] = useState<BalanceTransferAnalysis | null>(null);
    // Submit-time snapshot so result labels reflect what was computed, not live form state.
    const [appliedKeepSameEMI, setAppliedKeepSameEMI] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<BalanceTransferFormData>({
        resolver: zodResolver(balanceTransferSchema),
        defaultValues: {
            currentOutstanding: 5000000,
            currentInterestRate: 9.5,
            currentTenureRemaining: 15,
            currentEMI: 52206,
            newInterestRate: 8.5,
            newTenure: 15,
            keepSameEMI: false,
            topUpLoan: 0,
            processingFee: 10000,
            legalCharges: 5000,
            foreclosureCharges: 0,
            stampDutyOnTransfer: 0,
        },
    });

    // eslint-disable-next-line react-hooks/incompatible-library -- RHF's watch() returns un-memoizable functions; this is intended form usage with no defect.
    const formValues = watch();
    const keepSameEMI = formValues.keepSameEMI;

    const onSubmit = (data: BalanceTransferFormData) => {
        setResult(
            calculateBalanceTransfer({
                currentOutstanding: data.currentOutstanding,
                currentInterestRate: data.currentInterestRate,
                currentTenureRemaining: data.currentTenureRemaining,
                currentEMI: data.currentEMI,
                newInterestRate: data.newInterestRate,
                // keepSameEMI solves for the tenure, so the requested newTenure is ignored.
                newTenure: data.keepSameEMI ? undefined : data.newTenure,
                processingFee: data.processingFee,
                legalCharges: data.legalCharges,
                foreclosureCharges: data.foreclosureCharges,
                stampDutyOnTransfer: data.stampDutyOnTransfer,
                topUpLoan: data.topUpLoan,
                keepSameEMI: data.keepSameEMI,
            })
        );
        setAppliedKeepSameEMI(data.keepSameEMI);
    };

    return (
        <div className="w-full p-6 space-y-6" role="region" aria-labelledby="balance-transfer-heading">

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" role="complementary" aria-label="Balance transfer information">
                <div className="flex items-start gap-3">
                    <span className="text-2xl" role="img" aria-label="Information">ℹ️</span>
                    <div className="flex-1 text-sm">
                        <p className="font-semibold text-blue-900 mb-1">Balance Transfer / Refinance</p>
                        <p className="text-blue-800">
                            Compare your current loan against switching the outstanding balance to a new
                            lender at a lower rate. The switch only pays off once its interest savings
                            recover the one-time costs (the break-even point).
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6" aria-label="Balance transfer calculation form">
                <h2 className="text-xl font-semibold text-gray-900">Current Loan</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Outstanding Balance <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            {...register('currentOutstanding', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="₹50,00,000"
                        />
                        {formValues.currentOutstanding > 0 && <AmountInWords amount={formValues.currentOutstanding} className="mt-1" />}
                        {errors.currentOutstanding && (
                            <p className="text-red-500 text-sm mt-1">{errors.currentOutstanding.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current EMI <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            {...register('currentEMI', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="₹52,206"
                        />
                        {formValues.currentEMI > 0 && <AmountInWords amount={formValues.currentEMI} className="mt-1" />}
                        {errors.currentEMI && (
                            <p className="text-red-500 text-sm mt-1">{errors.currentEMI.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Interest Rate (% p.a.)
                        </label>
                        <input
                            type="number"
                            step="0.05"
                            {...register('currentInterestRate', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500 mt-1">Reference only — the current loan is computed from your actual EMI above.</p>
                        {errors.currentInterestRate && (
                            <p className="text-red-500 text-sm mt-1">{errors.currentInterestRate.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tenure Remaining (Years)
                        </label>
                        <input
                            type="number"
                            {...register('currentTenureRemaining', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        {errors.currentTenureRemaining && (
                            <p className="text-red-500 text-sm mt-1">{errors.currentTenureRemaining.message}</p>
                        )}
                    </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 pt-4">New Loan</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Interest Rate (% p.a.) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.05"
                            {...register('newInterestRate', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        {errors.newInterestRate && (
                            <p className="text-red-500 text-sm mt-1">{errors.newInterestRate.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Tenure (Years)
                        </label>
                        <input
                            type="number"
                            disabled={keepSameEMI}
                            {...register('newTenure', {
                                setValueAs: (v) => (v === '' || v === null || Number.isNaN(Number(v)) ? undefined : Number(v)),
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-400"
                        />
                        {keepSameEMI ? (
                            <p className="text-xs text-gray-500 mt-1">Ignored while &ldquo;keep same EMI&rdquo; is on — the tenure is solved for.</p>
                        ) : (
                            errors.newTenure && <p className="text-red-500 text-sm mt-1">{errors.newTenure.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Top-up Loan (optional)
                        </label>
                        <input
                            type="number"
                            {...register('topUpLoan', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="₹0"
                        />
                        {(formValues.topUpLoan ?? 0) > 0 && <AmountInWords amount={formValues.topUpLoan} className="mt-1" />}
                        <p className="text-xs text-gray-500 mt-1">Extra borrowing added to the new loan principal.</p>
                    </div>

                    <div className="flex items-center">
                        <label className="flex items-start gap-2 mt-6">
                            <input type="checkbox" {...register('keepSameEMI')} className="mt-1" />
                            <span className="text-sm">
                                <span className="font-medium">Keep the same EMI</span> — pay the current
                                instalment on the new rate to finish sooner instead of lowering the EMI.
                            </span>
                        </label>
                    </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 pt-4">Switching Costs</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Processing Fee
                        </label>
                        <input
                            type="number"
                            {...register('processingFee', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="₹10,000"
                        />
                        <p className="text-xs text-gray-500 mt-1">New lender's processing fee (often ~0.5% of the loan).</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Legal & Valuation Charges
                        </label>
                        <input
                            type="number"
                            {...register('legalCharges', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="₹5,000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Foreclosure Charges
                        </label>
                        <input
                            type="number"
                            {...register('foreclosureCharges', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="₹0"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            RBI bars foreclosure/prepayment charges on floating-rate home loans — usually ₹0.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stamp Duty on Transfer
                        </label>
                        <input
                            type="number"
                            {...register('stampDutyOnTransfer', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="₹0"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                    Compare Balance Transfer
                </button>
            </form>

            {/* Unserviceable switch — the EMI is too low to ever amortise the new loan
                (calculateTenure returns Infinity), so there are no meaningful results. */}
            {result && !Number.isFinite(result.newLoan.tenure) && (
                <div className="rounded-lg p-6 bg-red-50 border border-red-200" role="alert">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl" role="img" aria-label="Warning">⚠️</span>
                        <div>
                            <p className="text-lg font-bold text-red-800">This balance transfer isn&rsquo;t serviceable</p>
                            <p className="text-sm text-red-700 mt-1">
                                The current EMI of {formatIndianCurrency(result.currentLoan.emi)} is too low to repay
                                the new loan of {formatIndianCurrency(result.newLoan.amount)} at the chosen rate — it
                                would never fully amortise. Increase the EMI, pick a lower rate, or uncheck
                                &ldquo;keep the same EMI&rdquo; and set a new tenure.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {result && Number.isFinite(result.newLoan.tenure) && (
                <div className="space-y-6">
                    {/* Recommendation Banner */}
                    <div className={`rounded-lg p-6 text-white ${result.recommendation ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'}`}>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl" role="img" aria-label={result.recommendation ? 'Recommended' : 'Not recommended'}>
                                {result.recommendation ? '✅' : '⚠️'}
                            </span>
                            <div>
                                <p className="text-xl font-bold">
                                    {result.recommendation ? 'Balance transfer is worth it' : 'Balance transfer is not worth it'}
                                </p>
                                <p className="text-sm opacity-90">
                                    Net savings {formatIndianCurrency(result.savings.netSavings)} after {formatIndianCurrency(result.costs.total)} in switching costs.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Current vs New Comparison */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current vs New Loan</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Current</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">New</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4 text-gray-600">Loan Amount</td>
                                        <td className="text-right py-3 px-4 font-medium">{formatIndianCurrency(result.currentLoan.outstanding)}</td>
                                        <td className="text-right py-3 px-4 font-medium">{formatIndianCurrency(result.newLoan.amount)}</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4 text-gray-600">Monthly EMI</td>
                                        <td className="text-right py-3 px-4 font-medium">{formatIndianCurrency(result.currentLoan.emi)}</td>
                                        <td className="text-right py-3 px-4 font-medium">{formatIndianCurrency(result.newLoan.emi)}</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4 text-gray-600">Tenure</td>
                                        <td className="text-right py-3 px-4 font-medium">{formatMonths(result.currentLoan.tenure)}</td>
                                        <td className="text-right py-3 px-4 font-medium">{formatMonths(result.newLoan.tenure)}</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4 text-gray-600">Total Interest</td>
                                        <td className="text-right py-3 px-4 font-medium">{formatToLakhsCrores(result.currentLoan.totalInterest)}</td>
                                        <td className="text-right py-3 px-4 font-medium">{formatToLakhsCrores(result.newLoan.totalInterest)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 text-gray-600">Total Payment</td>
                                        <td className="text-right py-3 px-4 font-medium">{formatToLakhsCrores(result.currentLoan.totalPayment)}</td>
                                        <td className="text-right py-3 px-4 font-medium">{formatToLakhsCrores(result.newLoan.totalPayment)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Savings + Costs */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">{result.savings.grossSavings < 0 ? 'Extra Interest (top-up)' : 'Gross Interest Saved'}</span>
                                    <span className="font-semibold text-gray-900">{formatIndianCurrency(result.savings.grossSavings)}</span>
                                </div>
                                <div className="flex justify-between items-center text-red-600">
                                    <span>Switching Costs</span>
                                    <span className="font-semibold">- {formatIndianCurrency(result.costs.total)}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between items-center">
                                    <span className="text-gray-700 font-medium">Net Savings</span>
                                    <span className={`font-bold ${result.savings.netSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatIndianCurrency(result.savings.netSavings)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Monthly EMI Saving</span>
                                    <span className="font-semibold text-gray-900">{formatIndianCurrency(result.savings.monthlySaving)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Break-even</span>
                                    <span className="font-semibold text-gray-900">
                                        {Number.isFinite(result.savings.breakEvenMonths)
                                            ? formatMonths(result.savings.breakEvenMonths)
                                            : appliedKeepSameEMI ? 'Same EMI — finishes sooner' : 'Never'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Switching Costs</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Processing Fee</span>
                                    <span className="font-semibold text-gray-900">{formatIndianCurrency(result.costs.processingFee)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Legal & Valuation</span>
                                    <span className="font-semibold text-gray-900">{formatIndianCurrency(result.costs.legalCharges)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Foreclosure Charges</span>
                                    <span className="font-semibold text-gray-900">{formatIndianCurrency(result.costs.foreclosureCharges)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Stamp Duty on Transfer</span>
                                    <span className="font-semibold text-gray-900">{formatIndianCurrency(result.costs.stampDutyOnTransfer)}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between items-center">
                                    <span className="text-gray-700 font-medium">Total Costs</span>
                                    <span className="font-bold text-gray-900">{formatIndianCurrency(result.costs.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <BalanceTransferChart analysis={result} />
                </div>
            )}
        </div>
    );
}
