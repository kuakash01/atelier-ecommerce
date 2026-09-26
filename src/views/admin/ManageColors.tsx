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
import { Plus, Pencil, Trash2, RefreshCw, Palette, Loader2 } from 'lucide-react';

interface ColorItem {
  _id: string;
  colorName: string;
  colorHex: string;
  createdAt?: string;
}

export default function ManageColors() {
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingColor, setEditingColor] = useState<ColorItem | null>(null);

  // Delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [colorToDelete, setColorToDelete] = useState<ColorItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form states
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#6366f1');
  const [formError, setFormError] = useState('');

  const fetchColors = async () => {
    setLoading(true);
    try {
      const res = await apiAdmin.get('/admin/colors');
      if (res.data?.data) {
        setColors(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch colors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const openAddDialog = () => {
    setEditingColor(null);
    setColorName('');
    setColorHex('#6366f1');
    setFormError('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (c: ColorItem) => {
    setEditingColor(c);
    setColorName(c.colorName || '');
    setColorHex(c.colorHex || '#000000');
    setFormError('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorName.trim()) {
      setFormError('Color name is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingColor) {
        await apiAdmin.patch(`/admin/colors/${editingColor._id}`, {
          colorName: colorName.trim(),
          colorHex: colorHex.trim(),
        });
      } else {
        await apiAdmin.post('/admin/colors', {
          colorName: colorName.trim(),
          colorHex: colorHex.trim(),
        });
      }
      setIsDialogOpen(false);
      fetchColors();
    } catch (err: any) {
      console.error('Failed to save color:', err);
      setFormError(
        err.response?.data?.message || err.response?.data?.error || 'Failed to save color.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!colorToDelete) return;
    setIsSubmitting(true);
    try {
      await apiAdmin.delete(`/admin/colors/${colorToDelete._id}`);
      setIsDeleteDialogOpen(false);
      setColorToDelete(null);
      fetchColors();
    } catch (err: any) {
      console.error('Failed to delete color:', err);
      alert(err.response?.data?.message || 'Failed to delete color.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<ColorItem, any>[] = useMemo(
    () => [
      {
        id: 'swatch',
        header: 'Swatch',
        cell: ({ row }) => {
          const hex = row.original.colorHex || '#000000';
          return (
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-full border border-zinc-700/80 shadow-inner shrink-0"
                style={{ backgroundColor: hex }}
              />
            </div>
          );
        },
      },
      {
        accessorKey: 'colorName',
        header: 'Color Name',
        cell: ({ row }) => (
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
            {row.original.colorName}
          </span>
        ),
      },
      {
        accessorKey: 'colorHex',
        header: 'Hex Code',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-zinc-700 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
            {row.original.colorHex}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditDialog(c)}
                className="h-8 w-8 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setColorToDelete(c);
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
            Color Palette
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Define available product colors, hex swatches, and filter tags.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchColors}
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
            Add Color
          </Button>
        </div>
      </div>

      {/* Colors Data Table */}
      <AdminDataTable
        columns={columns}
        data={colors}
        searchKey="colorName"
        searchPlaceholder="Search colors by name..."
        isLoading={loading}
      />

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {editingColor ? 'Edit Color' : 'Add New Color'}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Specify the color label and select or type its hexadecimal code.
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
                Color Name *
              </Label>
              <Input
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="e.g. Midnight Navy"
                required
                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Hex Swatch *
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded border border-zinc-200 dark:border-zinc-700 bg-transparent p-0.5"
                />
                <Input
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  placeholder="#000000"
                  required
                  className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs h-9 font-mono"
                />
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
                {editingColor ? 'Save Changes' : 'Create Color'}
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
              Delete Color
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Are you sure you want to delete &quot;{colorToDelete?.colorName}
              &quot;? Products using this color variant will lose their swatch
              mapping.
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
