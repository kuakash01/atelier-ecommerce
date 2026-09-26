'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import apiAdmin from '@/config/apiAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardStats {
  revenue: number;
  orderCount: number;
  productCount: number;
  userCount: number;
  monthlyRevenue: { name: string; revenue: number; orders: number }[];
  recentOrders: any[];
  topProducts: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiAdmin.get('/admin/orders/dashboard/stats');
        if (res.data?.status === 'success') {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const kpis = [
    {
      title: 'Total Revenue',
      value: stats ? formatCurrency(stats.revenue) : '₹0',
      icon: IndianRupee,
      description: 'Gross sales all time',
      trend: '+12.5%',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Total Orders',
      value: stats ? stats.orderCount.toLocaleString() : '0',
      icon: ShoppingBag,
      description: 'Placed by customers',
      trend: '+8.2%',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      title: 'Active Products',
      value: stats ? stats.productCount.toLocaleString() : '0',
      icon: Package,
      description: 'In catalog catalog',
      trend: '+4 new',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'Registered Users',
      value: stats ? stats.userCount.toLocaleString() : '0',
      icon: Users,
      description: 'Customer accounts',
      trend: '+15%',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header section with quick action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Store Overview
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time performance metrics, sales trends, and inventory stats.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs h-9 px-3 transition-colors shadow-xs"
          >
            <ShoppingBag className="mr-2 h-3.5 w-3.5" />
            Manage Orders
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-3 shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Product
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-xs"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800" />
                  <Skeleton className="h-9 w-9 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <Skeleton className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800" />
                <Skeleton className="h-3 w-40 bg-zinc-200 dark:bg-zinc-800" />
              </Card>
            ))
          : kpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <Card
                  key={idx}
                  className="relative overflow-hidden border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-sm hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all group shadow-xs"
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {kpi.title}
                    </CardTitle>
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr ${kpi.color} shadow-sm text-white`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {kpi.value}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      <span className="text-emerald-500 dark:text-emerald-400 font-medium flex items-center">
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                        {kpi.trend}
                      </span>
                      <span className="text-zinc-500 truncate">
                        {kpi.description}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Charts & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-sm shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Revenue Analytics
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                  Monthly sales trajectory for the trailing 12 months
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs"
              >
                12-Month Period
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[280px] w-full">
              {loading ? (
                <Skeleton className="h-full w-full bg-zinc-200 dark:bg-zinc-800/50 rounded-xl" />
              ) : stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.monthlyRevenue}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      className="text-zinc-200 dark:text-zinc-800"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg, #18181b)',
                        borderColor: '#27272a',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                        color: '#f4f4f5',
                      }}
                      formatter={(value: any) => [
                        formatCurrency(Number(value)),
                        'Revenue',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                  No revenue data yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-sm shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Top Sellers
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                  Most ordered items by units sold
                </CardDescription>
              </div>
              <Link
                href="/admin/products"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors flex items-center"
              >
                All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-32 bg-zinc-200 dark:bg-zinc-800" />
                    <Skeleton className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
              ))
            ) : stats?.topProducts && stats.topProducts.length > 0 ? (
              stats.topProducts.map((prod, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center">
                      {prod.gallery && prod.gallery[0]?.url ? (
                        <img
                          src={prod.gallery[0].url}
                          alt={prod._id}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                        {prod._id}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {prod.totalQuantity} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {formatCurrency(prod.totalSales)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500">
                No sales recorded yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card className="border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-sm shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Recent Orders
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Latest transactions across all customer accounts
            </CardDescription>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-zinc-200 dark:bg-zinc-800/60 rounded-lg" />
              ))}
            </div>
          ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                    <th className="pb-3 font-medium">Order ID</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Payment</th>
                    <th className="pb-3 font-medium">Order Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {stats.recentOrders.map((ord: any) => (
                    <tr
                      key={ord._id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors"
                    >
                      <td className="py-3 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                        #{ord.orderId || ord._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 text-zinc-800 dark:text-zinc-200">
                        {ord.user?.name || ord.user?.email || 'Guest Customer'}
                      </td>
                      <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(ord.priceSummary?.total)}
                      </td>
                      <td className="py-3">
                        <StatusBadge
                          status={ord.paymentDetails?.status || 'pending'}
                          type="payment"
                        />
                      </td>
                      <td className="py-3">
                        <StatusBadge status={ord.status} type="order" />
                      </td>
                      <td className="py-3 text-zinc-500">
                        {new Date(ord.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500">
              No orders placed yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
