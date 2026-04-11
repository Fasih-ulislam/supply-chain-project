import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/verify-otp'];

// Define role-based route prefixes
const roleRoutes = {
    ADMIN: ['/admin'],
    SUPPLIER: ['/supplier'],
    DISTRIBUTOR: ['/distributor'],
    CUSTOMER: ['/customer'],
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the route is public
    const isPublicRoute = publicRoutes.some(route => pathname === route);

    // Allow all public routes without any checks
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // For protected routes, we'll rely on client-side AuthContext
    // and server-side API authentication with httpOnly cookies
    // Middleware can't access httpOnly cookies, so we let the requests through
    // and handle redirects in the AuthContext

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};