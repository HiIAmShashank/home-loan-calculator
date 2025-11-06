/**
 * Number to Words Utility
 * Converts numbers to Indian English words with Rupees formatting
 */

import { ToWords } from 'to-words';

// Initialize ToWords with Indian locale
const toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
        currency: true,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
        currencyOptions: {
            name: 'Rupee',
            plural: 'Rupees',
            symbol: '₹',
            fractionalUnit: {
                name: 'Paisa',
                plural: 'Paise',
                symbol: '',
            },
        },
    },
});

/**
 * Convert a number to Indian English words
 * @param amount - The numeric amount to convert
 * @returns The amount in words (e.g., "Five Lakh Rupees")
 */
export function convertToWords(amount: number): string {
    if (isNaN(amount) || amount === 0) {
        return 'Zero Rupees';
    }

    try {
        return toWords.convert(amount);
    } catch (error) {
        console.error('Error converting number to words:', error);
        return 'Invalid Amount';
    }
}

/**
 * Format amount as words with proper capitalization
 * @param amount - The numeric amount to convert
 * @returns Formatted amount in words
 */
export function formatAmountInWords(amount: number): string {
    const words = convertToWords(amount);
    // Capitalize first letter
    return words.charAt(0).toUpperCase() + words.slice(1);
}
