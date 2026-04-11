'use client';

import { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { distributorService } from '@/services/distributorService';
import { DistributorProfile } from '@/types';

export default function DistributorProfilePage() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<DistributorProfile | null>(null);
    const [formData, setFormData] = useState({
        businessName: '',
        businessAddress: '',
        contactNumber: '',
        NTN: '',
        serviceArea: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await distributorService.getProfile();
            setProfile(data);
            setFormData({
                businessName: data.businessName || '',
                businessAddress: data.businessAddress || '',
                contactNumber: data.contactNumber || '',
                NTN: data.NTN || '',
                serviceArea: data.serviceArea || ''
            });
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to fetch profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await distributorService.updateProfile(formData);
            showToast('Profile updated successfully', 'success');
            fetchProfile();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to update profile', 'error');
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
                <h1 className="text-3xl font-bold text-gray-900">Distributor Profile</h1>
                <p className="text-gray-600 mt-2">Manage your business profile and service area</p>
            </div>

            {/* Business Profile */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Business Information
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="businessName">Business Name *</Label>
                            <Input
                                id="businessName"
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="contactNumber">Contact Number *</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="contactNumber"
                                    type="tel"
                                    value={formData.contactNumber}
                                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="businessAddress">Business Address *</Label>
                        <Textarea
                            id="businessAddress"
                            value={formData.businessAddress}
                            onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                            required
                            rows={3}
                        />
                    </div>
                    <div>
                        <Label htmlFor="serviceArea">Service Area</Label>
                        <Textarea
                            id="serviceArea"
                            value={formData.serviceArea}
                            onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                            placeholder="Describe the areas you serve"
                            rows={3}
                        />
                    </div>
                    <div>
                        <Label htmlFor="NTN">NTN Number</Label>
                        <Input
                            id="NTN"
                            value={formData.NTN}
                            onChange={(e) => setFormData({ ...formData, NTN: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">
                            <Save className="w-4 h-4 mr-2" />
                            Save Profile
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
