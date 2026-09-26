'use client';

import React, { useMemo, useState, useEffect } from 'react';
import apiAdmin from '@/config/apiAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  Image as ImageIcon,
  Check,
  Loader2,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface VariantItem {
  _id: string;
  color: any;
  size: any;
  price: number;
  mrp: number;
  quantity: number;
  sku?: string;
  isActive?: boolean;
}

interface GalleryImage {
  url: string;
  public_id?: string;
  position?: number;
}

interface ColorGallery {
  color: any;
  gallery: GalleryImage[];
}

interface VariationListProps {
  productId: string;
  onBack: () => void;
}

export default function VariationList({ productId, onBack }: VariationListProps) {
  const [variations, setVariations] = useState<VariantItem[]>([]);
  const [colorGalleries, setColorGalleries] = useState<ColorGallery[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add variant dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newMrp, setNewMrp] = useState('');
  const [newQty, setNewQty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit variant dialog
  const [editingVariant, setEditingVariant] = useState<VariantItem | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editMrp, setEditMrp] = useState('');
  const [editQty, setEditQty] = useState('');
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Image upload and action state per color
  const [uploadingColor, setUploadingColor] = useState<string | null>(null);
  const [galleryActionLoading, setGalleryActionLoading] = useState<string | null>(null);

  const fetchVariantData = async () => {
    setLoading(true);
    try {
      const [varRes, galRes, colRes, sizRes] = await Promise.all([
        apiAdmin.get(`/admin/products/${productId}/variants`),
        apiAdmin.get(`/admin/products/${productId}/color-gallery`),
        apiAdmin.get('/admin/colors'),
        apiAdmin.get('/admin/sizes'),
      ]);

      if (varRes.data?.variations) {
        setVariations(varRes.data.variations);
      }
      if (galRes.data?.data) {
        setColorGalleries(galRes.data.data);
      }
      if (colRes.data?.data) {
        setColors(colRes.data.data);
      }
      if (sizRes.data?.data) {
        setSizes(sizRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load product variations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariantData();
  }, [productId]);

  const groupedByColor = useMemo(() => {
    const map: Record<
      string,
      { color: any; gallery: GalleryImage[]; variations: VariantItem[] }
    > = {};

    variations.forEach((v) => {
      const colorId = typeof v.color === 'object' && v.color ? v.color._id : v.color;
      if (!colorId) return;

      if (!map[colorId]) {
        const matchedGal = colorGalleries.find((cg) => {
          const cId = typeof cg.color === 'object' && cg.color ? cg.color._id : cg.color;
          return cId === colorId;
        });

        map[colorId] = {
          color: v.color,
          gallery: matchedGal?.gallery || [],
          variations: [],
        };
      }

      map[colorId].variations.push(v);
    });

    return Object.values(map);
  }, [variations, colorGalleries]);

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColor || !selectedSize || !newPrice || !newMrp || !newQty) {
      setAddError('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    setAddError('');

    try {
      await apiAdmin.post(`/admin/products/${productId}/variants`, {
        color: selectedColor,
        size: selectedSize,
        price: Number(newPrice),
        mrp: Number(newMrp),
        quantity: Number(newQty),
      });

      setIsAddOpen(false);
      setSelectedColor('');
      setSelectedSize('');
      setNewPrice('');
      setNewMrp('');
      setNewQty('');
      fetchVariantData();
    } catch (err: any) {
      console.error('Failed to add variant:', err);
      setAddError(err.response?.data?.message || 'Failed to add variant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (v: VariantItem) => {
    setEditingVariant(v);
    setEditPrice(String(v.price ?? ''));
    setEditMrp(String(v.mrp ?? ''));
    setEditQty(String(v.quantity ?? ''));
    setEditError('');
    setIsEditOpen(true);
  };

  const handleSaveVariantEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant) return;

    setIsEditSubmitting(true);
    setEditError('');

    try {
      const updates = {
        price: Number(editPrice),
        mrp: Number(editMrp),
        quantity: Number(editQty),
      };

      await apiAdmin.patch(
        `/admin/products/${productId}/variants/${editingVariant._id}`,
        updates
      );

      setVariations((prev) =>
        prev.map((v) => (v._id === editingVariant._id ? { ...v, ...updates } : v))
      );
      setIsEditOpen(false);
      setEditingVariant(null);
    } catch (err: any) {
      console.error('Failed to update variant:', err);
      setEditError(err.response?.data?.message || 'Failed to update variant.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Are you sure you want to remove this variant?')) return;
    try {
      await apiAdmin.delete(`/admin/products/${productId}/variants/${variantId}`);
      setVariations((prev) => prev.filter((v) => v._id !== variantId));
    } catch (err) {
      console.error('Failed to delete variant:', err);
    }
  };

  const handleImageUpload = async (colorId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingColor(colorId);
    const formData = new FormData();
    Array.from(files).forEach((f) => {
      formData.append('newImages', f);
    });

    try {
      await apiAdmin.patch(`/admin/products/${productId}/color-gallery/${colorId}`, formData);
      fetchVariantData();
    } catch (err) {
      console.error('Failed to upload images:', err);
    } finally {
      setUploadingColor(null);
    }
  };

  const handleUpdateGallery = async (
    colorId: string,
    updatedGallery: GalleryImage[]
  ) => {
    setGalleryActionLoading(colorId);
    try {
      const indexedGallery = updatedGallery.map((img, idx) => ({
        ...img,
        position: idx + 1,
      }));

      const formData = new FormData();
      formData.append('gallery', JSON.stringify(indexedGallery));

      await apiAdmin.patch(
        `/admin/products/${productId}/color-gallery/${colorId}`,
        formData
      );

      setColorGalleries((prev) =>
        prev.map((cg) => {
          const cId = typeof cg.color === 'object' && cg.color ? cg.color._id : cg.color;
          if (cId === colorId) {
            return {
              ...cg,
              gallery: indexedGallery,
            };
          }
          return cg;
        })
      );
    } catch (err) {
      console.error('Failed to update gallery:', err);
    } finally {
      setGalleryActionLoading(null);
    }
  };

  const handleMoveImage = (colorId: string, fromIndex: number, toIndex: number) => {
    const currentGroup = groupedByColor.find((g) => {
      const cId = typeof g.color === 'object' && g.color ? g.color._id : g.color;
      return cId === colorId;
    });
    if (!currentGroup || !currentGroup.gallery) return;
    if (toIndex < 0 || toIndex >= currentGroup.gallery.length) return;

    const list = [...currentGroup.gallery];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);

    handleUpdateGallery(colorId, list);
  };

  const handleDeleteImage = (colorId: string, indexToRemove: number) => {
    const currentGroup = groupedByColor.find((g) => {
      const cId = typeof g.color === 'object' && g.color ? g.color._id : g.color;
      return cId === colorId;
    });
    if (!currentGroup || !currentGroup.gallery) return;
    if (!confirm('Are you sure you want to remove this photo?')) return;

    const list = currentGroup.gallery.filter((_, idx) => idx !== indexToRemove);
    handleUpdateGallery(colorId, list);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            Product Variation Manager
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Organize color-specific photo shoots, positions, stock levels, and pricing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs h-9"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Products
          </Button>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 shadow-md shadow-indigo-600/20"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Variant
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-zinc-500 flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
          <span>Loading SKU variations...</span>
        </div>
      ) : groupedByColor.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-12 text-center text-zinc-500 space-y-3">
          <Package className="h-10 w-10 mx-auto text-zinc-400 dark:text-zinc-600" />
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-300">No variants found</p>
          <p className="text-xs max-w-sm mx-auto">
            Click &quot;Add Variant&quot; above to create combinations with pricing and stock.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByColor.map((group) => {
            const colorName = group.color?.colorName || 'Default Color';
            const colorHex = group.color?.colorHex || '#000000';
            const colorId = group.color?._id || group.color;

            return (
              <div
                key={colorId}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden shadow-xs"
              >
                {/* Color header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-6 w-6 rounded-full border border-zinc-300 dark:border-zinc-700 shadow-sm shrink-0"
                      style={{ backgroundColor: colorHex }}
                    />
                    <div>
                      <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {colorName}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono ml-2">
                        ({group.variations.length} sizes, {group.gallery.length} photos)
                      </span>
                    </div>
                  </div>

                  {/* Actions for this color */}
                  <div className="flex items-center gap-3">
                    {/* Upload button */}
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`file-${colorId}`}
                        className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700 shadow-xs"
                      >
                        {uploadingColor === colorId || galleryActionLoading === colorId ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ImageIcon className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                        )}
                        <span>Upload Photos</span>
                      </Label>
                      <input
                        id={`file-${colorId}`}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(colorId, e.target.files)}
                      />
                    </div>
                  </div>
                </div>

                {/* Color Gallery Preview Strip with Position Badges and Ordering */}
                {group.gallery.length > 0 ? (
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/60 flex items-center gap-4 overflow-x-auto">
                    {group.gallery.map((img: GalleryImage, i: number) => {
                      const posNumber = img.position !== undefined ? img.position : i + 1;

                      return (
                        <div
                          key={i}
                          className="relative group rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 w-24 h-32 bg-zinc-100 dark:bg-zinc-950 flex flex-col justify-between p-1.5 transition-all shadow-xs"
                        >
                          <img
                            src={img.url}
                            alt={`Position ${posNumber}`}
                            className="absolute inset-0 h-full w-full object-cover -z-0"
                          />

                          {/* Gradient overlay for badges and controls */}
                          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none" />

                          {/* Top Badge: Position Indicator */}
                          <div className="relative z-10 flex items-center justify-between gap-1">
                            <span className="font-mono text-[10px] font-bold bg-black/75 px-1.5 py-0.5 rounded text-zinc-100 border border-zinc-700/60 shadow-xs">
                              #{posNumber}
                            </span>
                          </div>

                          {/* Bottom Action Controls on Hover */}
                          <div className="relative z-10 flex items-center justify-between gap-1 opacity-90 group-hover:opacity-100 transition-opacity bg-zinc-950/80 p-1 rounded-lg border border-zinc-800 backdrop-blur-sm">
                            <button
                              type="button"
                              title="Move Left"
                              disabled={i === 0}
                              onClick={() => handleMoveImage(colorId, i, i - 1)}
                              className="h-5 w-5 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>

                            <button
                              type="button"
                              title="Move Right"
                              disabled={i === group.gallery.length - 1}
                              onClick={() => handleMoveImage(colorId, i, i + 1)}
                              className="h-5 w-5 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>

                            <button
                              type="button"
                              title="Delete Photo"
                              onClick={() => handleDeleteImage(colorId, i)}
                              className="h-5 w-5 rounded flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 ml-0.5 cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 border-b border-zinc-200 dark:border-zinc-800/40 text-[11px] text-zinc-500 italic text-center">
                    No gallery images uploaded for this color swatch yet.
                  </div>
                )}

                {/* Variant Sizing and Inventory Rows with Edit & Delete */}
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                  {group.variations.map((v) => {
                    const sizeLabel = v.size?.sizeName || v.size || 'Standard';

                    return (
                      <div
                        key={v._id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="bg-zinc-100 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 font-mono text-xs px-2.5 py-0.5"
                          >
                            Size: {sizeLabel}
                          </Badge>
                          <span
                            className={`text-[11px] font-mono font-medium ${
                              v.quantity > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {v.quantity > 0
                              ? `${v.quantity} in stock`
                              : 'Out of Stock'}
                          </span>
                          {v.sku && (
                            <span className="text-[10px] text-zinc-500 font-mono hidden md:inline">
                              SKU: {v.sku}
                            </span>
                          )}
                        </div>

                        {/* Inline price & stock info + Edit & Delete buttons */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-zinc-500 uppercase">
                              Price:
                            </span>
                            <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 font-mono">
                              {formatCurrency(v.price)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-zinc-500 uppercase">
                              MRP:
                            </span>
                            <span className="text-xs text-zinc-400 font-mono line-through">
                              {formatCurrency(v.mrp)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 ml-auto sm:ml-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit Variant"
                              onClick={() => openEditDialog(v)}
                              className="h-8 w-8 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-indigo-500/10 cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete Variant"
                              onClick={() => handleDeleteVariant(v._id)}
                              className="h-8 w-8 text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Variant Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 sm:max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Pencil className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              Edit Variation
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Update selling price, maximum retail price (MRP), and available inventory.
            </DialogDescription>
          </DialogHeader>

          {editError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-lg border border-rose-200 dark:border-rose-500/20">
              {editError}
            </p>
          )}

          {editingVariant && (
            <form onSubmit={handleSaveVariantEdit} className="space-y-4">
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900/60 p-3 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">Color: </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {editingVariant.color?.colorName || 'Color'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">Size: </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {editingVariant.size?.sizeName || 'Size'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Price (₹) *
                  </Label>
                  <Input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="1499"
                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs h-9 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    MRP (₹) *
                  </Label>
                  <Input
                    type="number"
                    required
                    value={editMrp}
                    onChange={(e) => setEditMrp(e.target.value)}
                    placeholder="2499"
                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs h-9 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Quantity *
                  </Label>
                  <Input
                    type="number"
                    required
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    placeholder="10"
                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs h-9 font-mono"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9"
                >
                  {isEditSubmitting && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Variant Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 sm:max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Add Single SKU Variant
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Assign a new size and color combination with individual price and stock.
            </DialogDescription>
          </DialogHeader>

          {addError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-lg border border-rose-200 dark:border-rose-500/20">
              {addError}
            </p>
          )}

          <form onSubmit={handleAddVariant} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Color *
                </Label>
                <Select
                  value={selectedColor}
                  items={colors.map((c) => ({ value: c._id, label: c.colorName }))}
                  onValueChange={(val: any) => setSelectedColor(val || '')}
                >
                  <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs h-9">
                    <SelectValue placeholder="Select Color">
                      {colors.find((c) => c._id === selectedColor)?.colorName}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs">
                    {colors.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.colorName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Size *
                </Label>
                <Select
                  value={selectedSize}
                  items={sizes.map((s) => ({ value: s._id, label: s.sizeName }))}
                  onValueChange={(val: any) => setSelectedSize(val || '')}
                >
                  <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs h-9">
                    <SelectValue placeholder="Select Size">
                      {sizes.find((s) => s._id === selectedSize)?.sizeName}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs">
                    {sizes.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.sizeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Price (₹) *
                </Label>
                <Input
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="1499"
                  className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  MRP (₹) *
                </Label>
                <Input
                  type="number"
                  required
                  value={newMrp}
                  onChange={(e) => setNewMrp(e.target.value)}
                  placeholder="2499"
                  className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Quantity *
                </Label>
                <Input
                  type="number"
                  required
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  placeholder="10"
                  className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs h-9 font-mono"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs h-9"
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
                Add Variant
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
