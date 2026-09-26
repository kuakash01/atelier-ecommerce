'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import apiAdmin from '@/config/apiAdmin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Megaphone,
  Eye,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Sparkles,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Palette,
  Clock,
  ArrowRight,
  Layers,
  Wand2,
} from 'lucide-react';

interface AnnouncementItemState {
  id: string;
  text: string;
  link: string;
}

const COLOR_PRESETS = [
  { name: 'Midnight Onyx', bg: '#09090b', text: '#f4f4f5' },
  { name: 'Royal Indigo', bg: '#1e1b4b', text: '#e0e7ff' },
  { name: 'Forest Emerald', bg: '#022c22', text: '#d1fae5' },
  { name: 'Deep Burgundy', bg: '#4c0519', text: '#ffe4e6' },
  { name: 'Luxe Amber', bg: '#451a03', text: '#fef3c7' },
  { name: 'Graphite Dark', bg: '#18181b', text: '#fafafa' },
];

const QUICK_TEMPLATES = [
  { text: 'Complimentary Express Delivery on orders over ₹1,500', link: '/shop' },
  { text: 'Use code LUXE10 for 10% off your first order', link: '/shop' },
  { text: '30-Day Complimentary Doorstep Returns & Exchanges', link: '/returns' },
  { text: 'New Seasonal Collection Just Dropped — Discover Now', link: '/shop?filter=new' },
];

