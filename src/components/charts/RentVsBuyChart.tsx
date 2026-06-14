/**
 * Rent vs Buy Chart Component
 * Line chart of net wealth position year by year for buying vs renting+investing.
 * The crossover (where the buy line rises above the rent line) is the break-even,
 * marked with a reference line when it falls inside the horizon.
 */

import { memo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
} from 'recharts';
import { calculateRentVsBuy } from '@/lib/calculations/rentVsBuy';
import type { RentVsBuyInputs } from '@/lib/types';
import { formatIndianCurrency } from '@/lib/utils';

interface RentVsBuyChartProps {
    inputs: RentVsBuyInputs;
    breakEvenYear: number;
}

function RentVsBuyChartComponent({ inputs, breakEvenYear }: RentVsBuyChartProps) {
    // Net position year by year, recomputed at each horizon via the public calc API.
    const data = Array.from({ length: inputs.analysisYears }, (_, i) => {
        const year = i + 1;
        const { buyAnalysis, rentAnalysis } = calculateRentVsBuy({ ...inputs, analysisYears: year });
        return {
            year: `Y${year}`,
            buy: Math.round(buyAnalysis.netPosition),
            rent: Math.round(rentAnalysis.netPosition),
        };
    });

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6" role="region" aria-labelledby="rent-vs-buy-chart-heading">
            <h3 id="rent-vs-buy-chart-heading" className="text-lg font-semibold text-gray-900 mb-4">
                Net Position Over Time: Buy vs Rent &amp; Invest
            </h3>
            <p className="sr-only">
                Line chart comparing your net wealth position each year if you buy versus if you rent and
                invest the difference.
                {breakEvenYear > 0
                    ? ` Buying overtakes renting in year ${breakEvenYear}.`
                    : ' Buying does not overtake renting within the analysis horizon.'}
            </p>
            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                    <Tooltip
                        formatter={(value) => formatIndianCurrency(Number(value))}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                        labelFormatter={(label) => `Year ${String(label).substring(1)}`}
                    />
                    <Legend />
                    {breakEvenYear > 0 && (
                        <ReferenceLine
                            x={`Y${breakEvenYear}`}
                            stroke="#6b7280"
                            strokeDasharray="4 4"
                            label={{ value: 'Break-even', position: 'top', fontSize: 12, fill: '#6b7280' }}
                        />
                    )}
                    <Line
                        type="monotone"
                        dataKey="buy"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{ fill: '#22c55e', r: 3 }}
                        activeDot={{ r: 6 }}
                        name="Buy (net position)"
                    />
                    <Line
                        type="monotone"
                        dataKey="rent"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', r: 3 }}
                        activeDot={{ r: 6 }}
                        name="Rent & invest (net position)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export const RentVsBuyChart = memo(RentVsBuyChartComponent);
