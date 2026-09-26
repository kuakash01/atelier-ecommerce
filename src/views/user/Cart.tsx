'use client';

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Sparkles,
  Lock
} from "lucide-react";
import api from "../../config/apiUser";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { setIsAuthModalOpen, setUserData } from "../../redux/userSlice";
import CartItemSkeleton from "../../components/user/loadingSkeleton/CartItemSkeleton";
import CartSummarySkeleton from "../../components/user/loadingSkeleton/CartSummarySkeleton";
import CartSkeleton from "../../components/user/loadingSkeleton/CartSkeleton";
import useScrollToTop from "../../hooks/useScrollToTop";

interface CartItemAttribute {
  color?: {
    colorName?: string;
    colorCode?: string;
  };
  size?: {
    sizeName?: string;
  };
}

interface CartItemType {
  _id: string;
  productId: string;
  variantId: string;
  title: string;
  price: number;
  mrp: number;
  basePrice?: number;
  gstRate?: number;
  gstAmount?: number;
  quantity: number;
  mainImage: string;
  attributes: CartItemAttribute;
}

interface CartSummaryType {
  mrpSubTotal?: number;
  basePriceSubTotal?: number;
  taxAmount?: number;
  subtotal?: number;
  discount?: number;
  deliveryCharge?: number;
  finalTotal?: number;
  total?: number;
}

const FREE_SHIPPING_THRESHOLD = 1500;

