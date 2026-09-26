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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  RefreshCw,
  Sliders,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface CarouselSlide {
  _id: string;
  position?: number;
  desktopImage?: { url: string; public_id?: string };
  mobileImage?: { url: string; public_id?: string };
  redirectType?: string;
  redirectValue?: string;
  status?: boolean;
  createdAt?: string;
}

export default function HomeCarousel() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [slideToDelete, setSlideToDelete] = useState<CarouselSlide | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form states
  const [position, setPosition] = useState<string>('1');
  const [redirectType, setRedirectType] = useState<string>('category');
  const [redirectValue, setRedirectValue] = useState<string>('');
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string>('');
  const [mobilePreview, setMobilePreview] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Dropdown options
  const [categories, setCategories] = useState<{ _id: string; name: string; slug: string }[]>([]);
  const [products, setProducts] = useState<{ _id: string; title: string }[]>([]);

  const fetchCarousel = async () => {
    setLoading(true);
    try {
      const res = await apiAdmin.get('/admin/carousel');
      if (res.data?.data) {
        // sort by position
        const sorted = (res.data.data as CarouselSlide[]).sort(
          (a, b) => (a.position || 0) - (b.position || 0)
        );
        setSlides(sorted);
      }
    } catch (err) {
      console.error('Failed to load carousel slides:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarousel();

    // Fetch categories and products for redirect target
    const fetchTargets = async () => {
      try {
        const [catRes, prodRes] = await Promise.allSettled([
          apiAdmin.get('/admin/categories'),
          apiAdmin.get('/admin/products/list'),
        ]);
        if (catRes.status === 'fulfilled' && catRes.value.data?.data) {
          setCategories(catRes.value.data.data);
        }
        if (prodRes.status === 'fulfilled' && prodRes.value.data?.data) {
          setProducts(prodRes.value.data.data);
        }
      } catch (err) {
        console.error('Failed to load redirect targets:', err);
      }
    };
    fetchTargets();
  }, []);

  const openAddDialog = () => {
    setPosition(String(slides.length + 1));
    setRedirectType('category');
    setRedirectValue('');
    setDesktopFile(null);
    setMobileFile(null);
    setDesktopPreview('');
    setMobilePreview('');
    setFormError('');
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (slide: CarouselSlide) => {
    try {
      await apiAdmin.post(`/admin/carousel/${slide._id}/status`, {
        status: !slide.status,
      });
      setSlides((prev) =>
        prev.map((s) =>
          s._id === slide._id ? { ...s, status: !s.status } : s
        )
      );
    } catch (err) {
      console.error('Failed to update slide status:', err);
    }
  };

  const handleUpdatePosition = async (slideId: string, newPos: number) => {
    try {
      await apiAdmin.post(`/admin/carousel/${slideId}/position`, {
        position: newPos,
      });
      fetchCarousel();
    } catch (err) {
      console.error('Failed to update position:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desktopFile) {
      setFormError('Desktop banner image is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const formData = new FormData();
    formData.append('position', position);
    formData.append('desktopImage', desktopFile);
    if (mobileFile) {
      formData.append('mobileImage', mobileFile);
    } else {
      formData.append('mobileImage', desktopFile);
    }
    formData.append('redirectType', redirectType);
    formData.append('redirectValue', redirectValue || '');

    try {
      await apiAdmin.post('/admin/carousel', formData);
      setIsDialogOpen(false);
      fetchCarousel();
    } catch (err: any) {
      console.error('Failed to upload carousel slide:', err);
      setFormError(
        err.response?.data?.message || 'Failed to upload slide image.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!slideToDelete) return;
    setIsSubmitting(true);
    try {
      await apiAdmin.delete(`/admin/carousel/${slideToDelete._id}`);
      setIsDeleteDialogOpen(false);
      setSlideToDelete(null);
      fetchCarousel();
    } catch (err: any) {
      console.error('Failed to delete slide:', err);
      alert(err.response?.data?.message || 'Failed to delete slide.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<CarouselSlide, any>[] = useMemo(
    () => [
      {
        accessorKey: 'position',
        header: 'Order',
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                #{s.position ?? 1}
              </span>
            </div>
          );
        },
      },
      {
        id: 'preview',
        header: 'Desktop Banner',
        cell: ({ row }) => {
          const url = row.original.desktopImage?.url;
          return (
            <div className="h-14 w-32 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 overflow-hidden flex items-center justify-center">
              {url ? (
                <img
                  src={url}
                  alt="Slide preview"
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
        id: 'mobile',
        header: 'Mobile Banner',
        cell: ({ row }) => {
          const url = row.original.mobileImage?.url;
          return (
            <div className="h-14 w-14 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 overflow-hidden flex items-center justify-center">
              {url ? (
                <img
                  src={url}
                  alt="Mobile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              )}
            </div>
          );
        },
      },
      {
        id: 'redirect',
        header: 'Click Destination',
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex flex-col">
              <span className="text-[11px] uppercase font-mono text-zinc-500">
                Type: {s.redirectType || 'general'}
              </span>
              <span className="text-xs text-zinc-800 dark:text-zinc-300 font-mono truncate max-w-[180px]">
                {s.redirectValue || '—'}
              </span>
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const s = row.original;
          const active = s.status !== false;
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={active}
                onCheckedChange={() => handleToggleStatus(s)}
                className="data-[state=checked]:bg-indigo-600 scale-90"
              />
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                {active ? 'Active' : 'Hidden'}
              </span>
            </div>
          );
        },
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
                onClick={() => {
                  setSlideToDelete(s);
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Sliders className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Hero Carousel Slides
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage high-impact hero banners, click-through destinations, and display priority.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCarousel}
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
            Add Slide
          </Button>
        </div>
      </div>

      {/* Carousel Table */}
      <AdminDataTable
        columns={columns}
        data={slides}
        searchPlaceholder="Filter carousel slides..."
        isLoading={loading}
      />

      {/* Add Slide Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Add New Carousel Slide
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Upload banners optimized for desktop and mobile viewport sizes.
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
                Display Position Order
              </Label>
              <Input
                type="number"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="1"
                required
                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs h-9 font-mono"
              />
            </div>

            {/* Desktop Banner Upload */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Desktop Banner Image * (1920x600 recommended)
              </Label>
              {desktopPreview && (
                <div className="relative h-20 w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900">
                  <img
                    src={desktopPreview}
                    alt="Desktop preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                required
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setDesktopFile(file);
                    setDesktopPreview(URL.createObjectURL(file));
                  }
                }}
                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-800 dark:file:text-zinc-200 file:border-0 file:rounded file:text-xs file:px-2"
              />
            </div>

            {/* Mobile Banner Upload */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Mobile Banner Image (Optional, 800x800)
              </Label>
              {mobilePreview && (
                <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900">
                  <img
                    src={mobilePreview}
                    alt="Mobile preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setMobileFile(file);
                    setMobilePreview(URL.createObjectURL(file));
                  }
                }}
                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-800 dark:file:text-zinc-200 file:border-0 file:rounded file:text-xs file:px-2"
              />
            </div>

            {/* Redirect Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Target Type
                </Label>
                <Select
                  value={redirectType}
                  onValueChange={(val: any) => {
                    setRedirectType(val || 'category');
                    setRedirectValue('');
                  }}
                >
                  <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs h-9">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs">
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="url">Custom Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Target Value
                </Label>
                {redirectType === 'category' ? (
                  <Select
                    value={redirectValue}
                    items={categories.map((c) => ({ value: c.slug || c._id, label: c.name }))}
                    onValueChange={(val: any) => setRedirectValue(val || '')}
                  >
                    <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs h-9">
                      <SelectValue placeholder="Select Category">
                        {categories.find((c) => (c.slug || c._id) === redirectValue)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs">
                      {categories.map((c) => (
                        <SelectItem key={c._id} value={c.slug || c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : redirectType === 'product' ? (
                  <Select
                    value={redirectValue}
                    items={products.map((p) => ({ value: p._id, label: p.title }))}
                    onValueChange={(val: any) => setRedirectValue(val || '')}
                  >
                    <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs h-9">
                      <SelectValue placeholder="Select Product">
                        {products.find((p) => p._id === redirectValue)?.title}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs">
                      {products.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={redirectValue}
                    onChange={(e) => setRedirectValue(e.target.value)}
                    placeholder="/shop or /collections"
                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs h-9 font-mono"
                  />
                )}
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
                Upload Slide
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
              Delete Slide
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Are you sure you want to delete this hero carousel slide? It will immediately stop appearing on the homepage.
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
