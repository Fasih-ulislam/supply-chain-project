'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Truck, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { distributorService } from '@/services/distributorService';
import { Transporter } from '@/types';

export default function TransportersPage() {
  const { showToast } = useToast();
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingTransporter, setEditingTransporter] = useState<Transporter | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    fetchTransporters();
  }, []);

  const fetchTransporters = async () => {
    try {
      setLoading(true);
      const response = await distributorService.getTransporters();
      setTransporters(response);
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
        await distributorService.updateTransporter(editingTransporter.id, formData);
        showToast('Transporter updated successfully', 'success');
      } else {
        await distributorService.createTransporter(formData);
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
      await distributorService.deleteTransporter(id);
      showToast('Transporter deleted successfully', 'success');
      fetchTransporters();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
    });
    setEditingTransporter(null);
  };

  const openEditDialog = (transporter: Transporter) => {
    setEditingTransporter(transporter);
    setFormData({
      name: transporter.name,
      phone: transporter.phone,
    });
    setShowDialog(true);
  };

  const filteredTransporters = transporters.filter(transporter =>
    transporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transporter.phone.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Transporters</h1>
          <p className="text-gray-600 mt-2">Manage your delivery fleet</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transporter
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredTransporters.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transporters found</h3>
            <p className="text-gray-600 mb-4">Add your first transporter to start deliveries</p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transporter
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTransporters.map((transporter) => (
            <Card key={transporter.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Truck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{transporter.name}</h3>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone Number</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-900">{transporter.phone}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Added</p>
                  <p className="text-sm text-gray-600">
                    {new Date(transporter.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(transporter)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(transporter.id)}
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
            {editingTransporter ? 'Edit Transporter' : 'Add Transporter'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Transporter Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter transporter name"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="+1 234 567 8900"
                  className="pl-10"
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
