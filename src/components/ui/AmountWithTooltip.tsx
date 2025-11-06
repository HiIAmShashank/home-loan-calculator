/**
 * AmountWithTooltip Component
 * Displays formatted amount with Tippy.js tooltip showing words on hover
 */

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { formatAmountInWords } from '@/lib/utils/numberToWords';
import { formatIndianCurrency } from '@/lib/utils';

interface AmountWithTooltipProps {
    amount: number;
    className?: string;
}

export function AmountWithTooltip({ amount, className = '' }: AmountWithTooltipProps) {
    const words = formatAmountInWords(amount);
    const formattedAmount = formatIndianCurrency(amount);

    return (
        <Tippy
            content={words}
            placement="top"
            arrow={true}
            delay={[200, 0]}
            animation="scale"
            theme="light-border"
        >
            <span className={`cursor-help border-b border-dotted border-gray-400 ${className}`}>
                {formattedAmount}
            </span>
        </Tippy>
    );
}
