'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import apiAdmin from '@/config/apiAdmin';
import { AdminDataTable } from '@/components/admin/ui/AdminDataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, RefreshCw, Percent, Loader2 } from 'lucide-react';

interface TaxItem {
  _id: string;
  name: string;
  minPrice: number;
  maxPrice: number;
  rate: number;
  isActive?: boolean;
  createdAt?: string;
}

export default function TaxManage() {
  const [taxes, setTaxes] = useState<TaxItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingTax, setEditingTax] = useState<TaxItem | null>(null);

  // Delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [taxToDelete, setTaxToDelete] = useState<TaxItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState('');
  const [minPrice, setMinPrice] = useState('0');
  const [maxPrice, setMaxPrice] = useState('0');
  const [rate, setRate] = useState('18');
  const [formError, setFormError] = useState('');

  const fetchTaxes = async () => {
    setLoading(true);
    try {
      const res = await apiAdmin.get('/admin/tax');
      if (res.data?.taxes) {
        setTaxes(res.data.taxes);
      }
    } catch (err) {
      console.error('Failed to fetch taxes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const openAddDialog = () => {
    setEditingTax(null);
    setName('');
    setMinPrice('0');
    setMaxPrice('0');
    setRate('18');
    setFormError('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (t: TaxItem) => {
    setEditingTax(t);
    setName(t.name || '');
    setMinPrice(String(t.minPrice ?? 0));
    setMaxPrice(String(t.maxPrice ?? 0));
    setRate(String(t.rate ?? 18));
    setFormError('');
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (tax: TaxItem) => {
    try {
      await apiAdmin.patch(`/admin/tax/toggle/${tax._id}`);
      setTaxes((prev) =>
        prev.map((t) =>
          t._id === tax._id ? { ...t, isActive: !t.isActive } : t
        )
      );
    } catch (err) {
      console.error('Failed to toggle tax status:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Tax name is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const payload = {
      name: name.trim(),
      minPrice: Number(minPrice) || 0,
      maxPrice: Number(maxPrice) || 0,
      rate: Number(rate) || 0,
    };

    try {
      if (editingTax) {
        await apiAdmin.put(`/admin/tax/${editingTax._id}`, payload);
      } else {
        await apiAdmin.post('/admin/tax', payload);
      }
      setIsDialogOpen(false);
      fetchTaxes();
    } catch (err: any) {
      console.error('Failed to save tax rate:', err);
      setFormError(
        err.response?.data?.message || err.response?.data?.error || 'Failed to save tax rate.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!taxToDelete) return;
    setIsSubmitting(true);
    try {
      await apiAdmin.delete(`/admin/tax/${taxToDelete._id}`);
      setIsDeleteDialogOpen(false);
      setTaxToDelete(null);
      fetchTaxes();
    } catch (err: any) {
      console.error('Failed to delete tax:', err);
      alert(err.response?.data?.message || 'Failed to delete tax rule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<TaxItem, any>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Rule Name',
        cell: ({ row }) => (
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
            {row.original.name}
          </span>
        ),
      },
      {
        id: 'bracket',
        header: 'Price Bracket',
        cell: ({ row }) => {
          const { minPrice, maxPrice } = row.original;
          return (
            <span className="text-zinc-600 dark:text-zinc-400 text-xs font-mono">
              ₹{minPrice.toLocaleString()} - {maxPrice ? `₹${maxPrice.toLocaleString()}` : '∞'}
            </span>
          );
        },
      },
      {
        accessorKey: 'rate',
        header: 'GST Rate %',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 font-mono text-xs px-2.5 py-0.5"
          >
            {row.original.rate}%
          </Badge>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const t = row.original;
          const active = t.isActive !== false;
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={active}
                onCheckedChange={() => handleToggleStatus(t)}
                className="data-[state=checked]:bg-indigo-600 scale-90"
              />
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                {active ? 'Active' : 'Inactive'}
              </span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditDialog(t)}
                className="h-8 w-8 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setTaxToDelete(t);
                  setIsDeleteDialogOpen(true);
                }}
                className="h-8 w-8 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
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
            Tax & GST Rates
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Maintain applicable GST slabs and price threshold rules for automated calculations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTaxes}
            disabled={loading}
            className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs h-9"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button
            onClick={openAddDialog}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 shadow-md shadow-indigo-600/20"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Tax Rule
          </Button>
        </div>
      </div>

      {/* Tax Data Table */}
      <AdminDataTable
        columns={columns}
        data={taxes}
        searchKey="name"
        searchPlaceholder="Search tax rules by name..."
        isLoading={loading}
      />

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {editingTax ? 'Edit Tax Rule' : 'Add Tax Rule'}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Configure name, price thresholds, and percentage rate.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              {formError}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Rule Name *
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard GST Rate"
                required
                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Min Price (₹)
                </Label>
                <Input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Max Price (₹)
                </Label>
                <Input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="0"
                  className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs h-9 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Tax Percentage (%) *
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="18"
                  required
                  className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs h-9 font-mono pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 text-xs font-mono">
                  %
                </span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9"
              >
                {isSubmitting && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                )}
                {editingTax ? 'Save Changes' : 'Create Tax Rule'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Delete Tax Rule
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Are you sure you want to remove &quot;{taxToDelete?.name}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
