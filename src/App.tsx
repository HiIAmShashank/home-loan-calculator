import { useState } from 'react';
import type { LoanInputs } from '@/lib/types';
import { LoanDetailsForm } from '@/components/forms/LoanDetailsForm';
import { EMISummary } from '@/components/results/EMISummary';
import { AmortizationTable } from '@/components/results/AmortizationTable';
import { TaxBenefitsCalculator } from '@/components/calculators/TaxBenefitsCalculator';
import { PrepaymentCalculator } from '@/components/calculators/PrepaymentCalculator';
import { PMAYCalculator } from '@/components/calculators/PMAYCalculator';
import { AffordabilityCalculator } from '@/components/calculators/AffordabilityCalculator';
import { LoanComparison } from '@/components/comparison/LoanComparison';
import { ScenarioComparison } from '@/components/comparison/ScenarioComparison';
import { AmortizationChart } from '@/components/charts/AmortizationChart';
import { EMIBreakdownChart } from '@/components/charts/EMIBreakdownChart';
import { LoanBalanceChart } from '@/components/charts/LoanBalanceChart';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { HiHome, HiCurrencyRupee, HiBolt, HiBuildingLibrary, HiChartBar, HiScale } from 'react-icons/hi2';

type Tab = 'emi' | 'tax' | 'prepayment' | 'pmay' | 'affordability' | 'comparison';

function App() {
  const [loanInputs, setLoanInputs] = useState<LoanInputs | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('emi');

  const handleCalculate = (inputs: LoanInputs) => {
    setLoanInputs(inputs);
  };

  const tabs = [
    { id: 'emi' as const, label: 'EMI Calculator', Icon: HiHome },
    { id: 'tax' as const, label: 'Tax Benefits', Icon: HiCurrencyRupee },
    { id: 'prepayment' as const, label: 'Prepayment', Icon: HiBolt },
    { id: 'pmay' as const, label: 'PMAY Subsidy', Icon: HiBuildingLibrary },
    { id: 'affordability' as const, label: 'Affordability', Icon: HiChartBar },
    { id: 'comparison' as const, label: 'Compare Loans', Icon: HiScale },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200" role="banner">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Home Loan Calculator
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete financial planning tool with EMI calculation, tax benefits, and cost analysis
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className={`py-8 ${activeTab === 'affordability' || activeTab === 'comparison' ? '' : 'px-4 sm:px-6 lg:px-8'}`} role="main">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6 lg:mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto scrollbar-hide -mb-px" role="tablist" aria-label="Calculator sections">
              {tabs.map(tab => {
                const Icon = tab.Icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`${tab.id}-panel`}
                    id={`${tab.id}-tab`}
                    tabIndex={activeTab === tab.id ? 0 : -1}
                    className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap transition flex items-center gap-1.5 sm:gap-2 ${activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>        {/* Tab Content */}
        {activeTab === 'emi' && (
          <div id="emi-panel" role="tabpanel" aria-labelledby="emi-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Sidebar - Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:sticky lg:top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Loan Details
                </h2>
                <LoanDetailsForm onCalculate={handleCalculate} />
              </div>
            </div>

            {/* Right Content - Results */}
            <div className="lg:col-span-2 space-y-8">
              {loanInputs ? (
                <>
                  {/* EMI Summary */}
                  <ErrorBoundary>
                    <div className="bg-white rounded-lg shadow p-6">
                      <EMISummary loanInputs={loanInputs} />
                    </div>
                  </ErrorBoundary>

                  {/* Charts Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <ErrorBoundary>
                      <EMIBreakdownChart
                        loanAmount={loanInputs.loanAmount}
                        interestRate={loanInputs.interestRate}
                        tenureYears={loanInputs.loanTenure}
                        loanInputs={loanInputs}
                      />
                    </ErrorBoundary>
                    <ErrorBoundary>
                      <LoanBalanceChart
                        loanAmount={loanInputs.loanAmount}
                        interestRate={loanInputs.interestRate}
                        tenureYears={loanInputs.loanTenure}
                        loanInputs={loanInputs}
                      />
                    </ErrorBoundary>
                  </div>

                  {/* Amortization Chart */}
                  <ErrorBoundary>
                    <AmortizationChart
                      loanAmount={loanInputs.loanAmount}
                      interestRate={loanInputs.interestRate}
                      tenureYears={loanInputs.loanTenure}
                      loanInputs={loanInputs}
                    />
                  </ErrorBoundary>

                  {/* Scenario Comparison - For floating and hybrid rate loans */}
                  {(loanInputs.loanType === 'floating' || loanInputs.loanType === 'hybrid') &&
                    loanInputs.rateIncreasePercent &&
                    loanInputs.rateChangeFrequencyMonths && (
                      <ErrorBoundary>
                        <div className="bg-white rounded-lg shadow p-6">
                          <ScenarioComparison loanInputs={loanInputs} />
                        </div>
                      </ErrorBoundary>
                    )}

                  {/* Amortization Table */}
                  <ErrorBoundary>
                    <div className="bg-white rounded-lg shadow p-6">
                      <AmortizationTable
                        loanAmount={loanInputs.loanAmount}
                        interestRate={loanInputs.interestRate}
                        tenureYears={loanInputs.loanTenure}
                        loanInputs={loanInputs}
                      />
                    </div>
                  </ErrorBoundary>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      Ready to calculate your home loan?
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Fill in the loan details on the left to see your EMI breakdown,
                      amortization schedule, and detailed analysis.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tax' && (
          <div id="tax-panel" role="tabpanel" aria-labelledby="tax-tab" className="bg-white rounded-lg shadow">
            <ErrorBoundary>
              <TaxBenefitsCalculator />
            </ErrorBoundary>
          </div>
        )}

        {activeTab === 'prepayment' && (
          <div id="prepayment-panel" role="tabpanel" aria-labelledby="prepayment-tab" className="bg-white rounded-lg shadow">
            <ErrorBoundary>
              <PrepaymentCalculator />
            </ErrorBoundary>
          </div>
        )}

        {activeTab === 'pmay' && (
          <div id="pmay-panel" role="tabpanel" aria-labelledby="pmay-tab" className="bg-white rounded-lg shadow">
            <ErrorBoundary>
              <PMAYCalculator />
            </ErrorBoundary>
          </div>
        )}

        {activeTab === 'affordability' && (
          <div id="affordability-panel" role="tabpanel" aria-labelledby="affordability-tab" className="bg-white rounded-lg shadow">
            <ErrorBoundary>
              <AffordabilityCalculator />
            </ErrorBoundary>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div id="comparison-panel" role="tabpanel" aria-labelledby="comparison-tab" className="bg-white rounded-lg shadow">
            <ErrorBoundary>
              <LoanComparison />
            </ErrorBoundary>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16" role="contentinfo">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-gray-500 text-center">
            Home Loan Calculator • Built with React + TypeScript + Vite
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
