/**
 * Utility functions for Home Loan Calculator
 */

import { CURRENCY_SYMBOL, LAKH, CRORE } from './constants';

// ============================================================================
// CLASSNAME UTILITIES (FOR TAILWIND)
// ============================================================================

/**
 * Merge Tailwind CSS classes with proper precedence
 */


// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format number in Indian numbering system
 * Example: 1,00,000 instead of 100,000
 */
export function formatIndianNumber(num: number): string {
    if (num === 0) return '0';

    const isNegative = num < 0;
    const absNum = Math.abs(num);

    // Split into integer and decimal parts
    const [integerPart, decimalPart] = absNum.toString().split('.');

    // Format integer part with Indian comma system
    let formattedInteger = '';
    const length = integerPart.length;

    if (length <= 3) {
        formattedInteger = integerPart;
    } else {
        // Last 3 digits
        formattedInteger = integerPart.slice(-3);
        let remaining = integerPart.slice(0, -3);

        // Add commas every 2 digits from right to left
        while (remaining.length > 0) {
            if (remaining.length <= 2) {
                formattedInteger = remaining + ',' + formattedInteger;
                break;
            } else {
                formattedInteger = remaining.slice(-2) + ',' + formattedInteger;
                remaining = remaining.slice(0, -2);
            }
        }
    }

    // Combine with decimal part if exists
    const formatted = decimalPart
        ? `${formattedInteger}.${decimalPart}`
        : formattedInteger;

    return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format currency with ₹ symbol in Indian format
 */
export function formatIndianCurrency(num: number, decimals: number = 0): string {
    const rounded = decimals > 0 ? num.toFixed(decimals) : Math.round(num);
    return `${CURRENCY_SYMBOL}${formatIndianNumber(Number(rounded))}`;
}

/**
 * Format large numbers in Lakhs and Crores
 * Example: ₹1.5Cr instead of ₹1,50,00,000
 */
export function formatToLakhsCrores(num: number, decimals: number = 1): string {
    const absNum = Math.abs(num);
    const isNegative = num < 0;
    const sign = isNegative ? '-' : '';

    if (absNum >= CRORE) {
        const crores = absNum / CRORE;
        return `${sign}${CURRENCY_SYMBOL}${crores.toFixed(decimals)}Cr`;
    } else if (absNum >= LAKH) {
        const lakhs = absNum / LAKH;
        return `${sign}${CURRENCY_SYMBOL}${lakhs.toFixed(decimals)}L`;
    } else if (absNum >= 1000) {
        const thousands = absNum / 1000;
        return `${sign}${CURRENCY_SYMBOL}${thousands.toFixed(decimals)}K`;
    } else {
        return `${sign}${CURRENCY_SYMBOL}${absNum.toFixed(decimals)}`;
    }
}

/**
 * Parse Indian formatted number string to number
 * Handles commas in Indian format
 */
export function parseIndianNumber(str: string): number {
    if (!str) return 0;

    // Remove currency symbol, spaces, and commas
    const cleaned = str
        .replace(CURRENCY_SYMBOL, '')
        .replace(/\s/g, '')
        .replace(/,/g, '');

    // Handle L/Cr/K suffixes
    if (cleaned.endsWith('Cr') || cleaned.endsWith('cr')) {
        return parseFloat(cleaned.slice(0, -2)) * CRORE;
    } else if (cleaned.endsWith('L') || cleaned.endsWith('l')) {
        return parseFloat(cleaned.slice(0, -1)) * LAKH;
    } else if (cleaned.endsWith('K') || cleaned.endsWith('k')) {
        return parseFloat(cleaned.slice(0, -1)) * 1000;
    }

    return parseFloat(cleaned) || 0;
}

// ============================================================================
// PERCENTAGE FORMATTING
// ============================================================================

/**
 * Format percentage with symbol
 */
export function formatPercentage(num: number, decimals: number = 2): string {
    return `${num.toFixed(decimals)}%`;
}

/**
 * Convert decimal to percentage
 * Example: 0.09 -> 9%
 */
export function toPercentage(decimal: number, decimals: number = 2): string {
    return formatPercentage(decimal * 100, decimals);
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format date in DD/MM/YYYY (Indian format)
 */
export function formatIndianDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Get month name in English
 */
export function getMonthName(monthIndex: number): string {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
}

/**
 * Format month and year
 * Example: "January 2024"
 */
export function formatMonthYear(month: number, year: number): string {
    const monthIndex = ((month - 1) % 12);
    const actualYear = year + Math.floor((month - 1) / 12);
    return `${getMonthName(monthIndex)} ${actualYear}`;
}

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

/**
 * Calculate compound interest
 */
export function calculateCompoundInterest(
    principal: number,
    rate: number,
    time: number,
    frequency: number = 1
): number {
    return principal * Math.pow(1 + rate / frequency, frequency * time);
}

/**
 * Round to nearest rupee
 */
export function roundToRupee(num: number): number {
    return Math.round(num);
}

/**
 * Round to 2 decimal places
 */
export function roundTo2Decimals(num: number): number {
    return Math.round(num * 100) / 100;
}

/**
 * Calculate percentage change
 */
export function percentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Calculate percentage of a number
 */
export function percentageOf(percentage: number, total: number): number {
    return (percentage / 100) * total;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if number is within range
 */
export function isInRange(
    num: number,
    min: number,
    max: number
): boolean {
    return num >= min && num <= max;
}

/**
 * Clamp number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
}

/**
 * Check if value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

// ============================================================================
// ARRAY HELPERS
// ============================================================================

/**
 * Sum array of numbers
 */
export function sum(arr: number[]): number {
    return arr.reduce((acc, val) => acc + val, 0);
}

/**
 * Average of array of numbers
 */
export function average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return sum(arr) / arr.length;
}

/**
 * Find minimum in array
 */
export function min(arr: number[]): number {
    return Math.min(...arr);
}

/**
 * Find maximum in array
 */
export function max(arr: number[]): number {
    return Math.max(...arr);
}

// ============================================================================
// DEBOUNCE
// ============================================================================

/**
 * Debounce function for input handlers
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

/**
 * Save to localStorage
 */
export function saveToLocalStorage<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

/**
 * Load from localStorage
 */
export function loadFromLocalStorage<T>(key: string): T | null {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

/**
 * Remove from localStorage
 */
export function removeFromLocalStorage(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
}

// ============================================================================
// EXPORT HELPERS
// ============================================================================

/**
 * Download data as JSON file
 */
export function downloadJSON(data: unknown, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Download data as CSV file
 */
export function downloadCSV(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, unknown>>(
    data: T[],
    headers?: string[]
): string {
    if (data.length === 0) return '';

    const cols = headers || Object.keys(data[0]);
    const headerRow = cols.join(',');

    const rows = data.map(row =>
        cols.map(col => {
            const value = row[col];
            // Escape commas and quotes
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',')
    );

    return [headerRow, ...rows].join('\n');
}
