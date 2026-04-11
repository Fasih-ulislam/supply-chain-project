'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, ArrowLeft, CheckCircle, XCircle, Building2, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { RequestStatus } from '@/types/enums';
import { roleRequestService } from '@/services/roleRequestService';
import { RoleRequest } from '@/types';
import { ROUTES } from '@/config/routes';

export default function RoleRequestDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const [request, setRequest] = useState<RoleRequest | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequest();
    }, [params.id]);

    const fetchRequest = async () => {
        try {
            setLoading(true);
            const data = await roleRequestService.getById(Number(params.id));
            setRequest(data);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to fetch request', 'error');
            router.push(ROUTES.ADMIN.ROLE_REQUESTS);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!request || !confirm('Approve this role request?')) return;

        try {
            await roleRequestService.updateStatus(request.id, { status: RequestStatus.APPROVED });
            showToast('Role request approved successfully', 'success');
            fetchRequest();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to approve request', 'error');
        }
    };

    const handleReject = async () => {
        if (!request || !confirm('Reject this role request?')) return;

        try {
            await roleRequestService.updateStatus(request.id, { status: RequestStatus.REJECTED });
            showToast('Role request rejected successfully', 'success');
            fetchRequest();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to reject request', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!request) {
        return (
            <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Request not found</h3>
                <Button onClick={() => router.push(ROUTES.ADMIN.ROLE_REQUESTS)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Requests
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(ROUTES.ADMIN.ROLE_REQUESTS)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Role Request #{request.id}
                        </h1>
                        <p className="text-gray-600 mt-1">Review and process request</p>
                    </div>
                </div>
                <Badge variant={
                    request.status === 'APPROVED' ? 'success' :
                        request.status === 'REJECTED' ? 'destructive' : 'warning'
                }>
                    {request.status}
                </Badge>
            </div>

            {/* User Information */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">User Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-medium text-gray-900">{request.user?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">{request.user?.email || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Requested Role</p>
                            <p className="font-medium text-gray-900">{request.requestedRole}</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">Request Status</p>
                            <Badge variant={request.status === 'APPROVED' ? 'success' : request.status === 'REJECTED' ? 'destructive' : 'warning'}>
                                {request.status}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Request Date</p>
                            <p className="font-medium text-gray-900">
                                {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Business Information */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Business Details
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Business Name</p>
                                <p className="font-medium text-gray-900">{request.businessName}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Contact Number</p>
                                <p className="font-medium text-gray-900">{request.contactNumber}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Business Address</p>
                                <p className="font-medium text-gray-900">{request.businessAddress}</p>
                            </div>
                        </div>
                        {request.NTN && (
                            <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">NTN Number</p>
                                    <p className="font-medium text-gray-900">{request.NTN}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Actions */}
            {request.status === 'PENDING' && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Process Request</h2>
                    <div className="flex gap-3 justify-end">
                        <Button variant="destructive" onClick={handleReject}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject Request
                        </Button>
                        <Button onClick={handleApprove}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Request
                        </Button>
                    </div>
                </Card>
            )}

            {request.status === 'APPROVED' && (
                <Card className="p-6">
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Request Approved
                        </h3>
                        <p className="text-gray-600">
                            This role request has been approved
                        </p>
                    </div>
                </Card>
            )}

            {request.status === 'REJECTED' && (
                <Card className="p-6">
                    <div className="text-center py-8">
                        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Request Rejected
                        </h3>
                        <p className="text-gray-600">
                            This role request has been rejected
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
