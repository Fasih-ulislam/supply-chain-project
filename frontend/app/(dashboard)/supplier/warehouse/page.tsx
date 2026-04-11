'use client';

import { useState, useEffect } from 'react';
import { Warehouse, MapPin, Save, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { supplierService } from '@/services/supplierService';
import { Warehouse as WarehouseType } from '@/types';

export default function WarehousePage() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [warehouse, setWarehouse] = useState<WarehouseType | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        address: ''
    });

    useEffect(() => {
        fetchWarehouse();
    }, []);

    const fetchWarehouse = async () => {
        try {
            setLoading(true);
            const profile = await supplierService.getProfile();
            if (profile.warehouse) {
                setWarehouse(profile.warehouse);
                setFormData({
                    name: profile.warehouse.name || '',
                    address: profile.warehouse.address || ''
                });
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to fetch warehouse', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await supplierService.updateWarehouse(formData);
            showToast('Warehouse updated successfully', 'success');
            fetchWarehouse();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to update warehouse', 'error');
        }
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
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Warehouse Management</h1>
                <p className="text-gray-600 mt-2">Manage your warehouse details and location</p>
            </div>

            {/* Warehouse Form */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Warehouse className="w-5 h-5" />
                    Warehouse Details
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Warehouse Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g., Main Warehouse"
                            />
                        </div>
                        <div>
                            <Label htmlFor="address">Warehouse Address *</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="pl-10"
                                    required
                                    placeholder="Full warehouse address"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit">
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Warehouse Info Display */}
            {warehouse && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Warehouse Information</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                            <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Warehouse Name</p>
                                <p className="font-medium text-gray-900">{warehouse.name}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Address</p>
                                <p className="font-medium text-gray-900">{warehouse.address}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Warehouse className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Warehouse ID</p>
                                <p className="font-medium text-gray-900">#{warehouse.id}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Created</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(warehouse.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
