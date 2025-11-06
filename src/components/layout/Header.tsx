/**
 * Header Component
 * Site header with logo, branding, and navigation
 */

import { Link } from '@tanstack/react-router';
import { BsHousesFill } from 'react-icons/bs';
import { NavigationMenu } from './NavigationMenu';

export function Header() {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40" role="banner">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo and Title */}
                    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
                        <BsHousesFill className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Loanly
                            </h1>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <NavigationMenu />
                </div>
            </div>
        </header>
    );
}
