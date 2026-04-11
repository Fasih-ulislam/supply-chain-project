"use client";

import { CheckCircle, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Container from "@/components/layout/Container";
import { useFetch } from "@/hooks/useFetch";
import { roleRequestService } from "@/services/roleRequestService";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { RequestStatus } from "@/types/enums";

export default function RoleRequestsPage() {
    const { showToast } = useToast();
    const { data: requests, isLoading, error, refetch } = useFetch(
        () => roleRequestService.getPending()
    );

    const handleApprove = async (requestId: number) => {
        try {
            await roleRequestService.updateStatus(requestId, { status: RequestStatus.APPROVED });
            showToast("Role request approved!", "success");
            refetch();
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to approve request", "error");
        }
    };

    const handleReject = async (requestId: number) => {
        try {
            await roleRequestService.updateStatus(requestId, { status: RequestStatus.REJECTED });
            showToast("Role request rejected!", "success");
            refetch();
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to reject request", "error");
        }
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

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Role Requests</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage user role upgrade requests
                    </p>
                </div>

                {/* Requests Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Requests</CardTitle>
                        <CardDescription>
                            Review and approve role upgrade requests
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!requests || requests.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No pending requests</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Requested Role</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((request: any) => (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-medium">{request.user?.name}</TableCell>
                                            <TableCell>{request.user?.email}</TableCell>
                                            <TableCell>
                                                <Badge>{request.requestedRole}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        request.status === "APPROVED" ? "success" :
                                                            request.status === "REJECTED" ? "destructive" :
                                                                "warning"
                                                    }
                                                >
                                                    {request.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(request.createdAt)}</TableCell>
                                            <TableCell>
                                                {request.status === "PENDING" && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => handleApprove(request.id)}
                                                        >
                                                            <CheckCircle className="mr-1 h-4 w-4" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleReject(request.id)}
                                                        >
                                                            <X className="mr-1 h-4 w-4" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Container>
    );
}
