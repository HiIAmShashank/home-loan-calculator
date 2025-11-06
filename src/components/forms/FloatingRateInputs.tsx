/**
 * FloatingRateInputs Component
 * 
 * Input fields specific to floating rate loans
 * Shows rate increase percentage and change frequency
 */

import { SliderWithInput } from '../ui/SliderWithInput';
import type { UseFormRegister, UseFormSetValue, FieldErrors, FieldValues, Path } from 'react-hook-form';

interface FloatingRateInputsProps<T extends FieldValues> {
    rateIncreasePercent: number;
    rateChangeFrequencyMonths: number;
    register: UseFormRegister<T>;
    setValue: UseFormSetValue<T>;
    errors: FieldErrors<T>;
    baseRate: number;
    tenureYears: number;
}

export function FloatingRateInputs<T extends FieldValues>({
    rateIncreasePercent,
    rateChangeFrequencyMonths,
    register,
    setValue,
    errors,
    baseRate,
    tenureYears,
}: FloatingRateInputsProps<T>) {
    // Calculate projected rate at end of tenure
    const totalMonths = tenureYears * 12;
    const numberOfChanges = Math.floor(totalMonths / rateChangeFrequencyMonths);
    const projectedFinalRate = baseRate + (rateIncreasePercent * numberOfChanges);

    return (
        <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="text-sm font-semibold text-blue-900">Floating Rate Configuration</h3>
            </div>

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
                className="mb-4"
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

            {/* Rate Projection Preview */}
            <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                <p className="text-xs text-gray-600 mb-2">Rate Projection:</p>
                <div className="flex justify-between items-center text-sm">
                    <div>
                        <span className="text-gray-700">Starting:</span>
                        <span className="ml-2 font-semibold text-blue-600">{baseRate}%</span>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div>
                        <span className="text-gray-700">Final:</span>
                        <span className="ml-2 font-semibold text-blue-600">
                            {projectedFinalRate.toFixed(2)}%
                        </span>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    {numberOfChanges} rate change{numberOfChanges !== 1 ? 's' : ''} over {tenureYears} years
                </p>
            </div>

            <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                <strong>Note:</strong> EMI will adjust at each rate change while keeping tenure constant.
            </div>
        </div>
    );
}
