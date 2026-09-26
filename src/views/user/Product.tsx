'use client';

import React, { useState, useEffect } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import api from "../../config/apiUser";
import ProductSkeleton from "../../components/user/loadingSkeleton/ProductSkeleton";
import useScrollToTop from "../../hooks/useScrollToTop";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { setIsAuthModalOpen, setUserData } from "../../redux/userSlice";
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ShoppingBag, 
  Sparkles, 
  ChevronRight, 
  Check, 
  Heart,
  Share2
} from "lucide-react";
import { toast } from "react-toastify";

interface GalleryImage {
  url: string;
  public_id?: string;
}

interface ColorType {
  _id: string;
  colorName: string;
  colorHex: string;
  inStock?: boolean;
}

interface SizeType {
  _id: string;
  sizeName: string;
  sizeValue: string;
}

interface VariantType {
  _id: string;
  color: ColorType;
  size: SizeType;
  price: number;
  mrp: number;
  quantity: number;
  sku?: string;
}

interface ProductDetailType {
  _id: string;
  title: string;
  description?: string;
  category?: any;
  variants: VariantType[];
  allColors: ColorType[];
  defaultVariant?: VariantType;
  defaultGallery?: GalleryImage[];
}

export default function Product() {
  const normalize = (str?: string | null) => (str ? str.trim().toLowerCase() : "");

  const { isAuthenticated, userData } = useAppSelector((state) => state.user);
  const { productId } = useParams<{ productId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  /* ================= STATES ================= */
  const [productDetail, setProductDetail] = useState<ProductDetailType | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(searchParams.get("color") || "");
  const [selectedSize, setSelectedSize] = useState<SizeType | null>(null);
  const urlSize = normalize(searchParams.get("size"));

  const [currentGallery, setCurrentGallery] = useState<GalleryImage[]>([]);
  const [allVariantOfAColor, setAllVariantOfAColor] = useState<VariantType[]>([]);
  const [currentVariant, setCurrentVariant] = useState<VariantType | null>(null);
  const [galleryCache, setGalleryCache] = useState<Record<string, GalleryImage[]>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  /* ================= API ================= */
  const getProductDetails = async () => {
    try {
      const res = await api.get(`/products/${productId}`);
      setProductDetail(res.data.data);
    } catch (err) {
      console.error("Product fetch error:", err);
    }
  };

  const getColorGallery = async (colorId: string) => {
    try {
      if (galleryCache[colorId]) {
        const cached = galleryCache[colorId];
        setCurrentGallery(cached);
        return;
      }

      const res = await api.get(`/products/${productId}/color-gallery/${colorId}`);
      const gallery = res.data.data.gallery || [];

      setGalleryCache((prev) => ({
        ...prev,
        [colorId]: gallery,
      }));
      setCurrentGallery(gallery);
    } catch (err) {
      console.error("Gallery fetch error:", err);
    }
  };

  /* ================= COLOR CLICK ================= */
  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);
    setSearchParams({ color: colorName }, { replace: true });
  };

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    setIsInitialLoad(true);
    getProductDetails();
  }, [productId]);

  /* ================= INITIAL SETUP ================= */
  useEffect(() => {
    if (!productDetail) return;

    const urlColor = normalize(searchParams.get("color"));
    let finalVariant: VariantType | null = null;
    let finalColor = "";

    // 1. URL priority
    if (urlColor) {
      const matches = productDetail.variants.filter(
        (v) => normalize(v.color?.colorName) === urlColor
      );
      if (matches.length) {
        finalVariant = matches[0];
        finalColor = matches[0].color?.colorName || "";
      }
    }

    // 2. Default variant
    if (!finalVariant) {
      if (productDetail.defaultVariant) {
        finalVariant = productDetail.defaultVariant;
        finalColor = productDetail.defaultVariant.color?.colorName || "";
      } else if (productDetail.variants.length > 0) {
        finalVariant = productDetail.variants[0];
        finalColor = finalVariant.color?.colorName || "";
      }
    }

    if (!finalVariant) return;

    const colorVariants = productDetail.variants.filter(
      (v) => normalize(v.color?.colorName) === normalize(finalColor)
    );

    setSelectedColor(finalColor);
    setAllVariantOfAColor(colorVariants);
    setSelectedSize(null);
    setCurrentVariant(null);

    // Initial gallery
    if (isInitialLoad) {
      const hasUrlColor = !!searchParams.get("color");
      if (hasUrlColor) {
        getColorGallery(finalVariant.color._id);
      } else if (productDetail.defaultGallery?.length) {
        setCurrentGallery(productDetail.defaultGallery);
      } else {
        getColorGallery(finalVariant.color._id);
      }
      setIsInitialLoad(false);
    }
  }, [productDetail, searchParams.get("color")]);

  /* ================= FETCH ON COLOR CHANGE ================= */
  useEffect(() => {
    if (!productDetail || !selectedColor) return;

    const colorObj = productDetail.allColors.find(
      (c) => normalize(c.colorName) === normalize(selectedColor)
    );
    if (!colorObj) return;

    getColorGallery(colorObj._id);
  }, [selectedColor]);

  /* ================= AUTO SIZE ================= */
  useEffect(() => {
    if (!allVariantOfAColor.length) return;

    if (urlSize) {
      const matched = allVariantOfAColor.find(
        (v) => normalize(v.size?.sizeName) === urlSize
      );
      if (matched) {
        setSelectedSize(matched.size);
        setCurrentVariant(matched);
        return;
      }
    }

    const firstInStock = allVariantOfAColor.find((v) => v.quantity > 0);
    if (firstInStock) {
      setSelectedSize(firstInStock.size);
      setCurrentVariant(firstInStock);
    }
  }, [allVariantOfAColor, urlSize]);

  /* ================= SIZE SELECT ================= */
  useEffect(() => {
    if (!selectedSize) return;

    const variant = allVariantOfAColor.find(
      (v) => normalize(v.size?.sizeName) === normalize(selectedSize.sizeName)
    );
    if (variant) setCurrentVariant(variant);
  }, [selectedSize]);

  /* ================= CART ACTIONS ================= */
  const addItemToCartGuest = (targetVariant?: VariantType | null) => {
    const v = targetVariant || currentVariant;
    if (!v) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const found = cart.find(
      (i: any) => i.productId === (productDetail?._id || productId) && i.variantId === v._id
    );

    if (found) {
      found.quantity++;
    } else {
      cart.push({
        productId: productDetail?._id || productId,
        variantId: v._id,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    const count = cart.reduce((t: number, i: any) => t + i.quantity, 0);
    dispatch(setUserData({ ...userData, cartCount: count }));
    toast.success("Piece curated and added to your bag");
  };

  const addItemToCartUser = async (targetVariant?: VariantType | null) => {
    const v = targetVariant || currentVariant;
    if (!v) return;
    try {
      setIsAdding(true);
      const res = await api.post("/cart/items", {
        productId: productDetail?._id || productId,
        variantId: v._id,
        quantity: 1,
      });

      dispatch(
        setUserData({
          ...userData,
          cartCount: res.data.data?.cartCount || (userData?.cartCount || 0) + 1,
        })
      );
      toast.success("Piece added to your shopping bag");
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Failed to add piece to bag");
    } finally {
      setIsAdding(false);
    }
  };

  const resolveActiveVariant = (): VariantType | null => {
    if (currentVariant) return currentVariant;
    if (selectedSize && allVariantOfAColor.length > 0) {
      const match = allVariantOfAColor.find(
        (v) => normalize(v.size?.sizeName) === normalize(selectedSize.sizeName)
      );
      if (match) return match;
    }
    if (allVariantOfAColor.length > 0) {
      const inStock = allVariantOfAColor.find((v) => v.quantity > 0);
      if (inStock) return inStock;
      return allVariantOfAColor[0];
    }
    if (productDetail?.defaultVariant) return productDetail.defaultVariant;
    if (productDetail?.variants?.length) return productDetail.variants[0];
    return null;
  };

  const handleAddToCart = () => {
    const activeVariant = resolveActiveVariant();
    if (!activeVariant) {
      toast.error("Please select a size first");
      return;
    }
    if (isAuthenticated) {
      addItemToCartUser(activeVariant);
    } else {
      addItemToCartGuest(activeVariant);
    }
  };

  const handleBuyNow = () => {
    const activeVariant = resolveActiveVariant();
    if (!activeVariant) {
      toast.error("Please select a size first");
      return;
    }

    const data = {
      productId: productDetail?._id || productId,
      variantId: activeVariant._id,
      quantity: 1,
    };

    sessionStorage.setItem("checkout_buy_now", JSON.stringify(data));

    if (!isAuthenticated) {
      dispatch(setIsAuthModalOpen(true));
      return;
    }

    navigate("/checkout?type=BUY_NOW", { state: data });
  };

  useScrollToTop();

  if (!productDetail) return <ProductSkeleton />;

  return (
    <div className="w-full bg-white dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6 lg:gap-12">
          
          {/* ================= IMAGES (7 cols) ================= */}
          <div className="col-span-12 lg:col-span-7">
            
            {/* Mobile Carousel Slider */}
            <div className="lg:hidden">
              <div
                id="mobile-gallery"
                className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory rounded-3xl hide-scrollbar"
                onScroll={(e) => {
                  const el = e.target as HTMLElement;
                  const index = Math.round(el.scrollLeft / el.clientWidth);
                  setActiveImageIndex(index);
                }}
              >
                {currentGallery.map((img, i) => (
                  <div
                    key={i}
                    className="min-w-full snap-center bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden aspect-[3/4]"
                  >
                    <img
                      src={img.url}
                      alt={productDetail.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                {currentGallery.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeImageIndex === i
                        ? "bg-zinc-900 dark:bg-white w-5"
                        : "bg-zinc-300 dark:bg-zinc-700 w-1.5"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop 2-Column Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {currentGallery.map((img, i) => (
                <div
                  key={i}
                  className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden aspect-[3/4] group cursor-zoom-in"
                >
                  <img
                    src={img.url}
                    alt={productDetail.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>

          </div>

          {/* ================= PRODUCT DETAILS (5 cols) ================= */}
          <div className="col-span-12 lg:col-span-5">
            <div className="space-y-6 lg:sticky lg:top-24">
              
              {/* Collection / Header Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Atelier Luxury Edit
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Artisanal Cut</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
                {productDetail.title}
              </h1>

              {/* Price & Discount */}
              {currentVariant ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-zinc-900 dark:text-white font-mono">
                    ₹{currentVariant.price.toLocaleString()}
                  </span>
                  {currentVariant.mrp > currentVariant.price && (
                    <>
                      <span className="line-through text-zinc-400 text-sm font-mono">
                        ₹{currentVariant.mrp.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                        Save {Math.round(((currentVariant.mrp - currentVariant.price) / currentVariant.mrp) * 100)}%
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-400">Select a size to view pricing</p>
              )}

              {/* Divider */}
              <div className="border-t border-zinc-200/80 dark:border-zinc-800" />

              {/* Color Swatches */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    Color: <strong className="text-zinc-500 font-medium">{selectedColor}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {productDetail.allColors.map((c, i) => {
                    const active = normalize(c.colorName) === normalize(selectedColor);
                    const isWhite = (c.colorHex || "").toLowerCase() === "#ffffff" || (c.colorHex || "").toLowerCase() === "#fff";
                    return (
                      <button
                        key={i}
                        type="button"
                        title={c.colorName}
                        disabled={c.inStock === false}
                        onClick={() => handleColorChange(c.colorName)}
                        className={`relative w-9 h-9 rounded-full border transition-all duration-200 flex items-center justify-center cursor-pointer ${
                          active
                            ? "ring-2 ring-zinc-900 dark:ring-white ring-offset-2 dark:ring-offset-zinc-950 scale-105"
                            : "hover:scale-105 border-zinc-300 dark:border-zinc-700"
                        } ${isWhite ? "border-zinc-400" : ""}`}
                        style={{ backgroundColor: c.colorHex }}
                      >
                        {active && (
                          <Check className={`w-4 h-4 drop-shadow-md ${isWhite ? "text-zinc-900" : "text-white"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sizes Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    Select Size
                  </span>
                  <span className="text-xs text-zinc-400">Complimentary Alterations</span>
                </div>

                <div className="flex gap-2.5 flex-wrap">
                  {allVariantOfAColor.map((v, i) => {
                    const active = selectedSize?.sizeValue === v.size?.sizeValue;
                    const outOfStock = v.quantity === 0;

                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={outOfStock}
                        onClick={() => {
                          if (outOfStock) return;
                          setSelectedSize(v.size);
                          setSearchParams((prev) => {
                            const p = new URLSearchParams(prev);
                            p.set("size", v.size.sizeName);
                            return p;
                          }, { replace: true });
                        }}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                          active
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm"
                            : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600"
                        } ${outOfStock ? "opacity-30 cursor-not-allowed line-through" : ""}`}
                      >
                        {v.size?.sizeValue}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 font-bold text-xs uppercase tracking-wider transition shadow-sm hover:shadow cursor-pointer"
                >
                  Buy Now
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="flex-1 py-3.5 px-6 rounded-2xl border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:!text-zinc-900 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>
              </div>

              {/* Description */}
              {productDetail.description && (
                <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-2">
                    Craft & Silhouette
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {productDetail.description}
                  </p>
                </div>
              )}

              {/* Trust Guarantees */}
              <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800 space-y-2.5 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Verified Authentic Atelier Garment</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-zinc-600 dark:text-zinc-300 shrink-0" />
                  <span>Complimentary Insured Shipping Across India</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-zinc-600 dark:text-zinc-300 shrink-0" />
                  <span>7-Day Hassle-Free Concierge Returns</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
