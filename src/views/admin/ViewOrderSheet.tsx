'use client';

import React, { useState } from 'react';
import apiAdmin from '@/config/apiAdmin';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import {
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Calendar,
  CheckCircle2,
  Loader2,
  Package,
  Receipt,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

interface OrderItem {
  product?: string;
  title: string;
  price: number;
  mrp: number;
  size: string;
  quantity: number;
  subTotal: number;
  basePrice?: number;
  gstRate?: number;
  gstAmount?: number;
  gallery?: { url: string; public_id: string }[];
}

interface OrderDetails {
  _id: string;
  orderId: string;
  user: { name?: string; email?: string } | null;
  items: OrderItem[];
  status: string;
  cancelReason?: string;
  address: {
    fullName: string;
    phone: string;
    alternatePhone?: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  priceSummary: {
    mrpSubTotal: number;
    subTotal: number;
    basePriceSubTotal: number;
    taxAmount: number;
    discount: number;
    deliveryCharge: number;
    total: number;
  };
  paymentDetails: {
    method: string;
    status: string;
    transactionId?: string;
    paidAt?: string;
  };
  createdAt: string;
}

interface ViewOrderSheetProps {
  order: OrderDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: (newStatus: string) => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
];

export default function ViewOrderSheet({
  order,
  isOpen,
  onClose,
  onStatusUpdated,
}: ViewOrderSheetProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(
    order?.status || 'pending'
  );
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  React.useEffect(() => {
    if (order?.status) {
      setSelectedStatus(order.status);
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [order]);

  if (!order) return null;

  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === order.status) return;

    setIsUpdating(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await apiAdmin.patch(`/admin/orders/${order._id}/status`, {
        status: selectedStatus,
      });

      if (res.status === 200) {
        setSuccessMsg(`Status updated to ${selectedStatus.toUpperCase()}`);
        order.status = selectedStatus;
        if (onStatusUpdated) {
          onStatusUpdated(selectedStatus);
        }
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      console.error('Failed to update order status:', err);
      setErrorMsg(
        err.response?.data?.message || 'Failed to update order status.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 p-0 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <SheetHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
                Order #{order.orderId || order._id.slice(-8).toUpperCase()}
              </span>
              <StatusBadge status={order.status} type="order" />
            </div>
            <SheetTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Order Details
            </SheetTitle>
            <SheetDescription className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              Placed on{' '}
              {new Date(order.createdAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800">
          {/* Order Cancellation Alert Notice */}
          {order.status === 'cancelled' && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-200 uppercase tracking-wider">
                <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Order Cancelled</span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {order.cancelReason || 'This order was cancelled or payment authorization was not completed.'}
              </p>
            </div>
          )}

          {/* Status Updater Section */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-3">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider block">
              Manage Fulfillment Status
            </span>
            <div className="flex items-center gap-3">
              <Select
                value={selectedStatus}
                onValueChange={(val: any) => setSelectedStatus(val || 'pending')}
              >
                <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 h-9 text-xs">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs">
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleUpdateStatus}
                disabled={isUpdating || selectedStatus === order.status}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-4 shrink-0 shadow-sm"
              >
                {isUpdating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                )}
                Update
              </Button>
            </div>
            {successMsg && (
              <p className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">
                {successMsg}
              </p>
            )}
            {errorMsg && (
              <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{errorMsg}</p>
            )}
          </div>

          {/* Customer & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                <User className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                <span>Customer</span>
              </div>
              <div className="text-xs space-y-1">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {order.address?.fullName || order.user?.name || 'Customer'}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 font-mono">
                  {order.user?.email || 'No email'}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 font-mono">
                  {order.address?.phone || 'No phone'}
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                <CreditCard className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                <span>Payment</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex flex-col items-start gap-2">
                  <StatusBadge
                    status={order.paymentDetails?.method || 'online'}
                    type="method"
                  />
                  <StatusBadge
                    status={order.paymentDetails?.status || 'pending'}
                    type="payment"
                  />
                </div>
                {order.paymentDetails?.transactionId && (
                  <p className="text-[11px] text-zinc-500 font-mono truncate">
                    TXN: {order.paymentDetails.transactionId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              <MapPin className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>Shipping Address</span>
            </div>
            {order.address ? (
              <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-0.5 leading-relaxed">
                <p className="text-zinc-900 dark:text-zinc-200 font-medium">{order.address.addressLine1}</p>
                {order.address.addressLine2 && (
                  <p>{order.address.addressLine2}</p>
                )}
                {order.address.landmark && (
                  <p className="text-zinc-500">
                    Landmark: {order.address.landmark}
                  </p>
                )}
                <p>
                  {order.address.city}, {order.address.state} -{' '}
                  <span className="font-mono text-zinc-800 dark:text-zinc-300 font-medium">
                    {order.address.pincode}
                  </span>
                </p>
                <p className="text-zinc-500">{order.address.country}</p>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                No address provided for this order.
              </p>
            )}
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              <ShoppingBag className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>Items Ordered ({order.items?.length || 0})</span>
            </div>

            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center">
                      {item.gallery && item.gallery[0]?.url ? (
                        <img
                          src={item.gallery[0].url}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-zinc-400 dark:text-zinc-600" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200 truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex-wrap">
                        <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-1.5 py-0.5 rounded text-[10px] font-mono">
                          Size: {item.size}
                        </span>
                        <span>Qty: {item.quantity}</span>
                        <span>×</span>
                        <span>{formatCurrency(item.price)}</span>
                        {item.gstRate ? (
                          <span className="text-[10px] text-zinc-400 font-mono">
                            (incl. {item.gstRate}% GST)
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(item.subTotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          {(() => {
            const taxAmount = Number(order.priceSummary?.taxAmount) || 0;
            const subTotalInclusive = Number(order.priceSummary?.subTotal) || 0;
            const subtotalBeforeTax = (order.priceSummary?.basePriceSubTotal && order.priceSummary.basePriceSubTotal > 0)
              ? Number(order.priceSummary.basePriceSubTotal)
              : Math.max(0, subTotalInclusive - taxAmount);
            const deliveryCharge = Number(order.priceSummary?.deliveryCharge) || 0;
            const discount = Number(order.priceSummary?.discount) || 0;
            const mrpTotal = Number(order.priceSummary?.mrpSubTotal) || 0;
            const total = Number(order.priceSummary?.total) || (subTotalInclusive + deliveryCharge);

            return (
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                      Order Summary
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                      Customer Settlement
                    </span>
                  </div>

                  {mrpTotal > subTotalInclusive && discount > 0 && (
                    <>
                      <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                        <span>Gross MRP</span>
                        <span className="text-zinc-500 dark:text-zinc-400 line-through font-mono">
                          {formatCurrency(mrpTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>Catalog Discount</span>
                        <span className="font-mono">-{formatCurrency(discount)}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Items Subtotal</span>
                    <span className="text-zinc-900 dark:text-zinc-200 font-mono font-medium">
                      {formatCurrency(subTotalInclusive)}
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Shipping / Delivery</span>
                    <span className="text-zinc-900 dark:text-zinc-200 font-mono">
                      {deliveryCharge > 0
                        ? `+${formatCurrency(deliveryCharge)}`
                        : 'FREE'}
                    </span>
                  </div>

                  <Separator className="bg-zinc-200 dark:bg-zinc-800 my-2" />

                  <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-1">
                    <span>Total Collected</span>
                    <span className="text-indigo-600 dark:text-indigo-400 text-base font-mono">
                      {formatCurrency(total)}
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-right pt-0.5">
                    {taxAmount > 0
                      ? `Inclusive of all taxes (Includes ${formatCurrency(taxAmount)} GST)`
                      : 'All prices are tax-inclusive'}
                  </p>
                </div>

                {/* Tax & Revenue Accounting (Merchant Audit) */}
                <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-950 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      Tax & Revenue Accounting
                    </span>
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-medium">
                      GST Inclusive
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 text-zinc-600 dark:text-zinc-400">
                    <div className="flex justify-between">
                      <span>Net Sales (Taxable Base Revenue):</span>
                      <span className="font-mono font-medium text-zinc-900 dark:text-zinc-200">
                        {formatCurrency(subtotalBeforeTax)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total GST Liability Collected:</span>
                      <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(taxAmount)}
                      </span>
                    </div>
                    {taxAmount > 0 && (
                      <div className="flex justify-between text-[11px] text-zinc-500 pl-2 border-l-2 border-indigo-200 dark:border-indigo-800">
                        <span>Tax Split (CGST + SGST):</span>
                        <span className="font-mono">
                          {formatCurrency(taxAmount / 2)} + {formatCurrency(taxAmount / 2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40 flex justify-between items-center">
                    <span className="text-[11px] text-zinc-500">Official Tax Invoice:</span>
                    <a
                      href={`/admin/orders/${order._id}/invoice`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Tax Invoice</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
