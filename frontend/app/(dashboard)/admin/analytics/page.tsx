'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, ShoppingCart, Users, Truck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { orderService } from '@/services/orderService';
import { userService } from '@/services/userService';

export default function AnalyticsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    activeSuppliers: 0,
    activeDistributors: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch data from multiple sources
      const users = await userService.getAllUsers().catch(() => []);

      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        totalUsers: users.length,
        activeSuppliers: users.filter((u: any) => u.role === 'SUPPLIER' || u.supplierProfile).length,
        activeDistributors: users.filter((u: any) => u.role === 'DISTRIBUTOR' || u.distributorProfile).length,
      });
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to fetch analytics', 'error');
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of platform performance and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-sm text-green-600 mt-2">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                All time
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                ${stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-2">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Lifetime
              </p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-sm text-gray-600 mt-2">
                Registered users
              </p>
            </div>
            <div className="p-4 bg-purple-100 rounded-lg">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Partners</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.activeSuppliers + stats.activeDistributors}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Suppliers & Distributors
              </p>
            </div>
            <div className="p-4 bg-orange-100 rounded-lg">
              <Truck className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-700">Pending Orders</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{stats.pendingOrders}</span>
                <Badge variant="warning">
                  {((stats.pendingOrders / (stats.totalOrders || 1)) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-700">Completed Orders</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{stats.completedOrders}</span>
                <Badge variant="success">
                  {((stats.completedOrders / (stats.totalOrders || 1)) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-700">In Progress</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">
                  {stats.totalOrders - stats.pendingOrders - stats.completedOrders}
                </span>
                <Badge variant="info">
                  {(((stats.totalOrders - stats.pendingOrders - stats.completedOrders) / (stats.totalOrders || 1)) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div className="flex h-full">
                <div
                  className="bg-yellow-500"
                  style={{ width: `${(stats.pendingOrders / (stats.totalOrders || 1)) * 100}%` }}
                ></div>
                <div
                  className="bg-blue-500"
                  style={{ width: `${((stats.totalOrders - stats.pendingOrders - stats.completedOrders) / (stats.totalOrders || 1)) * 100}%` }}
                ></div>
                <div
                  className="bg-green-500"
                  style={{ width: `${(stats.completedOrders / (stats.totalOrders || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">User Distribution</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">Suppliers</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{stats.activeSuppliers}</span>
                <Badge variant="info">
                  {((stats.activeSuppliers / (stats.totalUsers || 1)) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-orange-600" />
                <span className="text-gray-700">Distributors</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{stats.activeDistributors}</span>
                <Badge variant="warning">
                  {((stats.activeDistributors / (stats.totalUsers || 1)) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700">Customers</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">
                  {stats.totalUsers - stats.activeSuppliers - stats.activeDistributors}
                </span>
                <Badge variant="default">
                  {(((stats.totalUsers - stats.activeSuppliers - stats.activeDistributors) / (stats.totalUsers || 1)) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Average Order Value</p>
            <p className="text-2xl font-bold text-blue-600">
              ${stats.totalOrders ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
            </p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Completion Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.totalOrders ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : '0'}%
            </p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Active Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.totalOrders ? (((stats.totalOrders - stats.completedOrders) / stats.totalOrders) * 100).toFixed(1) : '0'}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
