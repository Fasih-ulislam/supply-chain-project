'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 p-3 rounded-full">
                        <AlertTriangle className="w-12 h-12 text-red-600" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Something went wrong!
                </h1>
                <p className="text-gray-600 mb-6">
                    An unexpected error occurred. Please try again.
                </p>
                {error.message && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-gray-700 font-mono break-words">
                            {error.message}
                        </p>
                    </div>
                )}
                <div className="flex gap-3 justify-center">
                    <Button
                        onClick={() => reset()}
                        className="px-6"
                    >
                        Try again
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = '/'}
                    >
                        Go home
                    </Button>
                </div>
            </div>
        </div>
    );
}
