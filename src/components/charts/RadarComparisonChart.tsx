/**
 * Radar Comparison Chart Component
 * Multi-dimensional comparison across EMI, Total Cost, Flexibility, Tax Savings
 */

import { memo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RadarComparisonChartProps {
    scenarios: Array<{
        name: string;
        emi: number;
        totalCost: number;
        tenureYears: number;
        taxSavings?: number;
    }>;
}

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ef4444'];

function RadarComparisonChartComponent({ scenarios }: RadarComparisonChartProps) {
    // Normalize values to 0-100 scale for radar chart
    const maxEMI = Math.max(...scenarios.map(s => s.emi));
    const maxTotalCost = Math.max(...scenarios.map(s => s.totalCost));
    const maxTenure = Math.max(...scenarios.map(s => s.tenureYears));
    const maxTaxSavings = Math.max(...scenarios.map(s => s.taxSavings || 0));

    // Create radar data points (dimensions)
    const dimensions = [
        'Affordability',
        'Total Cost',
        'Flexibility',
        'Tax Benefits'
    ];

    const radarData = dimensions.map((dimension, index) => {
        const dataPoint: Record<string, string | number> = { dimension };

        scenarios.forEach((scenario) => {
            let value = 0;

            switch (index) {
                case 0: // Affordability (lower EMI = better, so invert)
                    value = 100 - (scenario.emi / maxEMI * 100);
                    break;
                case 1: // Total Cost (lower = better, so invert)
                    value = 100 - (scenario.totalCost / maxTotalCost * 100);
                    break;
                case 2: // Flexibility (shorter tenure = more flexible)
                    value = 100 - (scenario.tenureYears / maxTenure * 100);
                    break;
                case 3: // Tax Benefits (higher = better)
                    value = maxTaxSavings > 0 ? (scenario.taxSavings || 0) / maxTaxSavings * 100 : 0;
                    break;
            }

            dataPoint[scenario.name] = Math.round(value);
        });

        return dataPoint;
    });

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6" role="region" aria-labelledby="radar-comparison-heading">
            <h3 id="radar-comparison-heading" className="text-lg font-semibold text-gray-900 mb-4">Multi-Dimensional Comparison</h3>
            <p className="sr-only">Radar chart comparing {scenarios.length} loan scenarios across EMI, interest, affordability, and tax metrics</p>
            <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    {scenarios.map((scenario, index) => (
                        <Radar
                            key={scenario.name}
                            name={scenario.name}
                            dataKey={scenario.name}
                            stroke={COLORS[index % COLORS.length]}
                            fill={COLORS[index % COLORS.length]}
                            fillOpacity={0.3}
                            strokeWidth={2}
                        />
                    ))}
                    <Tooltip
                        formatter={(value: number) => `${value}/100`}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    />
                    <Legend />
                </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-600">
                <p className="mb-2"><strong>Interpretation:</strong> Higher values indicate better performance in each dimension.</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Affordability:</strong> Lower monthly EMI burden</li>
                    <li><strong>Total Cost:</strong> Lower overall payment</li>
                    <li><strong>Flexibility:</strong> Shorter loan tenure</li>
                    <li><strong>Tax Benefits:</strong> Higher tax savings (if applicable)</li>
                </ul>
            </div>
        </div>
    );
}

export const RadarComparisonChart = memo(RadarComparisonChartComponent);
