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
import VariationsSection from './VariationsSection';
import SearchSelect from '../../common/form/SearchSelect';
import { ArrowLeft, Loader2, Plus, Sparkles } from 'lucide-react';

interface AddProductProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddProduct({ onSuccess, onCancel }: AddProductProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    unregister,
    setValue,
    formState: { errors },
  } = useForm();

  const [categoryLevels, setCategoryLevels] = useState<
    { options: any[]; selected: any }[]
  >([]);
  const [colorOptions, setColorOptions] = useState<{ label: string; value: string }[]>([]);
  const [sizeOptions, setSizeOptions] = useState<{ label: string; value: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        const [rootCatRes, colorsRes, sizesRes] = await Promise.all([
          apiAdmin.get('/admin/categories/root'),
          apiAdmin.get('/admin/colors'),
          apiAdmin.get('/admin/sizes'),
        ]);

        if (rootCatRes.data?.data) {
          setCategoryLevels([{ options: rootCatRes.data.data, selected: null }]);
        }
        if (colorsRes.data?.data) {
          setColorOptions(
            colorsRes.data.data.map((c: any) => ({
              label: c.colorName,
              value: c._id,
            }))
          );
        }
        if (sizesRes.data?.data) {
          setSizeOptions(
            sizesRes.data.data.map((s: any) => ({
              label: s.sizeName,
              value: s._id,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load initial form data:', err);
      }
    };

    initData();
  }, []);

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

      if (!lastSelectedCategory) {
        throw new Error('Please select at least one category level.');
      }

      // Find highest category level
      const categoryLevelKeys = Object.keys(data).filter((k) =>
        k.startsWith('categoryLevel')
      );
      if (categoryLevelKeys.length === 0) {
        throw new Error('Category is required.');
      }

      const highestKey = categoryLevelKeys.reduce((a, b) =>
        +a.slice(13) > +b.slice(13) ? a : b
      );
      const categoryValue = data[highestKey];

      // Build payload
      const payload: any = {};
      for (const key in data) {
        if (key.startsWith('categoryLevel')) continue;
        if (key === 'variationColor' || key === 'variationSize') continue;
        if (key === 'variations') {
          payload.variations = data.variations;
          continue;
        }
        payload[key] = data[key];
      }

      payload.category =
        typeof categoryValue === 'string'
          ? categoryValue
          : categoryValue?._id;

      if (!payload.variations || payload.variations.length === 0) {
        throw new Error('Please create at least one product variant with price and quantity.');
      }

      await apiAdmin.post('/admin/products', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      onSuccess();
    } catch (err: any) {
      console.error('Failed to create product:', err);
      setFormError(
        err.response?.data?.message || err.message || 'Failed to create product.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 backdrop-blur-xl p-6 md:p-8 space-y-6 shadow-xs">
      {/* Top action */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Add New Product
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Fill in general details, categories, and generate variant matrix.
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
        {/* Core details */}
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
                  placeholder="e.g. Silk Organza Trench Coat"
                  className="mt-1 bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs h-9"
                />
              )}
            />
          </div>

          {/* Cascading Categories */}
          {categoryLevels.map((level, index) => (
            <div key={index} className="col-span-12 sm:col-span-6">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {index === 0 ? 'Primary Category *' : `Subcategory Level ${index} *`}
              </Label>
              <Controller
                name={`categoryLevel${index}`}
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <Select
                    value={level.selected ? level.selected._id : ''}
                    items={level.options.map((c) => ({ value: c._id, label: c.name }))}
                    onValueChange={(catId) => {
                      const sel = level.options.find((c) => c._id === catId);
                      field.onChange(sel);
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
              Search Keywords (Comma-separated)
            </Label>
            <Controller
              name="searchTags"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="trench, coat, organza, outerwear, luxury"
                  className="mt-1 bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs h-9"
                />
              )}
            />
          </div>

          {/* Filter Tags */}
          <div className="col-span-12 sm:col-span-6">
            <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Filter Tags (Comma-separated)
            </Label>
            <Controller
              name="filterTags"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="autumn, new, premium"
                  className="mt-1 bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs h-9"
                />
              )}
            />
          </div>

          {/* Description */}
          <div className="col-span-12">
            <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Editorial Description
            </Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="Detailed artisanal craftsmanship notes, fabric composition, care instructions..."
                  className="mt-1 bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs resize-none"
                />
              )}
            />
          </div>
        </div>

        {/* Variations Setup */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 p-5 space-y-4">
          <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Configure Variations
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Choose available colors and sizes to generate individual SKU variations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Variation Color Multi-select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Colors Available
              </Label>
              <Controller
                name="variationColor"
                control={control}
                render={({ field }) => (
                  <SearchSelect
                    options={colorOptions}
                    multiple={true}
                    label=""
                    hint=""
                    {...field}
                    placeholder="Select color variants..."
                  />
                )}
              />
            </div>

            {/* Variation Size Multi-select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Sizes Available
              </Label>
              <Controller
                name="variationSize"
                control={control}
                render={({ field }) => (
                  <SearchSelect
                    options={sizeOptions}
                    multiple={true}
                    label=""
                    hint=""
                    {...field}
                    placeholder="Select size variants..."
                  />
                )}
              />
            </div>
          </div>

          {/* Generated Matrix */}
          <VariationsSection
            control={control}
            watch={watch}
            sizeOptions={sizeOptions}
            colorOptions={colorOptions}
          />
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
            Publish Product
          </Button>
        </div>
      </form>
    </div>
  );
}
