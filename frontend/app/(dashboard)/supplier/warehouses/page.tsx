'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Warehouse as WarehouseIcon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { supplierService } from '@/services/supplierService';
import { Warehouse } from '@/types';

export default function WarehousesPage() {
    const { showToast } = useToast();
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
    });

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            setLoading(true);
            // TODO: Implement getWarehouses in supplierService
            // const response = await supplierService.getWarehouses();
            // setWarehouses(response.data);
            setWarehouses([]);
            showToast('Warehouse functionality not yet implemented', 'info');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to fetch warehouses', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement warehouse update/add methods in supplierService
        showToast('Warehouse functionality not yet implemented', 'info');
        setShowDialog(false);
        resetForm();
    };

    const handleDelete = async (id: number) => {
        // TODO: Implement deleteWarehouse method in supplierService
        showToast('Warehouse functionality not yet implemented', 'info');
    };

    const resetForm = () => {
        setFormData({
            name: '',
            address: '',
        });
        setEditingWarehouse(null);
    };

    const openEditDialog = (warehouse: Warehouse) => {
        setEditingWarehouse(warehouse);
        setFormData({
            name: warehouse.name,
            address: warehouse.address,
        });
        setShowDialog(true);
    };

    const filteredWarehouses = warehouses.filter(warehouse =>
        warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warehouse.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <h1 className="text-3xl font-bold text-gray-900">Warehouses</h1>
                    <p className="text-gray-600 mt-2">Manage your warehouse locations</p>
                </div>
                <Button onClick={() => setShowDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Warehouse
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                    placeholder="Search warehouses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {filteredWarehouses.length === 0 ? (
                <Card className="p-12">
                    <div className="text-center">
                        <WarehouseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No warehouses found</h3>
                        <p className="text-gray-600 mb-4">Add your first warehouse to get started</p>
                        <Button onClick={() => setShowDialog(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Warehouse
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWarehouses.map((warehouse) => (
                        <Card key={warehouse.id} className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <WarehouseIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{warehouse.name}</h3>
                                        <p className="text-sm text-gray-500">ID: {warehouse.id}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Address</p>
                                        <p className="text-sm text-gray-600">{warehouse.address}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(warehouse)}
                                    className="flex-1"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(warehouse.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onClose={() => { setShowDialog(false); resetForm(); }}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Warehouse Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g., Main Distribution Center"
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                                placeholder="e.g., 123 Industrial Blvd, City, State"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { setShowDialog(false); resetForm(); }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingWarehouse ? 'Update' : 'Add'} Warehouse
                            </Button>
                        </div>
                    </form>
                </div>
            </Dialog>
        </div>
    );
}
