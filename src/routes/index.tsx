/**
 * Landing Page Route
 * Home page with hero section and feature overview
 */

import { Link, createFileRoute } from '@tanstack/react-router';
import {
    HiHome,
    HiCurrencyRupee,
    HiBolt,
    HiBuildingLibrary,
    HiChartBar,
    HiScale,
    HiArrowRight,
    HiCheckCircle,
} from 'react-icons/hi2';

export const Route = createFileRoute('/')({
    component: LandingPage,
});

const features = [
    {
        icon: HiHome,
        title: 'EMI Calculator',
        description: 'Calculate monthly EMI with detailed breakdown for fixed, floating, and hybrid rate loans.',
        to: '/emi',
        color: 'blue',
    },
    {
        icon: HiCurrencyRupee,
        title: 'Tax Benefits',
        description: 'Maximize savings with Section 80C, 24b, and 80EEA tax deduction analysis.',
        to: '/tax-benefits',
        color: 'green',
    },
    {
        icon: HiBolt,
        title: 'Prepayment Analysis',
        description: 'See how lump-sum or recurring prepayments reduce your interest burden.',
        to: '/prepayment',
        color: 'purple',
    },
    {
        icon: HiBuildingLibrary,
        title: 'PMAY Subsidy',
        description: 'Check eligibility and calculate Pradhan Mantri Awas Yojana subsidy savings.',
        to: '/pmay',
        color: 'orange',
    },
    {
        icon: HiChartBar,
        title: 'Affordability Calculator',
        description: 'Determine maximum loan eligibility based on FOIR and income.',
        to: '/affordability',
        color: 'indigo',
    },
    {
        icon: HiScale,
        title: 'Compare Loans',
        description: 'Compare up to 3 loan scenarios side-by-side with visual charts.',
        to: '/comparison',
        color: 'pink',
    },
];

const benefits = [
    'Comprehensive EMI breakdown with amortization schedules',
    'Tax benefit analysis for Indian tax regime (80C, 24b, 80EEA)',
    'Floating and hybrid rate loan support',
    'Scenario comparison (optimistic/realistic/pessimistic)',
    'State-specific stamp duty calculations',
    'PMAY subsidy eligibility and NPV calculation',
];

function LandingPage() {
    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
                <div className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                            Welcome to Loanly
                        </h1>
                        <p className="text-xl sm:text-2xl mb-8 text-blue-100">
                            because your mortgage shouldn't be a mystery
                        </p>
                        <p className="text-lg sm:text-xl mb-12 text-blue-50 max-w-3xl mx-auto">
                            Comprehensive home loan calculator with EMI analysis, tax benefits, PMAY subsidy,
                            prepayment planning, and comparison tools tailored for the Indian market.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/emi"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition shadow-lg"
                            >
                                Calculate EMI
                                <HiArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/comparison"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-600 transition border-2 border-white"
                            >
                                Compare Loans
                                <HiScale className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Powerful Financial Tools
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Everything you need to make informed decisions about your home loan journey
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            const colorClasses = {
                                blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
                                green: 'bg-green-50 text-green-600 group-hover:bg-green-100',
                                purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
                                orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100',
                                indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100',
                                pink: 'bg-pink-50 text-pink-600 group-hover:bg-pink-100',
                            };

                            return (
                                <Link
                                    key={feature.to}
                                    to={feature.to}
                                    className="group bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 border border-gray-200"
                                >
                                    <div
                                        className={`inline-flex p-3 rounded-lg mb-4 ${colorClasses[feature.color as keyof typeof colorClasses]
                                            }`}
                                    >
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                                    <div className="flex items-center text-blue-600 font-medium text-sm">
                                        Learn more
                                        <HiArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="bg-gray-100 px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Loanly?
                        </h2>
                        <p className="text-lg text-gray-600">
                            Designed specifically for home loans in India
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <HiCheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-700">{benefit}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Start calculating your home loan EMI and explore all our tools
                    </p>
                    <Link
                        to="/emi"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
                    >
                        Get Started Now
                        <HiArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
