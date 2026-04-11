'use client';

import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Button } from './ui/Button';
import { setCookie, getCookie } from '@/lib/cookies';

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const consent = getCookie('cookieConsent');

        if (!consent) {
            // Small delay to ensure page is loaded
            const timer = setTimeout(() => {
                setShowBanner(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        // Set cookie for 365 days
        setCookie('cookieConsent', 'accepted', 365);

        // Also set in localStorage as backup
        try {
            localStorage.setItem('cookieConsent', 'accepted');
        } catch (e) {
            console.log('localStorage not available');
        }

        console.log('Cookie consent accepted');
        console.log('Cookie value:', getCookie('cookieConsent'));

        setShowBanner(false);
    };

    const rejectCookies = () => {
        // Set cookie for 365 days
        setCookie('cookieConsent', 'rejected', 365);

        // Also set in localStorage as backup
        try {
            localStorage.setItem('cookieConsent', 'rejected');
        } catch (e) {
            console.log('localStorage not available');
        }

        console.log('Cookie consent rejected');
        console.log('Cookie value:', getCookie('cookieConsent'));

        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t-2 border-gray-200 shadow-2xl animate-slide-up">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Icon and Message */}
                    <div className="flex items-start gap-3 flex-1">
                        <Cookie className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                                We use cookies
                            </h3>
                            <p className="text-sm text-gray-600">
                                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                                By clicking "Accept All", you consent to our use of cookies.
                                <a href="/privacy-policy" className="text-blue-600 hover:underline ml-1">
                                    Learn more
                                </a>
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={rejectCookies}
                            className="whitespace-nowrap"
                        >
                            Reject All
                        </Button>
                        <Button
                            size="sm"
                            onClick={acceptCookies}
                            className="whitespace-nowrap"
                        >
                            Accept All
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
