/**
 * Footer Component
 * Site footer with copyright and branding
 */

import { Link } from '@tanstack/react-router';

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-16" role="contentinfo">
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Disclaimer */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-xs text-yellow-900 leading-relaxed">
                            <strong className="font-semibold">⚠️ Disclaimer:</strong> This calculator is for informational and educational purposes only and does not constitute financial advice.
                            The calculations and results provided may contain errors or inaccuracies. Interest rates, taxes, and regulations are subject to change.
                            Always consult with a qualified financial advisor, tax professional, or lending institution before making any financial decisions.
                            We are not responsible for any financial decisions made based on the information provided by this tool.
                        </p>
                    </div>

                    {/* Privacy Notice */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-xs text-green-900 leading-relaxed">
                            <strong className="font-semibold">🔒 Privacy:</strong> We respect your privacy. This application runs entirely in your browser and does not collect, store, or transmit any personal data.
                            No cookies, tracking, analytics, or logging of any kind. All calculations are performed locally on your device.
                            <Link to="/privacy" className="underline font-semibold ml-1 hover:text-green-700">
                                Learn more
                            </Link>
                        </p>
                    </div>

                    <p className="text-sm text-gray-500 text-center">
                        Loanly • because your mortgage shouldn't be a mystery
                    </p>
                </div>
            </div>
        </footer>
    );
}