export default function AnnouncementBar() {
  const [items, setItems] = useState<AnnouncementItemState[]>([
    { id: '1', text: 'Complimentary Express Delivery on orders above ₹1,500', link: '/shop' },
  ]);
  const [backgroundColor, setBackgroundColor] = useState('#09090b');
  const [textColor, setTextColor] = useState('#f4f4f5');
  const [isActive, setIsActive] = useState(true);
  const [autoplaySpeed, setAutoplaySpeed] = useState<number>(4000);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Preview state
  const [previewIdx, setPreviewIdx] = useState(0);
  const [previewPaused, setPreviewPaused] = useState(false);
  const [previewAnimating, setPreviewAnimating] = useState(false);
  const previewIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load existing configuration
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await apiAdmin.get('/admin/announcement');
        if (res.data?.data) {
          const data = res.data.data;
          if (Array.isArray(data.items) && data.items.length > 0) {
            setItems(
              data.items.map((it: any, idx: number) => ({
                id: it._id || String(Date.now() + idx),
                text: it.text || '',
                link: it.link || '',
              }))
            );
          } else if (data.message) {
            setItems([
              {
                id: '1',
                text: data.message,
                link: data.link || '',
              },
            ]);
          }

          setBackgroundColor(data.backgroundColor || '#09090b');
          setTextColor(data.textColor || '#f4f4f5');
          setIsActive(data.isActive ?? true);
          if (data.autoplaySpeed) {
            setAutoplaySpeed(data.autoplaySpeed);
          }
        }
      } catch (err) {
        console.error('Failed to load announcement configuration:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchAnnouncement();
  }, []);

  // Preview cycle
  const nextPreview = useCallback(() => {
    if (items.length <= 1) return;
    setPreviewAnimating(true);
    setTimeout(() => {
      setPreviewIdx((i) => (i + 1) % items.length);
      setPreviewAnimating(false);
    }, 200);
  }, [items.length]);

  const prevPreview = useCallback(() => {
    if (items.length <= 1) return;
    setPreviewAnimating(true);
    setTimeout(() => {
      setPreviewIdx((i) => (i - 1 + items.length) % items.length);
      setPreviewAnimating(false);
    }, 200);
  }, [items.length]);

  useEffect(() => {
    if (previewPaused || items.length <= 1) return;
    previewIntervalRef.current = setInterval(nextPreview, autoplaySpeed);
    return () => {
      if (previewIntervalRef.current) clearInterval(previewIntervalRef.current);
    };
  }, [nextPreview, previewPaused, items.length, autoplaySpeed]);

  // Adjust previewIdx if items change
  useEffect(() => {
    if (previewIdx >= items.length) {
      setPreviewIdx(Math.max(0, items.length - 1));
    }
  }, [items.length, previewIdx]);

  // Handlers for dynamic items
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: String(Date.now() + Math.random()), text: '', link: '' },
    ]);
  };

  const handleUpdateItem = (id: string, field: 'text' | 'link', value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      setErrorMsg('You must have at least one announcement item.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleAddTemplate = (tpl: { text: string; link: string }) => {
    setItems((prev) => [
      ...prev,
      { id: String(Date.now() + Math.random()), text: tpl.text, link: tpl.link },
    ]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const cleanItems = items.filter((it) => it.text.trim().length > 0);
    if (cleanItems.length === 0) {
      setErrorMsg('Please enter text for at least one announcement message.');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await apiAdmin.post('/admin/announcement/save', {
        items: cleanItems.map((it) => ({
          text: it.text.trim(),
          link: it.link.trim(),
        })),
        backgroundColor,
        textColor,
        isActive,
        autoplaySpeed,
      });

      setSuccessMsg('Announcement bar updated successfully! Changes are live on the storefront.');
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err: any) {
      console.error('Error saving announcement settings:', err);
      setErrorMsg(
        err.response?.data?.message || 'Failed to save announcement bar settings.'
      );
    } finally {
      setLoading(false);
    }
  };

  const currentPreviewItem = items[previewIdx] || items[0] || { text: '', link: '' };
  const hasPreviewLink = Boolean(currentPreviewItem.link && currentPreviewItem.link.trim().length > 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
          <Megaphone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          Announcement Bar
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage multiple dynamic rotating announcement messages, destination links, appearance colors, and rotation speed.
        </p>
      </div>

      {/* Live Storefront Interactive Preview Card */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 backdrop-blur-sm overflow-hidden shadow-xs">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Live Storefront Preview
              </CardTitle>
              <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                ({items.length} {items.length === 1 ? 'message' : 'messages'})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Play/Pause Preview Rotation */}
              {items.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewPaused(!previewPaused)}
                  className="h-7 text-xs px-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  {previewPaused ? (
                    <>
                      <Play className="h-3 w-3 mr-1 text-emerald-500 fill-emerald-500" /> Resume Auto-Cycle
                    </>
                  ) : (
                    <>
                      <Pause className="h-3 w-3 mr-1 text-amber-500" /> Pause Auto-Cycle
                    </>
                  )}
                </Button>
              )}

              {/* Status Badge */}
              <span
                className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {isActive ? 'STATUS: ACTIVE' : 'STATUS: DISABLED'}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-3">
          {/* Simulated Browser Bar */}
          <div
            className="w-full relative py-2.5 px-4 rounded-xl flex items-center justify-between shadow-md transition-all duration-300 min-h-[46px] overflow-hidden"
            style={{
              backgroundColor: backgroundColor,
              color: textColor,
            }}
          >
            {/* Left Preview Controls */}
            <div className="flex items-center gap-1 shrink-0 z-10">
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={prevPreview}
                  className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Previous announcement"
                >
                  <ChevronLeft size={13} style={{ color: textColor }} />
                </button>
              )}
            </div>

            {/* Center Dynamic Preview */}
            <div className="flex-1 flex items-center justify-center px-2 min-w-0 text-center">
              <div
                className={`transition-all duration-200 flex items-center justify-center gap-2 max-w-full truncate ${
                  previewAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
              >
                {currentPreviewItem.text ? (
                  <>
                    <span className="shrink-0 w-4 h-4 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    </span>
                    <span className="text-xs font-medium tracking-wide truncate">
                      {currentPreviewItem.text}
                    </span>
                    {hasPreviewLink && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-[9px] font-semibold tracking-wider uppercase shrink-0">
                        Explore <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs italic opacity-60">
                    (Announcement #{previewIdx + 1} text is empty)
                  </span>
                )}
              </div>
            </div>

            {/* Right Preview Controls & Dots */}
            <div className="flex items-center gap-1.5 shrink-0 z-10">
              {items.length > 1 && (
                <>
                  <div className="hidden sm:flex items-center gap-1 mr-1">
                    {items.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPreviewIdx(i)}
                        className={`transition-all duration-200 rounded-full cursor-pointer ${
                          i === previewIdx
                            ? 'w-3.5 h-1.5 bg-amber-400'
                            : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                        }`}
                        aria-label={`Jump to announcement ${i + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={nextPreview}
                    className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    title="Next announcement"
                  >
                    <ChevronRight size={13} style={{ color: textColor }} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Info pill about current preview item */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-1 pt-1">
            <span>
              Previewing item <strong>#{previewIdx + 1}</strong> of {items.length}
            </span>
            {hasPreviewLink ? (
              <span className="flex items-center gap-1 font-mono text-indigo-600 dark:text-indigo-400 truncate max-w-[280px]">
                Target: {currentPreviewItem.link}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </span>
            ) : (
              <span className="text-zinc-400 italic">No link assigned (display only)</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {successMsg && (
          <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs py-2.5">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            <AlertDescription>{successMsg}</AlertDescription>
          </Alert>
        )}

        {errorMsg && (
          <Alert className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs py-2.5">
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* Global Visibility & Timing */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 backdrop-blur-sm shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-indigo-500" />
              General Visibility & Timing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enable switch */}
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/40 p-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Enable Announcement Bar
                </Label>
                <p className="text-xs text-zinc-500">
                  When toggled off, the entire announcement bar will be hidden from customer storefront pages.
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>

            {/* Timing speed */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                Rotation Cycle Interval (Speed)
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: '3 Seconds (Fast)', value: 3000 },
                  { label: '4 Seconds (Standard)', value: 4000 },
                  { label: '5 Seconds (Balanced)', value: 5000 },
                  { label: '7 Seconds (Relaxed)', value: 7000 },
                ].map((speed) => (
                  <button
                    key={speed.value}
                    type="button"
                    onClick={() => setAutoplaySpeed(speed.value)}
                    className={`py-2 px-3 text-xs rounded-lg border font-medium transition cursor-pointer text-center ${
                      autoplaySpeed === speed.value
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/30 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {speed.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Announcements List */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 backdrop-blur-sm shadow-xs">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-500" />
                  Dynamic Announcement Items ({items.length})
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Add multiple messages with custom links that cycle dynamically on your storefront header.
                </CardDescription>
              </div>

              <Button
                type="button"
                onClick={handleAddItem}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 shadow-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Announcement
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {/* Quick Templates Bar */}
            <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/20 p-3 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5 text-indigo-500" />
                Quick Insert Templates:
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddTemplate(tpl)}
                    className="inline-flex items-center gap-1 text-[11px] py-1 px-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 text-zinc-700 dark:text-zinc-300 transition cursor-pointer shadow-2xs"
                  >
                    <Plus className="h-2.5 w-2.5 text-indigo-500" />
                    {tpl.text.length > 34 ? tpl.text.slice(0, 34) + '...' : tpl.text}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Announcement Items */}
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700/80 space-y-3"
                >
                  {/* Item Header with ordering controls & delete */}
                  <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Announcement #{index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === items.length - 1}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length <= 1}
                        className="p-1 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer ml-1"
                        title={items.length <= 1 ? 'Minimum 1 item required' : 'Delete announcement'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Announcement Text */}
                    <div className="md:col-span-7 space-y-1">
                      <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Announcement Text *
                      </Label>
                      <Input
                        value={item.text}
                        onChange={(e) => handleUpdateItem(item.id, 'text', e.target.value)}
                        placeholder="e.g. Free Express Delivery on orders above ₹1,500"
                        required
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs h-9"
                      />
                    </div>

                    {/* Destination Link */}
                    <div className="md:col-span-5 space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Destination Link (Optional)
                        </Label>
                        {item.link.trim() && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                          >
                            Test <ExternalLink className="h-2.5 w-2.5 inline" />
                          </a>
                        )}
                      </div>
                      <Input
                        value={item.link}
                        onChange={(e) => handleUpdateItem(item.id, 'link', e.target.value)}
                        placeholder="/shop or https://..."
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs h-9 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Add button */}
            <div className="pt-2 flex justify-start">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddItem}
                size="sm"
                className="border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs h-9 cursor-pointer w-full sm:w-auto"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Another Announcement
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Styling & Color Customization */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 backdrop-blur-sm shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Palette className="h-4 w-4 text-indigo-500" />
              Appearance & Colors
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Customize colors or choose from curated luxury themes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Color Presets */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Preset Luxury Palettes
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {COLOR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setBackgroundColor(p.bg);
                      setTextColor(p.text);
                    }}
                    className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col gap-1.5 ${
                      backgroundColor.toLowerCase() === p.bg.toLowerCase()
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div
                      className="w-full h-5 rounded border border-black/10 flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: p.bg, color: p.text }}
                    >
                      Aa
                    </div>
                    <span className="text-[10px] font-medium text-zinc-700 dark:text-zinc-300 truncate">
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Background Color */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Background Color
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border border-zinc-200 dark:border-zinc-700 bg-transparent p-0.5"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#09090b"
                    className="bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs h-9 font-mono"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Text & Icon Color
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border border-zinc-200 dark:border-zinc-700 bg-transparent p-0.5"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    placeholder="#f4f4f5"
                    className="bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs h-9 font-mono"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={loading || fetching}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-10 px-8 shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                Saving Changes...
              </>
            ) : (
              'Save Announcement Settings'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
