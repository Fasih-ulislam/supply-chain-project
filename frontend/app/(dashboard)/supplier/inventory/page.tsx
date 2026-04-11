'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { supplierService } from '@/services/supplierService';
import { Inventory, Warehouse, Product } from '@/types';

export default function InventoryPage() {
    const { showToast } = useToast();
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<Inventory | null>(null);
    const [formData, setFormData] = useState({
        productId: '',
        warehouseId: '',
        quantity: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [inventoryData, profileData, productsData] = await Promise.all([
                supplierService.getInventory(),
                supplierService.getProfile(),
                supplierService.getProducts()
            ]);
            setInventory(inventoryData);
            setProducts(productsData);
            // Warehouse is part of supplier profile
            if (profileData.warehouse) {
                setWarehouses([profileData.warehouse]);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await supplierService.updateInventory(editingItem.id, {
                    quantity: parseInt(formData.quantity)
                });
                showToast('Inventory updated successfully', 'success');
            } else {
                await supplierService.addInventory({
                    productId: parseInt(formData.productId),
                    quantity: parseInt(formData.quantity)
                });
                showToast('Inventory added successfully', 'success');
            }
            setShowDialog(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Operation failed', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this inventory item?')) return;

        try {
            await supplierService.deleteInventory(id);
            showToast('Inventory deleted successfully', 'success');
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to delete', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            productId: '',
            warehouseId: '',
            quantity: ''
        });
        setEditingItem(null);
    };

    const openEditDialog = (item: Inventory) => {
        setEditingItem(item);
        setFormData({
            productId: item.product?.id?.toString() || item.productId?.toString() || '',
            warehouseId: item.warehouse?.id?.toString() || item.warehouseId?.toString() || '',
            quantity: item.quantity.toString()
        });
        setShowDialog(true);
    };

    const filteredInventory = inventory.filter(item => {
        const productName = item.product?.name || '';
        return productName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getLowStockBadge = (item: Inventory) => {
        if (item.quantity === 0) {
            return <Badge variant="destructive">Out of Stock</Badge>;
        }
        if (item.quantity < 10) {
            return <Badge variant="warning">Low Stock</Badge>;
        }
        return <Badge variant="success">In Stock</Badge>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-600 mt-2">Manage your product inventory across warehouses</p>
                </div>
                <Button onClick={() => setShowDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Inventory
                </Button>
            </div>

            <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Search by product or warehouse..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {filteredInventory.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No inventory found</h3>
                        <p className="text-gray-600 mb-4">Start by adding products to your inventory</p>
                        <Button onClick={() => setShowDialog(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Item
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Warehouse</th>
                                <th>Quantity</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {item.product?.name || 'Unknown Product'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Batch: {item.product?.batchNo || 'N/A'}
                                            </p>
                                        </div>
                                    </td>
                                    <td>{item.warehouse?.name || 'Unknown Warehouse'}</td>
                                    <td>
                                        <span className="font-semibold">{item.quantity}</span>
                                    </td>
                                    <td>{getLowStockBadge(item)}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(item)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onClose={() => { setShowDialog(false); resetForm(); }}>
                <div className="p-6 bg-black text-white">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        {editingItem ? 'Edit Inventory' : 'Add Inventory'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!editingItem && (
                            <>
                                <div>
                                    <Label htmlFor="productId" className="text-white">Product</Label>
                                    <Select
                                        id="productId"
                                        value={formData.productId}
                                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                        required
                                        className="bg-gray-900 border-gray-800 text-white"
                                    >
                                        <option value="">Select a product</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} - Batch: {product.batchNo}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="warehouseId" className="text-white">Warehouse</Label>
                                    <Select
                                        id="warehouseId"
                                        value={formData.warehouseId}
                                        onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                                        required
                                        className="bg-gray-900 border-gray-800 text-white"
                                    >
                                        <option value="">Select a warehouse</option>
                                        {warehouses.map(warehouse => (
                                            <option key={warehouse.id} value={warehouse.id}>
                                                {warehouse.name} - {warehouse.address}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </>
                        )}

                        <div>
                            <Label htmlFor="quantity" className="text-white">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                required
                                min="0"
                                className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { setShowDialog(false); resetForm(); }}
                                className="bg-gray-900 text-white border-gray-700 hover:bg-gray-800"
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingItem ? 'Update' : 'Add'} Inventory
                            </Button>
                        </div>
                    </form>
                </div>
            </Dialog>
        </div>
    );
}
