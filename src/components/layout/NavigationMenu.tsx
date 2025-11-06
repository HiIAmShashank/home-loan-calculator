/**
 * NavigationMenu Component
 * Dropdown navigation menu with calculator links organized in groups
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
    HiHome,
    HiCurrencyRupee,
    HiBolt,
    HiBuildingLibrary,
    HiChartBar,
    HiScale,
    HiChevronDown,
    HiBars3,
    HiXMark,
} from 'react-icons/hi2';

interface MenuItem {
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    description: string;
}

interface MenuGroup {
    title: string;
    items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
    {
        title: 'Core Calculator',
        items: [
            {
                to: '/emi',
                icon: HiHome,
                label: 'EMI Calculator',
                description: 'Calculate monthly EMI and payment breakdown',
            },
        ],
    },
    {
        title: 'Financial Benefits',
        items: [
            {
                to: '/tax-benefits',
                icon: HiCurrencyRupee,
                label: 'Tax Benefits',
                description: 'Section 80C/24b/80EEA deductions',
            },
            {
                to: '/pmay',
                icon: HiBuildingLibrary,
                label: 'PMAY Subsidy',
                description: 'Subsidy eligibility and savings',
            },
        ],
    },
    {
        title: 'Analysis Tools',
        items: [
            {
                to: '/prepayment',
                icon: HiBolt,
                label: 'Prepayment',
                description: 'Analyze prepayment impact',
            },
            {
                to: '/affordability',
                icon: HiChartBar,
                label: 'Affordability',
                description: 'FOIR-based affordability analysis',
            },
            {
                to: '/comparison',
                icon: HiScale,
                label: 'Compare Loans',
                description: 'Side-by-side loan comparison',
            },
        ],
    },
];

export function NavigationMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouterState();
    const currentPath = router.location.pathname;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [currentPath]);

    const isActiveRoute = (path: string) => {
        if (path === '/emi') {
            return currentPath === '/emi';
        }
        return currentPath.startsWith(path);
    };

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        onMouseEnter={() => setIsOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition rounded-lg hover:bg-gray-50"
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                    >
                        Calculators
                        <HiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <div
                            className="absolute right-0 mt-2 w-[700px] bg-white rounded-lg shadow-xl border border-gray-200 p-6 z-50"
                            onMouseLeave={() => setIsOpen(false)}
                        >
                            <div className="grid grid-cols-3 gap-6">
                                {menuGroups.map((group) => (
                                    <div key={group.title}>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                            {group.title}
                                        </h3>
                                        <div className="space-y-1">
                                            {group.items.map((item) => {
                                                const Icon = item.icon;
                                                const isActive = isActiveRoute(item.to);

                                                return (
                                                    <Link
                                                        key={item.to}
                                                        to={item.to}
                                                        className={`block p-3 rounded-lg transition group ${isActive
                                                            ? 'bg-blue-50 border-l-4 border-blue-600'
                                                            : 'hover:bg-gray-50 border-l-4 border-transparent'
                                                            }`}
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <Icon
                                                                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                                                                    }`}
                                                            />
                                                            <div>
                                                                <p
                                                                    className={`text-sm font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'
                                                                        }`}
                                                                >
                                                                    {item.label}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {item.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
            >
                {isMobileMenuOpen ? (
                    <HiXMark className="w-6 h-6" />
                ) : (
                    <HiBars3 className="w-6 h-6" />
                )}
            </button>

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/30 z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-50 overflow-y-auto md:hidden">
                        <div className="p-4">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                                    aria-label="Close menu"
                                >
                                    <HiXMark className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Menu Groups */}
                            <div className="space-y-6">
                                {menuGroups.map((group) => (
                                    <div key={group.title}>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                            {group.title}
                                        </h3>
                                        <div className="space-y-2">
                                            {group.items.map((item) => {
                                                const Icon = item.icon;
                                                const isActive = isActiveRoute(item.to);

                                                return (
                                                    <Link
                                                        key={item.to}
                                                        to={item.to}
                                                        className={`block p-3 rounded-lg transition ${isActive
                                                            ? 'bg-blue-50 border-l-4 border-blue-600'
                                                            : 'hover:bg-gray-50 border-l-4 border-transparent'
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <Icon
                                                                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'
                                                                    }`}
                                                            />
                                                            <div>
                                                                <p
                                                                    className={`text-sm font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'
                                                                        }`}
                                                                >
                                                                    {item.label}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {item.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
