/**
 * Root Layout Route
 * Main layout with header, navigation, and footer
 */

import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const Route = createRootRoute({
    component: RootLayout,
});

function RootLayout() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Skip to main content link for keyboard users */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
            >
                Skip to main content
            </a>

            <Header />

            <main id="main-content" className="flex-1" role="main">
                <Outlet />
            </main>

            <Footer />

            {/* DevTools - only in development */}
            {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
        </div>
    );
}