export default function Cart() {
  const { isAuthenticated, isLoading: authLoading, userData } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useScrollToTop();

  const [cartData, setCartData] = useState<CartItemType[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummaryType>({});
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  // ================= FETCH GUEST CART =================
  const getCartGuest = async () => {
    try {
      const raw = localStorage.getItem("cart");
      const localCart = raw ? JSON.parse(raw) : [];

      if (!localCart.length) {
        setCartData([]);
        setCartSummary({});
        return;
      }

      const res = await api.post("/cart/guest", { items: localCart });
      if (res.data?.data) {
        setCartData(res.data.data.cart || []);
        setCartSummary(res.data.data.cartSummary || {});
      }
    } catch (error) {
      console.error("Error fetching guest cart:", error);
    }
  };

  // ================= FETCH USER CART =================
  const getCartUser = async () => {
    try {
      const res = await api.get("/cart");
      if (res.data?.data) {
        setCartData(res.data.data.cart || []);
        setCartSummary(res.data.data.cartSummary || {});
      }
    } catch (error) {
      console.error("Error fetching user cart:", error);
    }
  };

  // ================= INITIAL LOAD =================
  useEffect(() => {
    // Wait for the global auth check to finish before deciding which fetch to use.
    // This prevents a double-fetch: guest fetch on null → user fetch on true.
    if (authLoading) return;

    const fetchCart = async () => {
      setLoading(true);
      if (isAuthenticated) {
        await getCartUser();
      } else {
        await getCartGuest();
      }
      setLoading(false);
    };

    fetchCart();
  }, [isAuthenticated, authLoading]);

  // ================= UPDATE QUANTITY (GUEST) =================
  const handleUpdateQuantityLocal = async (
    productId: string,
    variantId: string,
    type: "increment" | "decrement"
  ) => {
    const raw = localStorage.getItem("cart");
    const cart = raw ? JSON.parse(raw) : [];

    const existing = cart.find(
      (item: { productId: string; variantId: string; quantity: number }) =>
        item.productId === productId && item.variantId === variantId
    );

    if (!existing) return;

    if (type === "increment") existing.quantity++;
    if (type === "decrement" && existing.quantity > 1) existing.quantity--;

    setUpdatingItemId(variantId);
    localStorage.setItem("cart", JSON.stringify(cart));
    await getCartGuest();
    toast.success(type === "increment" ? "Quantity increased" : "Quantity decreased");
    setUpdatingItemId(null);
  };

  // ================= UPDATE QUANTITY (USER) =================
  const handleUpdateQuantityUser = async (
    cartItemId: string,
    type: "increment" | "decrement",
    quantity: number = 1
  ) => {
    try {
      setUpdatingItemId(cartItemId);
      const res = await api.patch(`/cart/items/${cartItemId}`, {
        quantity,
        type,
      });

      await getCartUser();

      if (userData && res.data?.cart?.cartCount !== undefined) {
        dispatch(
          setUserData({
            ...userData,
            cartCount: res.data.cart.cartCount,
          })
        );
      }

      toast.success(type === "increment" ? "Quantity increased" : "Quantity decreased");
    } catch (error) {
      console.error("Error updating user cart:", error);
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // ================= DELETE ITEM =================
  const handleDeleteItem = async (item: CartItemType) => {
    const id = isAuthenticated ? item._id : item.variantId;
    try {
      setUpdatingItemId(id);

      if (isAuthenticated) {
        await api.delete(`/cart/items/${item._id}`);
        await getCartUser();
        // Update user cart count in header
        if (userData && userData.cartCount) {
          dispatch(
            setUserData({
              ...userData,
              cartCount: Math.max(0, (userData.cartCount || 1) - item.quantity),
            })
          );
        }
      } else {
        const raw = localStorage.getItem("cart");
        const cart = raw ? JSON.parse(raw) : [];
        const updated = cart.filter(
          (cartItem: { variantId: string }) => cartItem.variantId !== item.variantId
        );
        localStorage.setItem("cart", JSON.stringify(updated));
        await getCartGuest();
      }

      toast.success("Item removed from bag");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // ================= CHECKOUT =================
  const handleCheckOut = () => {
    if (!isAuthenticated) {
      dispatch(setIsAuthModalOpen(true));
      return;
    }
    navigate("/checkout?type=CART");
  };

  const totalAmount = cartSummary.finalTotal ?? 0;
  const freeShippingDifference = Math.max(0, FREE_SHIPPING_THRESHOLD - totalAmount);
  const freeShippingProgress = Math.min(100, (totalAmount / FREE_SHIPPING_THRESHOLD) * 100);

  if (loading && cartData.length === 0) {
    return <CartSkeleton />;
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-zinc-200 dark:border-zinc-800 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 mb-1">
              <Sparkles className="w-3 h-3" />
              Atelier Checkout
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Shopping Bag
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {cartData.length} {cartData.length === 1 ? "distinct item" : "distinct items"} selected
          </p>
        </div>

        {/* Complimentary Shipping Progress Bar */}
        {cartData.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {freeShippingDifference === 0
                  ? "Complimentary Express Delivery Unlocked!"
                  : `Add ₹${freeShippingDifference.toLocaleString()} more for Complimentary Delivery`}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">
                {Math.round(freeShippingProgress)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Bag Items (8 cols) */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                <CartItemSkeleton />
              </div>
            ) : cartData.length > 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm divide-y divide-zinc-100 dark:divide-zinc-800">
                {cartData.map((item) => {
                  const itemId = isAuthenticated ? item._id : item.variantId;
                  const isUpdating = updatingItemId === itemId;
                  const discountPercent =
                    item.mrp && item.price && item.mrp > item.price
                      ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                      : 0;

                  return (
                    <div
                      key={itemId}
                      className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                    >
                      {/* Product Media & Info */}
                      <div className="flex gap-4 sm:gap-6 items-center flex-1 min-w-0">
                        <Link
                          to={`/products/${item.productId}${
                            item.attributes?.color?.colorName
                              ? `?color=${item.attributes.color.colorName}`
                              : ""
                          }`}
                          className="relative w-20 h-26 sm:w-24 sm:h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 group"
                        >
                          <img
                            src={item.mainImage}
                            alt={item.title}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/products/${item.productId}`}
                            className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white hover:underline line-clamp-1"
                          >
                            {item.title}
                          </Link>

                          {/* Attributes */}
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                            {item.attributes?.size?.sizeName && (
                              <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                                Size: {item.attributes.size.sizeName}
                              </span>
                            )}
                            {item.attributes?.color?.colorName && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-zinc-300 dark:border-zinc-600"
                                  style={{
                                    backgroundColor:
                                      item.attributes.color.colorCode || "#000",
                                  }}
                                />
                                {item.attributes.color.colorName}
                              </span>
                            )}
                          </div>

                          {/* Price Display */}
                          <div className="mt-2.5 flex items-baseline gap-2 flex-wrap">
                            <span className="text-base font-bold text-zinc-900 dark:text-white">
                              ₹{item.price.toLocaleString()}
                            </span>
                            {item.mrp > item.price && (
                              <span className="text-xs text-zinc-400 line-through">
                                ₹{item.mrp.toLocaleString()}
                              </span>
                            )}
                            {discountPercent > 0 && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                                {discountPercent}% OFF
                              </span>
                            )}
                            <span className="text-[11px] text-zinc-400 block w-full mt-0.5">
                              Inclusive of all taxes{item.gstRate ? ` (${item.gstRate}% GST)` : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Stepper & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-zinc-100 dark:border-zinc-800">
                        {/* Stepper Pill */}
                        <div className="inline-flex items-center border border-zinc-200 dark:border-zinc-700 rounded-full bg-zinc-50 dark:bg-zinc-800/80 p-1">
                          <button
                            type="button"
                            disabled={isUpdating || item.quantity <= 1}
                            onClick={() =>
                              isAuthenticated
                                ? handleUpdateQuantityUser(item._id, "decrement")
                                : handleUpdateQuantityLocal(
                                    item.productId,
                                    item.variantId,
                                    "decrement"
                                  )
                            }
                            className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <span className="w-9 text-center text-xs font-bold text-zinc-900 dark:text-white">
                            {isUpdating ? "..." : item.quantity}
                          </span>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              isAuthenticated
                                ? handleUpdateQuantityUser(item._id, "increment")
                                : handleUpdateQuantityLocal(
                                    item.productId,
                                    item.variantId,
                                    "increment"
                                  )
                            }
                            className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Individual Line Total */}
                        <div className="text-right min-w-[70px] hidden sm:block">
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleDeleteItem(item)}
                          className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty Bag State */
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
                <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-5">
                  <ShoppingBag className="w-10 h-10 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Your Shopping Bag is Empty
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Discover our timeless atelier garments and curated designer collections ready for complimentary dispatch.
                </p>
                <Link
                  to="/"
                  className="mt-6 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-sm"
                >
                  <span>Explore Collections</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary (4 cols) */}
          <div className="lg:col-span-4 sticky top-28">
            {loading ? (
              <CartSummarySkeleton />
            ) : cartData.length > 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
                <h3 className="text-base font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Order Summary
                </h3>

                {(() => {
                  const taxAmount = Number(cartSummary.taxAmount) || (cartData.reduce((sum, item) => sum + ((item.gstAmount || 0) * item.quantity), 0));
                  const sellingPriceSubtotal = Number(cartSummary.total) || cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  const subtotalBeforeTax = Number(cartSummary.basePriceSubTotal) || Math.max(0, sellingPriceSubtotal - taxAmount);
                  const mrpTotal = Number(cartSummary.mrpSubTotal) || cartData.reduce((sum, item) => sum + ((item.mrp || item.price) * item.quantity), 0);
                  const discount = Number(cartSummary.discount) || Math.max(0, mrpTotal - sellingPriceSubtotal);
                  const deliveryCharge = Number(cartSummary.deliveryCharge) || 0;
                  const finalTotal = Number(cartSummary.finalTotal) || (sellingPriceSubtotal + deliveryCharge);

                  return (
                    <div className="space-y-3 text-xs sm:text-sm">
                      {mrpTotal > sellingPriceSubtotal && discount > 0 ? (
                        <>
                          <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                            <span>Gross MRP Subtotal</span>
                            <span className="font-mono line-through">
                              ₹{mrpTotal.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                            <span>Catalog Discount</span>
                            <span className="font-mono">-₹{discount.toLocaleString()}</span>
                          </div>
                        </>
                      ) : null}

                      <div className="flex justify-between text-zinc-700 dark:text-zinc-300 font-medium">
                        <span>Items Subtotal</span>
                        <span className="font-mono">
                          ₹{sellingPriceSubtotal.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>Delivery</span>
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {deliveryCharge === 0
                            ? "Complimentary"
                            : `₹${deliveryCharge.toLocaleString()}`}
                        </span>
                      </div>

                      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex justify-between items-baseline">
                        <div>
                          <span className="text-sm font-bold text-zinc-900 dark:text-white block">
                            Total
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            Standard Express Dispatch
                          </span>
                        </div>
                        <span className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">
                          ₹{finalTotal.toLocaleString()}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 text-right">
                        {taxAmount > 0
                          ? `Inclusive of all taxes (Includes ₹${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GST)`
                          : 'Inclusive of all taxes'}
                      </p>
                    </div>
                  );
                })()}

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={handleCheckOut}
                  className="w-full py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Proceed to Checkout</span>
                </button>

                {/* Atelier Trust Badges */}
                <div className="pt-2 space-y-3 text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                    <span>256-bit Encrypted SSL Checkout</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                    <span>Complimentary 30-Day Doorstep Returns</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                    <span>Dispatched in bespoke sustainable packaging</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

        </div>

      </div>
    </div>
  );
}
