'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import apiAdmin from '@/config/apiAdmin';
import { AdminDataTable } from '@/components/admin/ui/AdminDataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import ViewOrderSheet from './ViewOrderSheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, RefreshCw, ShoppingBag, Receipt } from 'lucide-react';

interface OrderRow {
  _id: string;
  orderId?: string;
  user: { name?: string; email?: string } | null;
  status: string;
  priceSummary: {
    total: number;
    subTotal: number;
    taxAmount?: number;
    deliveryCharge?: number;
  };
  paymentDetails: {
    method: string;
    status: string;
    transactionId?: string;
  };
  createdAt: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Server-side pagination & search states
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalOrders: 0,
    totalPages: 1,
  });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    all: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  // Debounce search query so typing does not flood the server
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiAdmin.get('/admin/orders', {
        params: {
          page,
          limit: pageSize,
          status: statusFilter,
          search: debouncedSearch.trim() || undefined,
        },
      });
      if (res.data?.data) {
        setOrders(res.data.data);
      }
      if (res.data?.pagination) {
        setPagination(res.data.pagination);
      }
      if (res.data?.counts) {
        setStatusCounts(res.data.counts);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, pageSize, statusFilter, debouncedSearch]);

  const handleOpenOrder = async (orderId: string) => {
    try {
      const res = await apiAdmin.get(`/admin/orders/${orderId}`);
      if (res.data?.data) {
        setSelectedOrder(res.data.data);
        setIsSheetOpen(true);
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    }
  };

  const handleStatusUpdated = (newStatus: string) => {
    if (selectedOrder) {
      setOrders((prev) =>
        prev.map((ord) =>
          ord._id === selectedOrder._id ? { ...ord, status: newStatus } : ord
        )
      );
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const columns: ColumnDef<OrderRow, any>[] = useMemo(
    () => [
      {
        accessorKey: 'orderId',
        header: 'Order ID',
        cell: ({ row }) => {
          const ord = row.original;
          const displayId = ord.orderId || ord._id.slice(-8).toUpperCase();
          return (
            <button
              onClick={() => handleOpenOrder(ord._id)}
              className="font-mono text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
            >
              #{displayId}
            </button>
          );
        },
      },
      {
        id: 'customer',
        header: 'Customer',
        cell: ({ row }) => {
          const ord = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium text-zinc-900 dark:text-zinc-100 text-xs">
                {ord.user?.name || 'Customer'}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                {ord.user?.email || 'No email provided'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <span className="text-zinc-500 dark:text-zinc-400 text-xs font-mono">
              {date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          );
        },
      },
      {
        id: 'total',
        header: 'Total',
        cell: ({ row }) => {
          const total = row.original.priceSummary?.total || 0;
          return (
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
              {formatCurrency(total)}
            </span>
          );
        },
      },
      {
        id: 'payment',
        header: 'Payment',
        cell: ({ row }) => {
          const ord = row.original;
          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              <StatusBadge
                status={ord.paymentDetails?.status || 'pending'}
                type="payment"
              />
              <span className="text-[10px] text-zinc-500 uppercase font-mono">
                {ord.paymentDetails?.method || 'online'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Order Status',
        cell: ({ row }) => {
          return <StatusBadge status={row.original.status} type="order" />;
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenOrder(row.original._id)}
                className="h-8 px-2.5 text-xs text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                View
              </Button>
              <a
                href={`/admin/orders/${row.original._id}/invoice`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center h-8 px-2 text-xs rounded-md text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition cursor-pointer"
                title="View Tax Invoice"
              >
                <Receipt className="h-3.5 w-3.5" />
              </a>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Orders Management
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Monitor transactions, verify customer addresses, and update fulfillment statuses.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          disabled={loading}
          className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs h-9"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={handleStatusFilterChange}
        className="w-full"
      >
        <TabsList className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl flex-wrap h-auto">
          <TabsTrigger
            value="all"
            className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
          >
            All Orders ({statusCounts.all || 0})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
          >
            Pending ({statusCounts.pending || 0})
          </TabsTrigger>
          <TabsTrigger
            value="processing"
            className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
          >
            Processing ({statusCounts.processing || 0})
          </TabsTrigger>
          <TabsTrigger
            value="shipped"
            className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
          >
            Shipped ({statusCounts.shipped || 0})
          </TabsTrigger>
          <TabsTrigger
            value="delivered"
            className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
          >
            Delivered ({statusCounts.delivered || 0})
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
          >
            Cancelled ({statusCounts.cancelled || 0})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders Data Table */}
      <AdminDataTable
        columns={columns}
        data={orders}
        searchPlaceholder="Search by ID, customer, email, phone..."
        isLoading={loading}
        serverPagination={{
          pageIndex: page - 1,
          pageSize: pageSize,
          pageCount: pagination.totalPages,
          totalRecords: pagination.totalOrders,
          onPageChange: (newPageIndex) => setPage(newPageIndex + 1),
          onPageSizeChange: (newPageSize) => {
            setPageSize(newPageSize);
            setPage(1);
          },
          searchValue: searchQuery,
          onSearchChange: (val) => setSearchQuery(val),
        }}
      />

      {/* Slide-in View Order Sheet */}
      <ViewOrderSheet
        order={selectedOrder}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}
