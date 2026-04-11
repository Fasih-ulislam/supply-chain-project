'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Truck, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Table } from '@/components/ui/Table';
import { Dialog } from '@/components/ui/Dialog';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { supplierService } from '@/services/supplierService';
import { Transporter } from '@/types';

export default function SupplierTransportersPage() {
    const { showToast } = useToast();
    const [transporters, setTransporters] = useState<Transporter[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingTransporter, setEditingTransporter] = useState<Transporter | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });

    useEffect(() => {
        fetchTransporters();
    }, []);

    const fetchTransporters = async () => {
        try {
            setLoading(true);
            const data = await supplierService.getTransporters();
            setTransporters(data);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to fetch transporters', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTransporter) {
                await supplierService.updateTransporter(editingTransporter.id, formData);
                showToast('Transporter updated successfully', 'success');
            } else {
                await supplierService.createTransporter(formData);
                showToast('Transporter added successfully', 'success');
            }
            setShowDialog(false);
            resetForm();
            fetchTransporters();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Operation failed', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this transporter?')) return;

        try {
            await supplierService.deleteTransporter(id);
            showToast('Transporter deleted successfully', 'success');
            fetchTransporters();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to delete', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: ''
        });
        setEditingTransporter(null);
    };

    const openEditDialog = (transporter: Transporter) => {
        setEditingTransporter(transporter);
        setFormData({
            name: transporter.name,
            phone: transporter.phone
        });
        setShowDialog(true);
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
                    <h1 className="text-3xl font-bold text-gray-900">Transporters</h1>
                    <p className="text-gray-600 mt-2">Manage your delivery personnel</p>
                </div>
                <Button onClick={() => setShowDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transporter
                </Button>
            </div>

            <Card className="p-6">
                {transporters.length === 0 ? (
                    <div className="text-center py-12">
                        <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No transporters found</h3>
                        <p className="text-gray-600 mb-4">Add your first transporter to get started</p>
                        <Button onClick={() => setShowDialog(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Transporter
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone Number</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transporters.map((transporter) => (
                                <tr key={transporter.id}>
                                    <td className="font-medium text-gray-900">{transporter.name}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            {transporter.phone}
                                        </div>
                                    </td>
                                    <td className="text-gray-600">
                                        {new Date(transporter.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(transporter)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(transporter.id)}
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
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {editingTransporter ? 'Edit Transporter' : 'Add Transporter'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter transporter name"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone">Phone Number *</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="pl-10"
                                    placeholder="+1 234 567 8900"
                                    required
                                />
                            </div>
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
                                {editingTransporter ? 'Update' : 'Add'} Transporter
                            </Button>
                        </div>
                    </form>
                </div>
            </Dialog>
        </div>
    );
}
