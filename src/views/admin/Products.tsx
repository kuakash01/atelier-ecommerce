'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import apiAdmin from '@/config/apiAdmin';
import { AdminDataTable } from '@/components/admin/ui/AdminDataTable';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import AddProduct from '@/components/admin/Products/AddProduct';
import EditProduct from '@/components/admin/Products/EditProduct';
import VariationList from '@/components/admin/Products/VariationList';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Layers,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

interface ProductItem {
  _id: string;
  title: string;
  category?: any;
  thumbnail?: { url?: string; public_id?: string };
  newArrival?: boolean;
  variants?: any[];
  rating?: number;
  createdAt?: string;
}

export default function Products() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mode, setMode] = useState<'list' | 'add' | 'edit' | 'variants'>('list');
  const [activeProduct, setActiveProduct] = useState<ProductItem | null>(null);

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiAdmin.get('/admin/products');
      if (res.data?.data) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleNewArrival = async (productId: string, currentVal: boolean) => {
    try {
      await apiAdmin.patch(`/admin/products/${productId}/newArrival`, {
        status: !currentVal,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, newArrival: !currentVal } : p
        )
      );
    } catch (err) {
      console.error('Failed to toggle new arrival status:', err);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await apiAdmin.delete(`/admin/products/${productToDelete._id}`);
      setIsDeleteOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<ProductItem, any>[] = useMemo(
    () => [
      {
        id: 'thumbnail',
        header: 'Thumbnail',
        cell: ({ row }) => {
          const url = row.original.thumbnail?.url;
          return (
            <div className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 overflow-hidden flex items-center justify-center">
              {url ? (
                <img
                  src={url}
                  alt={row.original.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'title',
        header: 'Product Title',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
              {row.original.title}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              ID: {row.original._id.slice(-8).toUpperCase()}
            </span>
          </div>
        ),
      },
      {
        id: 'category',
        header: 'Category',
        cell: ({ row }) => {
          const cat = row.original.category;
          const catName =
            typeof cat === 'object' && cat ? cat.name : cat || 'Uncategorized';
          return (
            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              {catName}
            </span>
          );
        },
      },
      {
        accessorKey: 'newArrival',
        header: 'New Arrival',
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={!!p.newArrival}
                onCheckedChange={() =>
                  handleToggleNewArrival(p._id, !!p.newArrival)
                }
                className="data-[state=checked]:bg-indigo-600 scale-90"
              />
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                {p.newArrival ? 'Yes' : 'No'}
              </span>
            </div>
          );
        },
      },
      {
        id: 'variants',
        header: 'Variations',
        cell: ({ row }) => {
          const p = row.original;
          const count = p.variants?.length || 0;
          return (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 text-xs font-mono"
              >
                {count} SKUs
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveProduct(p);
                  setMode('variants');
                }}
                className="h-7 px-2 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
              >
                <Layers className="h-3 w-3 mr-1" />
                Manage
              </Button>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setActiveProduct(p);
                  setMode('edit');
                }}
                className="h-8 w-8 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setProductToDelete(p);
                  setIsDeleteOpen(true);
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
      {mode === 'list' && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                Product Catalog
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Maintain luxury fashion merchandise, variant galleries, and new arrival flags.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProducts}
                disabled={loading}
                className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs h-9"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button
                onClick={() => setMode('add')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 shadow-md shadow-indigo-600/20"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Product
              </Button>
            </div>
          </div>

          {/* Product Data Table */}
          <AdminDataTable
            columns={columns}
            data={products}
            searchKey="title"
            searchPlaceholder="Search products by title..."
            isLoading={loading}
          />
        </>
      )}

      {mode === 'add' && (
        <AddProduct
          onSuccess={() => {
            setMode('list');
            fetchProducts();
          }}
          onCancel={() => setMode('list')}
        />
      )}

      {mode === 'edit' && activeProduct && (
        <EditProduct
          product={activeProduct}
          onSuccess={() => {
            setMode('list');
            fetchProducts();
          }}
          onCancel={() => setMode('list')}
        />
      )}

      {mode === 'variants' && activeProduct && (
        <VariationList
          productId={activeProduct._id}
          onBack={() => {
            setMode('list');
            fetchProducts();
          }}
        />
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Are you sure you want to remove &quot;{productToDelete?.title}&quot;?
              This product and its variant listings will be marked as deleted and
              removed from the customer catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
