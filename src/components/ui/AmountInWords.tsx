/**
 * AmountInWords Component
 * Displays the word representation of a numeric amount
 */

import { formatAmountInWords } from '@/lib/utils/numberToWords';

interface AmountInWordsProps {
    amount: number;
    className?: string;
    variant?: 'default' | 'light'; // 'default' for white bg, 'light' for colored bg
}

export function AmountInWords({ amount, className = '', variant = 'default' }: AmountInWordsProps) {
    const words = formatAmountInWords(amount);
    const textColor = variant === 'light' ? 'text-gray-100' : 'text-gray-600';

    return (
        <p className={`text-sm ${textColor} italic ${className}`}>
            {words}
        </p>
    );
}
