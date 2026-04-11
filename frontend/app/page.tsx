'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Supply Chain Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Complete end-to-end supply chain tracking and management platform
            with QR verification, multi-role support, and real-time order tracking.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Button
              onClick={() => router.push(ROUTES.LOGIN)}
              size="lg"
              className="px-8"
            >
              Login
            </Button>
            <Button
              onClick={() => router.push(ROUTES.REGISTER)}
              variant="outline"
              size="lg"
              className="px-8"
            >
              Register
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold mb-2">Order Management</h3>
              <p className="text-gray-600">
                Complete order lifecycle from placement to delivery with real-time tracking
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold mb-2">QR Verification</h3>
              <p className="text-gray-600">
                Digital signatures and QR codes ensure product authenticity
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2">Multi-Role System</h3>
              <p className="text-gray-600">
                Support for Suppliers, Distributors, Customers, and Admins
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
