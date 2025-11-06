/**
 * Landing Page Route - Modern Design
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
    HiSparkles,
    HiShieldCheck,
    HiCalculator,
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
        <div className="bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section - Modern with animated gradient */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
                    <div className="max-w-5xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium mb-8">
                            <HiSparkles className="w-4 h-4" />
                            A Comprehensive Home Loan Calculator
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 text-white tracking-tight">
                            Your Home Loan,
                            <span className="block bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                                Simplified
                            </span>
                        </h1>

                        <p className="text-xl sm:text-2xl mb-4 text-blue-100 max-w-3xl mx-auto font-light">
                            Make smarter decisions with powerful calculators, real-time comparisons, and personalized insights
                        </p>

                        <p className="text-base sm:text-lg mb-12 text-blue-200 max-w-2xl mx-auto">
                            EMI calculations • Tax savings • PMAY subsidies • Prepayment strategies • Loan comparisons
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                to="/emi"
                                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                            >
                                <HiCalculator className="w-5 h-5" />
                                Start Calculating
                                <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/comparison"
                                className="group inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white font-semibold rounded-xl hover:bg-white/10 transition-all border-2 border-white/30 backdrop-blur-sm"
                            >
                                <HiScale className="w-5 h-5" />
                                Compare Loans
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">6</div>
                                <div className="text-sm text-blue-200">Calculators</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">100%</div>
                                <div className="text-sm text-blue-200">Accurate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">Free</div>
                                <div className="text-sm text-blue-200">Forever</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid - Modern cards with hover effects */}
            <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-semibold mb-4">
                            <HiSparkles className="w-4 h-4" />
                            All-in-One Platform
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                            Powerful Financial Tools
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Everything you need for your home loan journey, all in one place
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            const colorClasses = {
                                blue: 'from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700',
                                green: 'from-green-500 to-emerald-600 group-hover:from-green-600 group-hover:to-emerald-700',
                                purple: 'from-purple-500 to-violet-600 group-hover:from-purple-600 group-hover:to-violet-700',
                                orange: 'from-orange-500 to-red-600 group-hover:from-orange-600 group-hover:to-red-700',
                                indigo: 'from-indigo-500 to-blue-600 group-hover:from-indigo-600 group-hover:to-blue-700',
                                pink: 'from-pink-500 to-rose-600 group-hover:from-pink-600 group-hover:to-rose-700',
                            };

                            return (
                                <Link
                                    key={feature.to}
                                    to={feature.to}
                                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-gray-200 hover:-translate-y-1"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} shadow-lg mb-6 transition-all`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                                    <div className="flex items-center text-blue-600 font-semibold">
                                        Explore tool
                                        <HiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits Section - Modern with icons */}
            <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-blue-700 text-sm font-semibold mb-4 shadow-sm">
                            <HiShieldCheck className="w-4 h-4" />
                            Built for India
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                            Why Choose Loanly?
                        </h2>
                        <p className="text-xl text-gray-600">
                            Tailored specifically for the Indian home loan market
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                                            <HiCheckCircle className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <p className="text-gray-700 font-medium leading-relaxed">{benefit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* CTA Section - Modern with gradient */}
            <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 opacity-5"></div>
                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl p-12 sm:p-16 text-white">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
                            Ready to Take Control?
                        </h2>
                        <p className="text-xl mb-10 text-blue-100 max-w-2xl mx-auto">
                            Start your home loan journey with confidence. Calculate, compare, and save today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/emi"
                                className="group inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 text-lg"
                            >
                                <HiCalculator className="w-6 h-6" />
                                Calculate Now
                                <HiArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/affordability"
                                className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 transition-all border-2 border-white/30 text-lg"
                            >
                                Check Affordability
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
