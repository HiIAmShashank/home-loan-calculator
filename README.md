# Loanly - Home Loan Calculator

**"Because your mortgage shouldn't be a mystery"**

A comprehensive, feature-rich home loan calculator built specifically for the Indian market. Calculate EMI, tax benefits, PMAY subsidy, prepayment scenarios, and total cost of ownership with support for Indian tax regulations and state-specific charges.

## ⚠️ DISCLAIMER

**THIS CALCULATOR IS FOR INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY.**

This tool does NOT constitute financial, legal, or tax advice. The calculations and results provided may contain errors or inaccuracies. Interest rates, tax laws, regulations, and lending policies are subject to change and vary by lender, location, and individual circumstances.

Actual loan terms, EMI amounts, tax benefits, subsidies, and total costs may differ significantly from the estimates provided by this calculator.

**IMPORTANT:** Always consult with qualified financial advisors, certified tax professionals, and lending institutions before making any financial decisions. Do not rely solely on this tool for financial planning or decision-making.

We accept no responsibility or liability for any financial decisions made based on the information provided by this application.

![React](https://img.shields.io/badge/React-19.1.1-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1.7-purple?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.16-cyan?logo=tailwindcss)
![TanStack Router](https://img.shields.io/badge/TanStack%20Router-1.134.12-orange)

## Features

### Core Calculators
- **EMI Calculator** - Calculate monthly installments with detailed amortization schedule
  - **Fixed Rate Loans** - Traditional loans with constant interest rates
  - **Floating Rate Loans** - Variable rate loans with periodic rate adjustments
  - **Hybrid Rate Loans** - Fixed period followed by floating rate
- **Tax Benefits Calculator** - Section 80C, 24(b), and 80EEA deductions for Old & New tax regimes
- **PMAY Subsidy Calculator** - Pradhan Mantri Awas Yojana subsidy eligibility (EWS/LIG/MIG1/MIG2)
- **Prepayment Calculator** - Analyze impact of lump-sum and recurring prepayments
- **Affordability Calculator** - Determine loan eligibility based on income and FOIR
- **Loan Comparison** - Compare multiple loan scenarios side-by-side

### Advanced Features
- **Amortization Schedules** - Month-by-month and year-by-year breakdowns
- **Interactive Charts** - Principal vs Interest, Loan Balance, EMI Breakdown, Radar Comparisons
- **CSV Export** - Download loan summaries and amortization schedules
- **Floating Rate Projections** - Visualize potential rate changes over loan tenure with visual markers
- **Scenario Analysis** - Compare optimistic, realistic, and pessimistic rate scenarios
- **Rate Change Schedule** - Detailed table showing when rates change and new EMI amounts
- **Hybrid Loan Transitions** - Track fixed-to-floating period transitions
- **Stamp Duty Calculations** - State-specific rates with gender-based discounts
- **GST Calculations** - 5% GST on under-construction properties

### Indian Market Specific
- **Indian Number Formatting** - Lakhs and Crores (₹1,50,00,000 = ₹1.5Cr)
- **RBI Guidelines** - LTV ratios: 90% (≤₹30L), 80% (₹30-75L), 75% (>₹75L)
- **Tax Year FY 2024-25** - Latest income tax slabs and deduction limits
- **State-wise Stamp Duty** - Maharashtra, Karnataka, Delhi, and more
- **Joint Loan Support** - Both co-borrowers can claim full tax deductions

### Accessibility & UX
- **WCAG 2.1 Compliant** - Full keyboard navigation and screen reader support
- **Mobile Responsive** - Optimized for all screen sizes
- **Error Boundaries** - Graceful error handling with user-friendly messages
- **Performance Optimized** - React.memo and useMemo for expensive calculations
- **Auto-calculate** - Real-time updates as you adjust inputs

## Quick Start

### Prerequisites
- Node.js 18+ (recommended: 20+)
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/home-loan-calculator.git
cd home-loan-calculator

# Install dependencies
pnpm install
# or
npm install

# Start development server
pnpm dev
# or
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to see the app.

### Build for Production

```bash
pnpm build
pnpm preview
```

## Navigation & Routing

The app uses **TanStack Router** for type-safe, file-based routing.

### Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Landing Page | Hero section with tagline and feature overview |
| `/emi` | EMI Calculator | Core calculator with fixed/floating/hybrid rates |
| `/tax-benefits` | Tax Benefits | Section 80C/24b/80EEA calculations |
| `/prepayment` | Prepayment | Lump-sum and recurring prepayment scenarios |
| `/pmay` | PMAY Subsidy | Eligibility and subsidy calculations |
| `/affordability` | Affordability | FOIR-based loan affordability |
| `/comparison` | Loan Comparison | Side-by-side scenario comparison |

## Financial Calculations

### EMI Formula

#### Fixed Rate Loans
```
EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]

Where:
P = Principal loan amount
R = Monthly interest rate (annual rate / 12 / 100)
N = Total number of monthly payments (tenure in years × 12)
```

#### Floating Rate Loans
Floating rate loans maintain **constant tenure** while **EMI adjusts** when rates change.

**Key Principles:**
- Tenure remains fixed throughout loan life
- EMI recalculated at each rate change using remaining balance
- Formula: `New EMI = [Outstanding Balance × New R × (1+New R)^Remaining N] / [(1+New R)^Remaining N - 1]`

**Rate Change Generation:**
```typescript
// Periodic rate changes (e.g., +0.25% every 12 months)
Rate at Month M = Base Rate + (Number of Changes × Rate Increase %)
```

#### Hybrid Rate Loans
Hybrid loans combine fixed and floating periods:

**Structure:**
1. **Fixed Period**: First N months at fixed rate (constant EMI)
2. **Floating Period**: Remaining tenure at floating rate (EMI adjusts)

**Calculation:**
```typescript
// Fixed period (Months 1 to fixedPeriodMonths)
EMI_fixed = Standard EMI formula with fixed rate

// Floating period (Months fixedPeriodMonths+1 to end)
EMI_floating = Recalculated using:
  - Outstanding balance at transition
  - Floating rate (may include periodic increases)
  - Remaining tenure
```

### Scenario Analysis (Floating Loans)

The calculator generates three scenarios to help understand risk:

| Scenario | Rate Change | Purpose |
|----------|-------------|---------|
| **Optimistic** | Rates decrease by configured % | Best-case outcome |
| **Realistic** | Rates increase as configured | Expected scenario |
| **Pessimistic** | Rates increase at 2× speed | Worst-case planning |

### Tax Benefits (Old Regime)
- **Section 80C**: Principal repayment up to ₹1.5 lakh/year
- **Section 24(b)**: Interest on self-occupied property up to ₹2 lakh/year
- **Section 80EEA**: Additional ₹1.5 lakh for first-time buyers (property ≤₹45L)
- **Joint Loans**: Both co-borrowers can claim full deductions (₹7L total potential)

### PMAY Subsidy Categories
| Category | Annual Income | Subsidy Rate | Max Subsidy | Loan Amount |
|----------|---------------|--------------|-------------|-------------|
| EWS      | ≤₹3L          | 6.5%         | ₹2.67L      | ₹6L         |
| LIG      | ₹3-6L         | 6.5%         | ₹2.67L      | ₹6L         |
| MIG-1    | ₹6-12L        | 4.0%         | ₹2.35L      | ₹9L         |
| MIG-2    | ₹12-18L       | 3.0%         | ₹2.30L      | ₹12L        |

## Tech Stack

- **Frontend Framework**: React 19.1.1 (with automatic JSX runtime)
- **Routing**: TanStack Router 1.134.12 (file-based, type-safe routing)
- **Build Tool**: Vite 7.1.7
- **Language**: TypeScript 5.9 (strict mode)
- **Styling**: Tailwind CSS 4.1.16
- **Charts**: Recharts 3.3.0 + Tremor 3.18.7
- **Forms**: React Hook Form 7.66.0 + Zod 4.1.12
- **Icons**: React Icons 5.5.0
- **Date Handling**: date-fns 4.1.0

## Key Dependencies

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "recharts": "^3.3.0",
    "@tremor/react": "^3.18.7",
    "react-hook-form": "^7.66.0",
    "zod": "^4.1.12",
    "tailwindcss": "^4.1.16",
    "react-icons": "^5.5.0"
  }
}
```

## Features in Detail

### EMI Calculator
- Real-time EMI calculation with input validation
- **Three loan types supported:**
  - **Fixed Rate**: Traditional constant-rate loans
  - **Floating Rate**: Variable rates with tenure constant, EMI adjusts
  - **Hybrid Rate**: Fixed period → Floating period transition
- Visual breakdown of Principal vs Interest
- Loan balance progression chart
- **Rate change markers** on charts for floating changes and hybrid transitions
- **Rate Change Schedule** table showing month-by-month rate and EMI changes
- **Scenario Analysis** for floating loans (optimistic/realistic/pessimistic)
- Amortization schedule (monthly/yearly views)
- Export to CSV functionality

### Tax Benefits
- Support for Old and New tax regimes
- Automatic calculation of 80C, 24(b), and 80EEA deductions
- Joint loan co-borrower deduction splitting
- Year-wise tax savings breakdown
- Visual comparison of tax savings

### PMAY Calculator
- Automatic category detection (EWS/LIG/MIG1/MIG2)
- NPV calculation of interest subsidy
- Eligibility checker
- Subsidy impact visualization

### Prepayment Scenarios
- Lump-sum prepayment analysis
- Recurring prepayment options
- Interest savings calculator
- Tenure reduction comparison
- Before/after comparison charts

### Affordability Calculator
- FOIR-based affordability (Conservative/Moderate/Aggressive)
- Income vs EMI analysis
- Max loan amount calculation
- Property value recommendation

### Loan Comparison
- Side-by-side comparison of up to 3 scenarios
- Radar charts for multi-dimensional analysis
- Grouped bar charts for metrics
- Best/worst scenario highlighting

## TypeScript Configuration

The project uses strict TypeScript with:
- `verbatimModuleSyntax: true` - Explicit type imports
- `noEmit: true` - Vite handles transpilation
- `erasableSyntaxOnly: true` - No TS-only syntax
- All calculations fully typed with interfaces

## Performance Optimizations

- **React.memo** - All chart components memoized
- **useMemo** - Expensive calculations cached
- **Code Splitting** - Lazy loading for better initial load
- **Debounced Inputs** - Reduced re-renders on form changes

## Accessibility Features

- **ARIA Labels** - All interactive elements properly labeled
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Support** - Semantic HTML and live regions
- **Focus Management** - Visible focus indicators
- **Color Contrast** - WCAG AA compliant

## Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Breakpoints**: 
  - Mobile: < 768px (single column)
  - Tablet: 768px - 1024px
  - Desktop: ≥ 1024px (sidebar + main)
- **Touch-friendly** - Large tap targets, easy-to-use sliders

## Error Handling

- **Error Boundaries** - Catch and display component errors gracefully
- **Form Validation** - Zod schema validation with helpful error messages
- **Calculation Safeguards** - Handle edge cases (division by zero, negative values)
- **User Feedback** - Clear error messages and warnings

## Export Features

- **CSV Export** for:
  - Monthly amortization schedules
  - Yearly amortization summaries
  - Loan summary with all key metrics
- Timestamped filenames
- Excel/Google Sheets compatible

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with guidance from Indian financial regulations and RBI guidelines
- Tax calculations based on Income Tax Act (FY 2024-25)
- PMAY criteria from pradhanmantriawasyojana.com
- State-specific stamp duty rates from respective state revenue departments

## Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ for Indian home buyers**

**"Because your mortgage shouldn't be a mystery"**