'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/context/ToastContext';
import { orderService } from '@/services/orderService';
import { formatCurrency } from '@/lib/utils';

interface CartItem {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    maxQuantity: number;
}

export default function CartPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            productId: 1,
            productName: 'Premium Laptop',
            price: 1299.99,
            quantity: 1,
            maxQuantity: 10,
        },
        {
            productId: 2,
            productName: 'Wireless Mouse',
            price: 29.99,
            quantity: 2,
            maxQuantity: 50,
        },
    ]);
    const [loading, setLoading] = useState(false);

    const updateQuantity = (productId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        setCartItems(items =>
            items.map(item =>
                item.productId === productId
                    ? { ...item, quantity: Math.min(newQuantity, item.maxQuantity) }
                    : item
            )
        );
    };

    const removeItem = (productId: number) => {
        setCartItems(items => items.filter(item => item.productId !== productId));
        showToast('Item removed from cart', 'success');
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.1; // 10% tax
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            showToast('Your cart is empty', 'error');
            return;
        }

        try {
            setLoading(true);

            // TODO: Implement proper checkout with supplier selection and delivery address
            showToast('Checkout functionality coming soon', 'info');
            // Create orders for each item
            // for (const item of cartItems) {
            //     await orderService.createOrder({
            //         productId: item.productId,
            //         supplierId: 0, // Need to add supplier selection
            //         quantity: item.quantity,
            //         deliveryAddress: '', // Need to add address form
            //     });
            // }

            // showToast('Orders created successfully!', 'success');
            // setCartItems([]);
            // router.push('/customer/orders');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to create orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <ShoppingCart className="w-24 h-24 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Add some products to get started</p>
                <Button onClick={() => router.push('/customer/products')}>
                    Browse Products
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                <p className="text-gray-600 mt-2">{cartItems.length} items in your cart</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map(item => (
                        <Card key={item.productId} className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                                    <p className="text-sm text-gray-600">
                                        {formatCurrency(item.price)} each
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                                        className="w-16 text-center"
                                        min={1}
                                        max={item.maxQuantity}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                        disabled={item.quantity >= item.maxQuantity}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="text-right min-w-[100px]">
                                    <p className="font-semibold text-gray-900">
                                        {formatCurrency(item.price * item.quantity)}
                                    </p>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(item.productId)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="p-6 sticky top-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatCurrency(calculateSubtotal())}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax (10%)</span>
                                <span>{formatCurrency(calculateTax())}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                                <span>Total</span>
                                <span>{formatCurrency(calculateTotal())}</span>
                            </div>
                        </div>

                        <Alert variant="info" className="mb-4">
                            <p className="text-sm">
                                Each product will be ordered separately from its respective supplier.
                            </p>
                        </Alert>

                        <Button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? 'Processing...' : 'Proceed to Checkout'}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => router.push('/customer/products')}
                            className="w-full mt-3"
                        >
                            Continue Shopping
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
