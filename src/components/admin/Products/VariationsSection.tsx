'use client';

import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface VariationsSectionProps {
  control: Control<any>;
  watch: (name: string) => any;
  sizeOptions: { label: string; value: string }[];
  colorOptions: { label: string; value: string }[];
}

export default function VariationsSection({
  control,
  watch,
  sizeOptions,
  colorOptions,
}: VariationsSectionProps) {
  const variationColor = watch('variationColor') || [];
  const variationSize = watch('variationSize') || [];

  const {
    fields: variationFields,
    remove: removeVariation,
    replace: replaceVariation,
  } = useFieldArray({
    control,
    name: 'variations',
  });

  const [removedVariations, setRemovedVariations] = useState<
    { color: string; size: string }[]
  >([]);

  useEffect(() => {
    if (variationColor.length === 0 && variationSize.length === 0) {
      if (variationFields.length > 0) replaceVariation([]);
      return;
    }

    const newVariations: any[] = [];

    for (const color of variationColor) {
      for (const size of variationSize) {
        if (
          removedVariations.some(
            (r) => r.color === color && r.size === size
          )
        ) {
          continue;
        }

        const existing = variationFields.find(
          (f: any) => f.color === color && f.size === size
        );
        if (existing) {
          newVariations.push(existing);
        } else {
          newVariations.push({
            color,
            size,
            price: '',
            mrp: '',
            quantity: '',
          });
        }
      }
    }

    const isSame =
      newVariations.length === variationFields.length &&
      newVariations.every(
        (v, i) =>
          v.color === (variationFields[i] as any)?.color &&
          v.size === (variationFields[i] as any)?.size
      );

    if (!isSame) {
      replaceVariation(newVariations);
    }
  }, [variationColor, variationSize, replaceVariation, removedVariations]);

  useEffect(() => {
    setRemovedVariations([]);
  }, [
    Array.isArray(variationColor) ? variationColor.join(',') : '',
    Array.isArray(variationSize) ? variationSize.join(',') : '',
  ]);

  const handleRemove = (index: number) => {
    const item = variationFields[index] as any;
    if (item) {
      setRemovedVariations((prev) => [
        ...prev,
        { color: item.color, size: item.size },
      ]);
    }
    removeVariation(index);
  };

  if (variationFields.length === 0) {
    return (
      <div className="col-span-12 py-4 text-center text-xs text-zinc-500 italic bg-white dark:bg-zinc-950/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
        Select colors and sizes above to auto-generate variant combinations.
      </div>
    );
  }

  return (
    <div className="col-span-12 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          Variant Inventory Matrix ({variationFields.length})
        </Label>
        <span className="text-[11px] text-zinc-500">
          Base Price, MRP, and Stock Units per Variant
        </span>
      </div>

      <div className="space-y-2.5">
        {variationFields.map((item: any, index: number) => {
          const colorObj = colorOptions.find((c) => c.value === item.color);
          const sizeObj = sizeOptions.find((s) => s.value === item.size);

          return (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-3 items-center rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 p-3.5 shadow-xs"
            >
              {/* Color label */}
              <div className="col-span-6 sm:col-span-3">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                  Color
                </span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
                  {colorObj?.label || item.color}
                </span>
              </div>

              {/* Size label */}
              <div className="col-span-6 sm:col-span-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                  Size
                </span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 font-mono bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                  {sizeObj?.label || item.size}
                </span>
              </div>

              {/* Price */}
              <div className="col-span-4 sm:col-span-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                  Selling Price (₹) *
                </span>
                <Controller
                  name={`variations.${index}.price`}
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="Price"
                      className="h-8 text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                  )}
                />
              </div>

              {/* MRP */}
              <div className="col-span-4 sm:col-span-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                  MRP (₹) *
                </span>
                <Controller
                  name={`variations.${index}.mrp`}
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="MRP"
                      className="h-8 text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                  )}
                />
              </div>

              {/* Quantity */}
              <div className="col-span-3 sm:col-span-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                  Stock Qty *
                </span>
                <Controller
                  name={`variations.${index}.quantity`}
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="0"
                      className="h-8 text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                  )}
                />
              </div>

              {/* Delete button */}
              <div className="col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  className="h-7 w-7 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
