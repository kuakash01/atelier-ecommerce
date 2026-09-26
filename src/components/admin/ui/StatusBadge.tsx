'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type OrderStatusType =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatusType = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethodType = 'online' | 'cod';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'payment' | 'method';
  className?: string;
}

const orderStatusConfig: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
    dot: 'bg-blue-500 dark:bg-blue-400',
  },
  processing: {
    label: 'Processing',
    className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20',
    dot: 'bg-indigo-500 dark:bg-indigo-400 animate-pulse',
  },
  shipped: {
    label: 'Shipped',
    className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
    dot: 'bg-purple-500 dark:bg-purple-400',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20',
    dot: 'bg-rose-500 dark:bg-rose-400',
  },
  returned: {
    label: 'Returned',
    className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 hover:bg-orange-500/20',
    dot: 'bg-orange-500 dark:bg-orange-400',
  },
};

const paymentStatusConfig: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  paid: {
    label: 'Paid',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  failed: {
    label: 'Failed',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20',
    dot: 'bg-rose-500 dark:bg-rose-400',
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20',
    dot: 'bg-cyan-500 dark:bg-cyan-400',
  },
};

const paymentMethodConfig: Record<string, { label: string; className: string }> = {
  online: {
    label: 'Online / Razorpay',
    className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20',
  },
  cod: {
    label: 'Cash on Delivery',
    className: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700',
  },
};

export function StatusBadge({
  status,
  type = 'order',
  className,
}: StatusBadgeProps) {
  const norm = (status || '').toLowerCase().trim();

  if (type === 'method') {
    const config = paymentMethodConfig[norm] || {
      label: status || 'Unknown',
      className: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
    };
    return (
      <Badge
        variant="outline"
        className={cn('font-mono font-medium text-xs px-2.5 py-0.5 rounded-full border', config.className, className)}
      >
        {config.label}
      </Badge>
    );
  }

  const configMap = type === 'payment' ? paymentStatusConfig : orderStatusConfig;
  const config = configMap[norm] || {
    label: status || 'Unknown',
    className: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700',
    dot: 'bg-zinc-400',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 font-medium text-xs px-2.5 py-0.5 rounded-full border',
        config.className,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </Badge>
  );
}
