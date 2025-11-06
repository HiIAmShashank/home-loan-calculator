import { createFileRoute, Link } from '@tanstack/react-router';
import { HiShieldCheck, HiCheckCircle } from 'react-icons/hi2';

export const Route = createFileRoute('/privacy')({
    component: PrivacyPage,
});

function PrivacyPage() {
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-green-700 text-sm font-semibold mb-4">
                        <HiShieldCheck className="w-5 h-5" />
                        Your Privacy Matters
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                    <p className="text-lg text-gray-600">
                        Complete transparency about how we handle your data
                    </p>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
                    {/* TL;DR Section */}
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
                            <HiCheckCircle className="w-6 h-6" />
                            TL;DR - The Short Version
                        </h2>
                        <div className="space-y-3 text-green-900">
                            <p className="flex items-start gap-3">
                                <HiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Zero data collection</strong> - We don't collect, store, or transmit any of your data</span>
                            </p>
                            <p className="flex items-start gap-3">
                                <HiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>No cookies</strong> - We don't use cookies or any tracking technologies</span>
                            </p>
                            <p className="flex items-start gap-3">
                                <HiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>No analytics</strong> - No Google Analytics, no tracking pixels, nothing</span>
                            </p>
                            <p className="flex items-start gap-3">
                                <HiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>100% client-side</strong> - All calculations happen in your browser</span>
                            </p>
                            <p className="flex items-start gap-3">
                                <HiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Open source</strong> - You can verify this yourself by reviewing the code</span>
                            </p>
                        </div>
                    </div>

                    {/* Detailed Sections */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">What Information We Collect</h2>
                        <p className="text-gray-700 mb-4">
                            <strong className="text-xl">None.</strong>
                        </p>
                        <p className="text-gray-700">
                            This application is designed to respect your privacy completely. We do not collect, store, process,
                            or transmit any personal information, financial data, or usage information. All data you enter into
                            the calculators remains on your device and is never sent to our servers (because we don't even have servers for this purpose).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">How the Application Works</h2>
                        <p className="text-gray-700 mb-4">
                            Loanly is a <strong>client-side application</strong> that runs entirely in your web browser. This means:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>All calculations are performed locally on your device</li>
                            <li>Your loan amount, interest rates, and other inputs never leave your browser</li>
                            <li>No data is sent to any server or third party</li>
                            <li>The application works offline once loaded</li>
                            <li>Your calculations are not saved or logged anywhere</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
                        <p className="text-gray-700 mb-4">
                            We do not use:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li><strong>Cookies</strong> - No cookies of any kind (session, persistent, or third-party)</li>
                            <li><strong>Analytics</strong> - No Google Analytics, Mixpanel, or similar tracking services</li>
                            <li><strong>Tracking pixels</strong> - No Facebook Pixel, LinkedIn Insight Tag, or similar</li>
                            <li><strong>Fingerprinting</strong> - No device or browser fingerprinting</li>
                            <li><strong>Local storage tracking</strong> - No localStorage or sessionStorage for tracking purposes</li>
                        </ul>
                        <p className="text-gray-700 mt-4">
                            <em>Note: The application may use localStorage solely to save your calculator preferences (like theme settings)
                                on your device for your convenience. This data never leaves your browser.</em>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
                        <p className="text-gray-700">
                            We do not integrate with any third-party services for analytics, advertising, social media,
                            or any other purpose that would compromise your privacy. The application is completely standalone.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Server Logs</h2>
                        <p className="text-gray-700">
                            If this application is hosted on a web server, standard web server logs may record technical information
                            such as IP addresses, browser types, and page access times. However:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
                            <li>These logs are maintained by the hosting provider, not by us</li>
                            <li>We do not access, analyze, or use these logs</li>
                            <li>These logs do not contain any of your calculator inputs or financial data</li>
                            <li>Standard server logs are necessary for basic infrastructure security</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                        <p className="text-gray-700">
                            Since we don't collect any data about you, there is no personal data for you to access, modify, or delete.
                            You have complete control over any information you enter into the application since it never leaves your device.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Open Source Transparency</h2>
                        <p className="text-gray-700 mb-4">
                            This application is open source. You can review the source code to verify our privacy claims:
                        </p>
                        <a
                            href="https://github.com/HiIAmShashank/home-loan-calculator"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition"
                        >
                            View Source Code on GitHub
                        </a>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
                        <p className="text-gray-700">
                            We are committed to maintaining a zero-data-collection approach. If we ever need to update this privacy policy,
                            we will update this page with the date of the change. Given our approach, we don't anticipate needing to make changes.
                        </p>
                        <p className="text-gray-600 mt-4 text-sm">
                            <strong>Last Updated:</strong> November 6, 2025
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
                        <p className="text-gray-700">
                            If you have questions about this privacy policy, please open an issue on our{' '}
                            <a
                                href="https://github.com/HiIAmShashank/home-loan-calculator/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline font-semibold"
                            >
                                GitHub repository
                            </a>.
                        </p>
                    </section>
                </div>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
