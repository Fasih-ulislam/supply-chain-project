'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, Users, Shield, CheckCircle, XCircle } from 'lucide-react';
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
import { userService } from '@/services/userService';
import { User, Role } from '@/types';
import { formatDate } from '@/lib/utils';

export default function UsersPage() {
    const { showToast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [showDialog, setShowDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers();
            setUsers(response);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    };



    const handleDeleteUser = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            await userService.deleteUserById(userId);
            showToast('User deleted successfully', 'success');
            fetchUsers();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to delete user', 'error');
        }
    };

    const getRoleBadge = (role: Role) => {
        const variant =
            role === Role.ADMIN ? 'destructive' :
                role === Role.SUPPLIER ? 'info' :
                    role === Role.DISTRIBUTOR ? 'warning' :
                        'default';

        return (
            <Badge variant={variant}>
                {role}
            </Badge>
        );
    };

    const getFilteredUsers = () => {
        return users.filter(user => {
            const matchesSearch =
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.name.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole =
                roleFilter === 'all' ||
                user.role.toLowerCase() === roleFilter.toLowerCase();

            return matchesSearch && matchesRole;
        });
    };

    const filteredUsers = getFilteredUsers();

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
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-2">Manage all users and their roles</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600">
                        <strong>{users.length}</strong> total users
                    </div>
                </div>
            </div>

            <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="md:w-48"
                    >
                        <option value="all">All Roles</option>
                        <option value="customer">Customer</option>
                        <option value="supplier">Supplier</option>
                        <option value="distributor">Distributor</option>
                        <option value="admin">Admin</option>
                    </Select>
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-600">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </td>
                                    <td>
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td>
                                        <span className="text-sm text-gray-600">
                                            {formatDate(user.createdAt)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-600 hover:text-red-700"
                                                title="Delete user"
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Customers</p>
                            <p className="text-2xl font-bold text-green-600">
                                {users.filter(u => u.role === Role.CUSTOMER).length}
                            </p>
                        </div>
                        <Users className="w-8 h-8 text-green-600" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Suppliers</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {users.filter(u => u.role === Role.SUPPLIER).length}
                            </p>
                        </div>
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Distributors</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {users.filter(u => u.role === Role.DISTRIBUTOR).length}
                            </p>
                        </div>
                        <Users className="w-8 h-8 text-orange-600" />
                    </div>
                </Card>
            </div>
        </div>
    );
}
