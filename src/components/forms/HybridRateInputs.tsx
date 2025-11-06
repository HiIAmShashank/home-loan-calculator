/**
 * HybridRateInputs Component
 * 
 * Input fields specific to hybrid rate loans
 * Shows fixed period, fixed rate, floating rate, and change frequency
 */

import { SliderWithInput } from '../ui/SliderWithInput';
import type { UseFormRegister, UseFormSetValue, FieldErrors, FieldValues, Path } from 'react-hook-form';

interface HybridRateInputsProps<T extends FieldValues> {
    fixedPeriodMonths: number;
    fixedRate: number;
    floatingRate: number;
    rateIncreasePercent: number;
    rateChangeFrequencyMonths: number;
    register: UseFormRegister<T>;
    setValue: UseFormSetValue<T>;
    errors: FieldErrors<T>;
    tenureYears: number;
}

export function HybridRateInputs<T extends FieldValues>({
    fixedPeriodMonths,
    fixedRate,
    floatingRate,
    rateIncreasePercent,
    rateChangeFrequencyMonths,
    register,
    setValue,
    errors,
    tenureYears,
}: HybridRateInputsProps<T>) {
    const fixedYears = (fixedPeriodMonths / 12).toFixed(1);
    const floatingMonths = (tenureYears * 12) - fixedPeriodMonths;
    const floatingYears = (floatingMonths / 12).toFixed(1);

    // Calculate projected final floating rate
    const numberOfChanges = Math.floor(floatingMonths / rateChangeFrequencyMonths);
    const projectedFinalRate = floatingRate + (rateIncreasePercent * numberOfChanges);

    return (
        <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h3 className="text-sm font-semibold text-purple-900">Hybrid Rate Configuration</h3>
            </div>

            {/* Fixed Period Section */}
            <div className="space-y-3 p-3 bg-white rounded border border-purple-200">
                <h4 className="text-xs font-semibold text-purple-800 uppercase">Fixed Period</h4>

                <SliderWithInput<T>
                    name={"fixedPeriodMonths" as Path<T>}
                    label="Fixed Period Duration"
                    min={12}
                    max={tenureYears * 12 - 12}
                    step={6}
                    value={fixedPeriodMonths}
                    suffix=" months"
                    register={register}
                    setValue={setValue}
                    errors={errors.fixedPeriodMonths as any}
                    formatDisplay={(val) => `${val} months (${(val / 12).toFixed(1)} years)`}
                />

                <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-700">Fixed Rate:</span>
                    <span className="font-semibold text-purple-600">{fixedRate}%</span>
                </div>
            </div>

            {/* Floating Period Section */}
            <div className="space-y-3 p-3 bg-white rounded border border-purple-200">
                <h4 className="text-xs font-semibold text-purple-800 uppercase">Floating Period</h4>

                <SliderWithInput<T>
                    name={"floatingRate" as Path<T>}
                    label="Starting Floating Rate"
                    min={5}
                    max={20}
                    step={0.05}
                    value={floatingRate}
                    suffix="%"
                    register={register}
                    setValue={setValue}
                    errors={errors.floatingRate as any}
                />

                <SliderWithInput<T>
                    name={"rateIncreasePercent" as Path<T>}
                    label="Rate Increase per Change"
                    min={0}
                    max={1}
                    step={0.05}
                    value={rateIncreasePercent}
                    suffix="%"
                    register={register}
                    setValue={setValue}
                    errors={errors.rateIncreasePercent as any}
                />

                <SliderWithInput<T>
                    name={"rateChangeFrequencyMonths" as Path<T>}
                    label="Rate Change Frequency"
                    min={3}
                    max={60}
                    step={1}
                    value={rateChangeFrequencyMonths}
                    suffix=" months"
                    register={register}
                    setValue={setValue}
                    errors={errors.rateChangeFrequencyMonths}
                    formatDisplay={(val) => `${val} months (${(val / 12).toFixed(1)} years)`}
                />
            </div>

            {/* Timeline Preview */}
            <div className="p-3 bg-white rounded border border-purple-200">
                <p className="text-xs text-gray-600 mb-2">Loan Timeline:</p>

                {/* Visual Timeline */}
                <div className="flex items-center gap-1 mb-2">
                    <div
                        className="h-6 bg-purple-400 rounded-l flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${(fixedPeriodMonths / (tenureYears * 12)) * 100}%` }}
                    >
                        Fixed
                    </div>
                    <div
                        className="h-6 bg-blue-400 rounded-r flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${(floatingMonths / (tenureYears * 12)) * 100}%` }}
                    >
                        Floating
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <p className="text-gray-600">Fixed: {fixedYears} years</p>
                        <p className="font-semibold text-purple-600">{fixedRate}%</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Floating: {floatingYears} years</p>
                        <p className="font-semibold text-blue-600">
                            {floatingRate}% → {projectedFinalRate.toFixed(2)}%
                        </p>
                    </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                    {numberOfChanges} rate change{numberOfChanges !== 1 ? 's' : ''} in floating period
                </p>
            </div>

            <div className="text-xs text-purple-700 bg-purple-100 p-2 rounded">
                <strong>Note:</strong> EMI will recalculate when transitioning to floating rate and at each subsequent rate change.
            </div>
        </div>
    );
}
