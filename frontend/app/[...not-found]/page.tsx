'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This catches all unmatched routes and redirects to the homepage
export default function NotFoundCatchAll() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/');
    }, [router]);

    return null;
}
