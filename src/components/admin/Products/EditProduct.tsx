'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import apiAdmin from '@/config/apiAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, Pencil } from 'lucide-react';

interface EditProductProps {
  product: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditProduct({
  product,
  onSuccess,
  onCancel,
}: EditProductProps) {
  const {
    control,
    handleSubmit,
    setValue,
    unregister,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      title: product?.title || '',
      description: product?.description || '',
      searchTags: Array.isArray(product?.searchTags)
        ? product.searchTags.join(', ')
        : product?.searchTags || '',
      filterTags: Array.isArray(product?.filterTags)
        ? product.filterTags.join(', ')
        : product?.filterTags || '',
    },
  });

  const [categoryLevels, setCategoryLevels] = useState<
    { options: any[]; selected: any }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        const rootCatRes = await apiAdmin.get('/admin/categories/root');
        const rootCats = rootCatRes.data?.data || [];
        const catId =
          typeof product?.category === 'object'
            ? product?.category?._id
            : product?.category;

        if (catId) {
          try {
            const chainRes = await apiAdmin.get(`/admin/categories/${catId}/chain`);
            const chain = chainRes.data?.data || [];

            if (chain.length > 0) {
              const levels: { options: any[]; selected: any }[] = [];
              let currentOptions = rootCats;

              for (let i = 0; i < chain.length; i++) {
                const item = chain[i];
                levels.push({ options: currentOptions, selected: item });
                setValue(`categoryLevel${i}`, item._id);

                const childrenRes = await apiAdmin.get(
                  `/admin/categories/${item._id}/children`
                );
                currentOptions = childrenRes.data?.data || [];
              }

              if (currentOptions.length > 0) {
                levels.push({ options: currentOptions, selected: null });
              }

              setCategoryLevels(levels);
              return;
            }
          } catch (e) {
            console.error('Failed to load category chain:', e);
          }
        }

        const initialSelected =
          typeof product?.category === 'object'
            ? product.category
            : rootCats.find((c: any) => c._id === product?.category) || null;

        setCategoryLevels([
          { options: rootCats, selected: initialSelected },
        ]);
        if (initialSelected) {
          setValue('categoryLevel0', initialSelected._id);
        }
      } catch (err) {
        console.error('Failed to load categories for editing:', err);
      }
    };

    initData();
  }, [product, setValue]);

  const handleCategoryChange = async (levelIndex: number, selected: any) => {
    const updated = [...categoryLevels];
    updated[levelIndex].selected = selected;
    const removed = updated.splice(levelIndex + 1);
    setCategoryLevels(updated);

    removed.forEach((_, idx) => {
      unregister(`categoryLevel${levelIndex + 1 + idx}`);
    });

    if (selected?._id) {
      try {
        const res = await apiAdmin.get(`/admin/categories/${selected._id}/children`);
        if (res.data?.data && res.data.data.length > 0) {
          setCategoryLevels((prev) => [
            ...prev,
            { options: res.data.data, selected: null },
          ]);
        }
      } catch (err) {
        console.error('Error fetching child categories:', err);
      }
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setFormError('');

    try {
      const lastSelectedCategory = categoryLevels
        .map((l) => l.selected)
        .filter(Boolean)
        .pop();

      const payload: any = {};
      for (const key in data) {
        if (key.startsWith('categoryLevel')) continue;
        payload[key] = data[key];
      }

      if (lastSelectedCategory) {
        payload.category =
          typeof lastSelectedCategory === 'string'
            ? lastSelectedCategory
            : lastSelectedCategory?._id;
      }

      // Format search tags & filter tags if string
      if (typeof payload.searchTags === 'string') {
        payload.searchTags = payload.searchTags
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
      if (typeof payload.filterTags === 'string') {
        payload.filterTags = payload.filterTags
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);
      }

      await apiAdmin.patch(`/admin/products/${product._id}`, payload);
      onSuccess();
    } catch (err: any) {
      console.error('Failed to update product:', err);
      setFormError(
        err.response?.data?.message || err.message || 'Failed to update product.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 backdrop-blur-xl p-6 md:p-8 space-y-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Pencil className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Edit Product Information
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Modify base product metadata, category classification, and search terms.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs h-9"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to List
        </Button>
      </div>

      {formError && (
        <Alert className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs py-2.5">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-12 gap-4">
          {/* Title */}
          <div className="col-span-12 sm:col-span-6">
            <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Product Title *
            </Label>
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Product title is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Product title"
                  className="mt-1 bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs h-9"
                />
              )}
            />
          </div>

          {/* Category Levels */}
          {categoryLevels.map((level, index) => (
            <div key={index} className="col-span-12 sm:col-span-6">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {index === 0 ? 'Primary Category' : `Subcategory Level ${index}`}
              </Label>
              <Controller
                name={`categoryLevel${index}`}
                control={control}
                render={({ field }) => (
                  <Select
                    value={level.selected ? level.selected._id : ''}
                    items={level.options.map((c) => ({ value: c._id, label: c.name }))}
                    onValueChange={(catId) => {
                      const sel = level.options.find((c) => c._id === catId);
                      field.onChange(sel ? sel._id : catId);
                      handleCategoryChange(index, sel);
                    }}
                  >
                    <SelectTrigger className="mt-1 bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs h-9">
                      <SelectValue placeholder="Select Category...">
                        {level.selected?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs">
                      {level.options.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          ))}

          {/* Search Tags */}
          <div className="col-span-12 sm:col-span-6">
            <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Search Keywords
            </Label>
            <Controller
              name="searchTags"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Comma-separated keywords"
                  className="mt-1 bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs h-9"
                />
              )}
            />
          </div>

          {/* Filter Tags */}
          <div className="col-span-12 sm:col-span-6">
            <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Filter Tags
            </Label>
            <Controller
              name="filterTags"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Comma-separated tags"
                  className="mt-1 bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs h-9"
                />
              )}
            />
          </div>

          {/* Description */}
          <div className="col-span-12">
            <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Description
            </Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="Product description..."
                  className="mt-1 bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs resize-none"
                />
              )}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs h-9"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-6 shadow-md shadow-indigo-600/20"
          >
            {isSubmitting && (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            )}
            Update Product
          </Button>
        </div>
      </form>
    </div>
  );
}
