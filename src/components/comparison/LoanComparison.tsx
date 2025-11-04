/**
 * Loan Comparison Component
 * Side-by-side comparison of multiple loan scenarios
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { calculateEMI } from '@/lib/calculations/emi';
import { generateAmortizationSchedule } from '@/lib/calculations/amortization';
import { formatIndianCurrency, formatToLakhsCrores } from '@/lib/utils';
import { ComparisonChart } from '@/components/charts/ComparisonChart';
import { RadarComparisonChart } from '@/components/charts/RadarComparisonChart';
import { GroupedBarChart } from '@/components/charts/GroupedBarChart';
import { FloatingRateProjectionChart } from '@/components/charts/FloatingRateProjectionChart';
import { HiTrophy, HiCurrencyRupee } from 'react-icons/hi2';

// ============================================================================
// TYPES
// ============================================================================

interface Scenario {
    id: number;
    name: string;
    loanAmount: number;
    interestRate: number;
    tenureYears: number;
    emi?: number;
    totalInterest?: number;
    totalAmount?: number;
}

// ============================================================================
// FORM SCHEMA
// ============================================================================

const scenarioSchema = z.object({
    name: z.string().min(1, 'Name required').max(50),
    loanAmount: z.number().min(100000).max(100000000),
    interestRate: z.number().min(5).max(20),
    tenureYears: z.number().min(1).max(30),
});

type ScenarioFormData = z.infer<typeof scenarioSchema>;

// ============================================================================
// COMPONENT
// ============================================================================

export function LoanComparison() {
    const [scenarios, setScenarios] = useState<Scenario[]>([
        {
            id: 1,
            name: 'Scenario 1',
            loanAmount: 5000000,
            interestRate: 8.5,
            tenureYears: 20,
        },
    ]);

    const [editingScenario, setEditingScenario] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ScenarioFormData>({
        resolver: zodResolver(scenarioSchema),
    });

    // Calculate results for all scenarios
    const scenariosWithResults = scenarios.map(scenario => {
        const emi = calculateEMI(scenario.loanAmount, scenario.interestRate, scenario.tenureYears);
        const schedule = generateAmortizationSchedule(scenario.loanAmount, scenario.interestRate, scenario.tenureYears);
        return {
            ...scenario,
            emi,
            totalInterest: schedule.totalInterest,
            totalAmount: schedule.totalAmount,
        };
    });

    // Find best scenario
    const bestScenario = scenariosWithResults.reduce((best, current) =>
        current.totalInterest < best.totalInterest ? current : best
    );

    const addScenario = () => {
        if (scenarios.length >= 3) return;
        setScenarios([
            ...scenarios,
            {
                id: scenarios.length + 1,
                name: `Scenario ${scenarios.length + 1}`,
                loanAmount: 5000000,
                interestRate: 8.5,
                tenureYears: 20,
            },
        ]);
    };

    const removeScenario = (id: number) => {
        if (scenarios.length <= 1) return;
        setScenarios(scenarios.filter(s => s.id !== id));
    };

    const startEdit = (scenario: Scenario) => {
        setEditingScenario(scenario.id);
        reset({
            name: scenario.name,
            loanAmount: scenario.loanAmount,
            interestRate: scenario.interestRate,
            tenureYears: scenario.tenureYears,
        });
    };

    const onSubmit = (data: ScenarioFormData) => {
        if (editingScenario === null) return;
        setScenarios(
            scenarios.map(s =>
                s.id === editingScenario
                    ? { ...s, ...data }
                    : s
            )
        );
        setEditingScenario(null);
        reset();
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6" role="region" aria-labelledby="comparison-heading">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 id="comparison-heading" className="text-3xl font-bold text-gray-900">Loan Comparison</h1>
                <p className="text-gray-600">Compare up to 3 loan scenarios side-by-side</p>
            </div>

            {/* Add Scenario Button */}
            {scenarios.length < 3 && (
                <button
                    onClick={addScenario}
                    aria-label={`Add new scenario (${scenarios.length} of 3 scenarios)`}
                    className="w-full bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-300 text-blue-600 font-semibold py-3 px-6 rounded-lg transition"
                >
                    + Add Scenario (max 3)
                </button>
            )}

            {/* Scenarios Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" role="list" aria-label="Loan scenarios comparison">
                {scenariosWithResults.map(scenario => {
                    const isBest = scenario.id === bestScenario.id && scenarios.length > 1;
                    const isEditing = editingScenario === scenario.id;

                    return (
                        <div
                            key={scenario.id}
                            role="listitem"
                            aria-label={`${scenario.name}${isBest ? ' - Best option' : ''}`}
                            className={`bg-white border-2 rounded-lg p-6 ${isBest ? 'border-green-500 shadow-lg' : 'border-gray-200'}`}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{scenario.name}</h3>
                                    {isBest && (
                                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded mt-1" role="status" aria-label="Best option - lowest total interest">
                                            <HiTrophy className="w-4 h-4" />
                                            Best Option
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEdit(scenario)}
                                        aria-label={`Edit ${scenario.name}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    {scenarios.length > 1 && (
                                        <button
                                            onClick={() => removeScenario(scenario.id)}
                                            aria-label={`Remove ${scenario.name}`}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Scenario Details */}
                            {!isEditing ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Loan Amount</span>
                                            <span className="font-semibold">{formatToLakhsCrores(scenario.loanAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Interest Rate</span>
                                            <span className="font-semibold">{scenario.interestRate}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tenure</span>
                                            <span className="font-semibold">{scenario.tenureYears} years</span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 space-y-3">
                                        <div className="bg-blue-50 p-3 rounded" role="article" aria-labelledby={`emi-${scenario.id}`}>
                                            <div id={`emi-${scenario.id}`} className="text-xs text-gray-600 mb-1">Monthly EMI</div>
                                            <div className="text-2xl font-bold text-blue-600" role="status" aria-live="polite">
                                                {formatIndianCurrency(scenario.emi!)}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-gray-50 p-3 rounded">
                                                <div className="text-xs text-gray-600 mb-1">Total Interest</div>
                                                <div className="text-sm font-bold text-orange-600">
                                                    {formatToLakhsCrores(scenario.totalInterest!)}
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded">
                                                <div className="text-xs text-gray-600 mb-1">Total Amount</div>
                                                <div className="text-sm font-bold text-gray-900">
                                                    {formatToLakhsCrores(scenario.totalAmount!)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label={`Edit ${scenario.name} form`}>
                                    <div>
                                        <label htmlFor={`name-${scenario.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                            Scenario Name
                                        </label>
                                        <input
                                            id={`name-${scenario.id}`}
                                            type="text"
                                            {...register('name')}
                                            aria-invalid={!!errors.name}
                                            aria-describedby={errors.name ? `name-error-${scenario.id}` : undefined}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                        {errors.name && (
                                            <p id={`name-error-${scenario.id}`} role="alert" className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor={`loanAmount-${scenario.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                            Loan Amount (₹)
                                        </label>
                                        <input
                                            id={`loanAmount-${scenario.id}`}
                                            type="number"
                                            {...register('loanAmount', { valueAsNumber: true })}
                                            aria-invalid={!!errors.loanAmount}
                                            aria-describedby={errors.loanAmount ? `loanAmount-error-${scenario.id}` : undefined}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                        {errors.loanAmount && (
                                            <p id={`loanAmount-error-${scenario.id}`} role="alert" className="text-red-500 text-xs mt-1">{errors.loanAmount.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor={`interestRate-${scenario.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                            Interest Rate (%)
                                        </label>
                                        <input
                                            id={`interestRate-${scenario.id}`}
                                            type="number"
                                            step="0.1"
                                            {...register('interestRate', { valueAsNumber: true })}
                                            aria-invalid={!!errors.interestRate}
                                            aria-describedby={errors.interestRate ? `interestRate-error-${scenario.id}` : undefined}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                        {errors.interestRate && (
                                            <p id={`interestRate-error-${scenario.id}`} role="alert" className="text-red-500 text-xs mt-1">{errors.interestRate.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor={`tenureYears-${scenario.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                            Tenure (Years)
                                        </label>
                                        <input
                                            id={`tenureYears-${scenario.id}`}
                                            type="number"
                                            {...register('tenureYears', { valueAsNumber: true })}
                                            aria-invalid={!!errors.tenureYears}
                                            aria-describedby={errors.tenureYears ? `tenureYears-error-${scenario.id}` : undefined}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                        {errors.tenureYears && (
                                            <p className="text-red-500 text-xs mt-1">{errors.tenureYears.message}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingScenario(null);
                                                reset();
                                            }}
                                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Comparison Table */}
            {scenarios.length > 1 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Detailed Comparison</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px]">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric</th>
                                    {scenariosWithResults.map(scenario => (
                                        <th key={scenario.id} className="text-right py-3 px-4 font-semibold text-gray-700">
                                            <div className="flex items-center justify-end gap-1">
                                                {scenario.name}
                                                {scenario.id === bestScenario.id && <HiTrophy className="w-4 h-4 text-green-600" />}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-gray-700 font-medium">Loan Amount</td>
                                    {scenariosWithResults.map(scenario => (
                                        <td key={scenario.id} className="py-3 px-4 text-right">
                                            {formatToLakhsCrores(scenario.loanAmount)}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-gray-700 font-medium">Interest Rate</td>
                                    {scenariosWithResults.map(scenario => (
                                        <td key={scenario.id} className="py-3 px-4 text-right">
                                            {scenario.interestRate}%
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-gray-700 font-medium">Tenure</td>
                                    {scenariosWithResults.map(scenario => (
                                        <td key={scenario.id} className="py-3 px-4 text-right">
                                            {scenario.tenureYears} years
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b border-gray-100 bg-blue-50">
                                    <td className="py-3 px-4 text-gray-900 font-bold">Monthly EMI</td>
                                    {scenariosWithResults.map(scenario => (
                                        <td key={scenario.id} className="py-3 px-4 text-right font-bold text-blue-600">
                                            {formatIndianCurrency(scenario.emi!)}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-gray-700 font-medium">Total Interest</td>
                                    {scenariosWithResults.map(scenario => (
                                        <td
                                            key={scenario.id}
                                            className={`py-3 px-4 text-right font-semibold ${scenario.id === bestScenario.id ? 'text-green-600' : 'text-orange-600'
                                                }`}
                                        >
                                            {formatToLakhsCrores(scenario.totalInterest!)}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-gray-700 font-medium">Total Amount</td>
                                    {scenariosWithResults.map(scenario => (
                                        <td key={scenario.id} className="py-3 px-4 text-right font-semibold">
                                            {formatToLakhsCrores(scenario.totalAmount!)}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 text-gray-700 font-medium">Interest as % of Principal</td>
                                    {scenariosWithResults.map(scenario => (
                                        <td key={scenario.id} className="py-3 px-4 text-right">
                                            {((scenario.totalInterest! / scenario.loanAmount) * 100).toFixed(1)}%
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Visual Comparison Chart */}
            {scenarios.length > 1 && (
                <ComparisonChart
                    scenarios={scenariosWithResults.map(s => ({
                        name: s.name,
                        emi: s.emi!,
                        totalInterest: s.totalInterest!,
                        totalAmount: s.totalAmount!,
                    }))}
                />
            )}

            {/* Grouped Bar Chart - Side-by-Side Metrics */}
            {scenarios.length > 1 && (
                <GroupedBarChart
                    scenarios={scenariosWithResults.map(s => ({
                        name: s.name,
                        emi: s.emi!,
                        totalInterest: s.totalInterest!,
                        totalAmount: s.totalAmount!,
                    }))}
                />
            )}

            {/* Radar Chart - Multi-Dimensional Comparison */}
            {scenarios.length > 1 && (
                <RadarComparisonChart
                    scenarios={scenariosWithResults.map(s => ({
                        name: s.name,
                        emi: s.emi!,
                        totalCost: s.totalAmount!,
                        tenureYears: s.tenureYears,
                        taxSavings: 0, // Can be enhanced with actual tax calculation
                    }))}
                />
            )}

            {/* Floating Rate Projection Chart */}
            {scenarios.length >= 1 && (
                <div className="space-y-4">
                    {scenariosWithResults.map(scenario => (
                        <div key={scenario.id}>
                            <h3 className="text-md font-semibold text-gray-900 mb-2">{scenario.name} - Rate Scenarios</h3>
                            <FloatingRateProjectionChart
                                loanAmount={scenario.loanAmount}
                                currentRate={scenario.interestRate}
                                tenureYears={scenario.tenureYears}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Savings Summary */}
            {scenarios.length > 1 && (
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <HiCurrencyRupee className="w-6 h-6 text-green-600" />
                        Potential Savings
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {scenariosWithResults
                            .filter(s => s.id !== bestScenario.id)
                            .map(scenario => {
                                const interestDiff = scenario.totalInterest! - bestScenario.totalInterest!;
                                const totalDiff = scenario.totalAmount! - bestScenario.totalAmount!;
                                return (
                                    <div key={scenario.id} className="bg-white p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-2">
                                            {scenario.name} vs {bestScenario.name}
                                        </p>
                                        <p className="text-lg font-bold text-green-600">
                                            Save {formatToLakhsCrores(interestDiff)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Total difference: {formatToLakhsCrores(totalDiff)}
                                        </p>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
}
