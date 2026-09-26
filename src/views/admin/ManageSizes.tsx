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
import { Plus, Pencil, Trash2, RefreshCw, Ruler, Loader2 } from 'lucide-react';

interface SizeItem {
  _id: string;
  sizeName: string;
  sizeValue?: string;
  createdAt?: string;
}

export default function ManageSizes() {
  const [sizes, setSizes] = useState<SizeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingSize, setEditingSize] = useState<SizeItem | null>(null);

  // Delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [sizeToDelete, setSizeToDelete] = useState<SizeItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form states
  const [sizeName, setSizeName] = useState('');
  const [sizeValue, setSizeValue] = useState('');
  const [formError, setFormError] = useState('');

  const fetchSizes = async () => {
    setLoading(true);
    try {
      const res = await apiAdmin.get('/admin/sizes');
      if (res.data?.data) {
        setSizes(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch sizes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  const openAddDialog = () => {
    setEditingSize(null);
    setSizeName('');
    setSizeValue('');
    setFormError('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (s: SizeItem) => {
    setEditingSize(s);
    setSizeName(s.sizeName || '');
    setSizeValue(s.sizeValue || '');
    setFormError('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeName.trim()) {
      setFormError('Size name is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingSize) {
        await apiAdmin.patch(`/admin/sizes/${editingSize._id}`, {
          sizeName: sizeName.trim(),
          sizeValue: sizeValue.trim() || sizeName.trim(),
        });
      } else {
        await apiAdmin.post('/admin/sizes', {
          sizeName: sizeName.trim(),
          sizeValue: sizeValue.trim() || sizeName.trim(),
        });
      }
      setIsDialogOpen(false);
      fetchSizes();
    } catch (err: any) {
      console.error('Failed to save size:', err);
      setFormError(
        err.response?.data?.message || err.response?.data?.error || 'Failed to save size.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!sizeToDelete) return;
    setIsSubmitting(true);
    try {
      await apiAdmin.delete(`/admin/sizes/${sizeToDelete._id}`);
      setIsDeleteDialogOpen(false);
      setSizeToDelete(null);
      fetchSizes();
    } catch (err: any) {
      console.error('Failed to delete size:', err);
      alert(err.response?.data?.message || 'Failed to delete size.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<SizeItem, any>[] = useMemo(
    () => [
      {
        accessorKey: 'sizeName',
        header: 'Size Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Badge
              variant="outline"
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 font-mono text-xs px-2 py-0.5"
            >
              {row.original.sizeName}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: 'sizeValue',
        header: 'Value / Label',
        cell: ({ row }) => (
          <span className="text-zinc-600 dark:text-zinc-400 text-xs font-mono">
            {row.original.sizeValue || row.original.sizeName}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditDialog(s)}
                className="h-8 w-8 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSizeToDelete(s);
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
            Size Variants
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Configure apparel dimensions, international size scales, and fitting options.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSizes}
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
            Add Size
          </Button>
        </div>
      </div>

      {/* Sizes Data Table */}
      <AdminDataTable
        columns={columns}
        data={sizes}
        searchKey="sizeName"
        searchPlaceholder="Search sizes by name..."
        isLoading={loading}
      />

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {editingSize ? 'Edit Size' : 'Add Size Variant'}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Provide size designation (e.g. S, M, L, XL, 32, 34).
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
                Size Name *
              </Label>
              <Input
                value={sizeName}
                onChange={(e) => setSizeName(e.target.value)}
                placeholder="e.g. XL or 42"
                required
                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs h-9 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Display Value / Full Label
              </Label>
              <Input
                value={sizeValue}
                onChange={(e) => setSizeValue(e.target.value)}
                placeholder="e.g. Extra Large (44in)"
                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs h-9"
              />
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
                {editingSize ? 'Save Changes' : 'Create Size'}
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
              Delete Size
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Are you sure you want to delete size &quot;{sizeToDelete?.sizeName}
              &quot;? Products with this size variant may need re-stocking adjustments.
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
