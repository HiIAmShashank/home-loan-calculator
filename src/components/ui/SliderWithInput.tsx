/**
 * SliderWithInput Component
 * 
 * Hybrid component combining range slider with manual number input
 * Provides bidirectional sync between slider and input box
 */

import { useEffect, useState } from 'react';
import type { UseFormRegister, UseFormSetValue, FieldValues, Path } from 'react-hook-form';

interface SliderWithInputProps<T extends FieldValues> {
    name: Path<T>;
    label: string;
    min: number;
    max: number;
    step?: number;
    value: number;
    suffix?: string; // e.g., '%', ' years'
    register: UseFormRegister<T>;
    setValue: UseFormSetValue<T>;
    errors?: any; // Simplified to avoid deep type complexity
    formatDisplay?: (value: number) => string; // Custom formatter for display value
    className?: string;
}

export function SliderWithInput<T extends FieldValues>({
    name,
    label,
    min,
    max,
    step = 0.05,
    value,
    suffix = '',
    register,
    setValue,
    errors,
    formatDisplay,
    className = '',
}: SliderWithInputProps<T>) {
    const [inputValue, setInputValue] = useState(value.toString());

    // Sync input value when slider value changes
    useEffect(() => {
        setInputValue(value.toString());
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Parse and validate
        const numValue = parseFloat(newValue);
        if (!isNaN(numValue) && numValue >= min && numValue <= max) {
            setValue(name, numValue as any);
        }
    };

    const handleInputBlur = () => {
        // On blur, validate and clamp to range
        const numValue = parseFloat(inputValue);
        if (isNaN(numValue)) {
            setInputValue(value.toString());
        } else {
            const clampedValue = Math.max(min, Math.min(max, numValue));
            const roundedValue = Math.round(clampedValue / step) * step;
            setValue(name, roundedValue as any);
            setInputValue(roundedValue.toString());
        }
    };

    const displayValue = formatDisplay ? formatDisplay(value) : `${value}${suffix}`;

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-2">
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-600" aria-live="polite">
                        {displayValue}
                    </span>
                    <input
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        aria-label={`${label} manual input`}
                    />
                </div>
            </div>

            <input
                id={name}
                type="range"
                min={min}
                max={max}
                step={step}
                {...register(name, { valueAsNumber: true })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                aria-label={label}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={value}
                aria-valuetext={displayValue}
            />

            {errors?.message && (
                <p className="mt-1 text-sm text-red-600" role="alert">{errors.message}</p>
            )}

            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{min}{suffix}</span>
                <span>{max}{suffix}</span>
            </div>
        </div>
    );
}
