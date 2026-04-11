"use client";

import { useState } from "react";
import { Search, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import Container from "@/components/layout/Container";
import { useDebounce } from "@/hooks/useDebounce";
import { useFetch } from "@/hooks/useFetch";
import { orderService } from "@/services/orderService";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types";

export default function ProductsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { showToast } = useToast();
    const [showOrderDialog, setShowOrderDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [orderForm, setOrderForm] = useState({
        quantity: 1,
        deliveryAddress: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: products, isLoading, error, refetch } = useFetch(
        () => orderService.getAvailableProducts()
    );

    const filteredProducts = (products as any[] | null)?.filter((product: any) =>
        product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.category?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
    ) || [];

    const handleOpenOrderDialog = (product: any) => {
        setSelectedProduct(product);
        setOrderForm({ quantity: 1, deliveryAddress: '' });
        setShowOrderDialog(true);
    };

    const handleCloseOrderDialog = () => {
        setShowOrderDialog(false);
        setSelectedProduct(null);
        setOrderForm({ quantity: 1, deliveryAddress: '' });
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        try {
            setIsSubmitting(true);
            await orderService.createOrder({
                supplierId: (selectedProduct as any).supplierId,
                productId: (selectedProduct as any).productId,
                quantity: orderForm.quantity,
                deliveryAddress: orderForm.deliveryAddress
            });
            showToast('Order placed successfully! Waiting for supplier approval.', 'success');
            handleCloseOrderDialog();
            refetch();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to place order', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAvailableStock = (product: any) => {
        return (product as any).availableQuantity || 0;
    };

    if (isLoading) {
        return (
            <Container>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Spinner size="lg" />
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <div className="text-center py-12">
                    <p className="text-destructive">Failed to load products</p>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Browse Products</h1>
                    <p className="text-muted-foreground mt-2">
                        Discover and order products from our suppliers
                    </p>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-muted-foreground">No products found</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((product: any) => {
                            const availableStock = getAvailableStock(product);
                            return (
                                <Card key={`${product.productId}-${product.supplierId}`} className="flex flex-col">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                                                <CardDescription className="line-clamp-2 mt-1">
                                                    {product.description || "No description available"}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Category</span>
                                                <Badge variant="outline">{product.category}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Batch</span>
                                                <span className="text-sm font-medium">{product.batchNo}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Price</span>
                                                <span className="font-semibold text-lg">{formatCurrency(product.price)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Available</span>
                                                <Badge variant={availableStock > 0 ? "success" : "destructive"}>
                                                    {availableStock > 0 ? `${availableStock} units` : "Out of stock"}
                                                </Badge>
                                            </div>
                                            {(product as any).supplier && (
                                                <div className="pt-2 border-t">
                                                    <span className="text-xs text-muted-foreground">Supplier</span>
                                                    <p className="text-sm font-medium">{(product as any).supplier.businessName}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className="w-full"
                                            disabled={availableStock === 0}
                                            onClick={() => handleOpenOrderDialog(product)}
                                        >
                                            <Package className="mr-2 h-4 w-4" />
                                            Order Now
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Order Dialog */}
                <Dialog open={showOrderDialog} onClose={handleCloseOrderDialog}>
                    <div className="p-6 bg-black text-white">
                        <h2 className="text-2xl font-bold text-white mb-6">Place Order</h2>
                        {selectedProduct && (
                            <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
                                <h3 className="font-semibold text-white mb-2">{selectedProduct.name}</h3>
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-300">Category: <span className="font-medium text-white">{selectedProduct.category}</span></p>
                                    <p className="text-gray-300">Batch: <span className="font-medium text-white">{selectedProduct.batchNo}</span></p>
                                    <p className="text-gray-300">Price: <span className="font-medium text-lg text-white">{formatCurrency(selectedProduct.price)}</span></p>
                                    <p className="text-gray-300">Available: <span className="font-medium text-white">{getAvailableStock(selectedProduct)} units</span></p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handlePlaceOrder} className="space-y-4">
                            <div>
                                <Label htmlFor="quantity" className="text-white">Quantity *</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    max={selectedProduct ? getAvailableStock(selectedProduct) : 1}
                                    value={orderForm.quantity}
                                    onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 1 })}
                                    required
                                    className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
                                />
                                {selectedProduct && (
                                    <p className="text-sm text-gray-300 mt-1">
                                        Total: {formatCurrency(selectedProduct.price * orderForm.quantity)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="deliveryAddress" className="text-white">Delivery Address *</Label>
                                <Textarea
                                    id="deliveryAddress"
                                    value={orderForm.deliveryAddress}
                                    onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })}
                                    placeholder="Enter your complete delivery address"
                                    rows={3}
                                    required
                                    className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
                                />
                            </div>

                            <div className="bg-blue-950 border border-blue-800 rounded-lg p-3">
                                <p className="text-sm text-blue-300">
                                    <strong>Note:</strong> Your order will be sent to the supplier for approval. You will be notified once the supplier reviews your request.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseOrderDialog}
                                    disabled={isSubmitting}
                                    className="bg-gray-900 text-white border-gray-700 hover:bg-gray-800"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" isLoading={isSubmitting}>
                                    Place Order
                                </Button>
                            </div>
                        </form>
                    </div>
                </Dialog>
            </div>
        </Container>
    );
}
