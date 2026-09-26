'use client';

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Lock, 
  Sparkles, 
  Check, 
  MapPin, 
  CreditCard, 
  Banknote, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Minus, 
  AlertCircle,
  Package,
  Clock,
  ArrowLeft
} from "lucide-react";
import api from "../../config/apiUser";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { setUserData } from "../../redux/userSlice";
import CartItemSkeleton from "../../components/user/loadingSkeleton/CartItemSkeleton";
import CartSummarySkeleton from "../../components/user/loadingSkeleton/CartSummarySkeleton";
import CheckoutSkeleton from "../../components/user/loadingSkeleton/CheckoutSkeleton";
import useScrollToTop from "../../hooks/useScrollToTop";
import openRazorpay from "../../utils/openRazorpay";
import { toast } from "react-toastify";
import AuthGuard from "../../components/common/AuthGuard";

interface AddressType {
  _id: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  street?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface ItemAttributes {
  color?: {
    colorName?: string;
    colorHex?: string;
    colorCode?: string;
  };
  size?: {
    sizeName?: string;
  };
}

interface CheckoutItem {
  _id?: string;
  productId: string;
  variantId: string;
  title: string;
  mainImage: string;
  price: number;
  mrp: number;
  stock?: number;
  quantity: number;
  attributes?: ItemAttributes;
  basePrice?: number;
  gstRate?: number;
  gstAmount?: number;
}

interface CartSummary {
  mrpSubTotal?: number;
  subtotal: number;
  basePriceSubTotal?: number;
  taxAmount?: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  finalTotal: number;
}

interface PreviewData {
  address: AddressType | null;
  cartItems: CheckoutItem[];
  cartSummary: CartSummary;
  type: string;
}

export default function Checkout() {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [paymentMode, setPaymentMode] = useState<"online" | "cod">("online");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  // Address selection modal / list state
  const [allAddresses, setAllAddresses] = useState<AddressType[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressType | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { userData, isAuthenticated } = useAppSelector((state) => state.user);

  const [searchParams] = useSearchParams();
  const failed = searchParams.get("payment") === "failed";

  // Buy now extraction from sessionStorage or location state
  const storedData = typeof window !== "undefined" ? sessionStorage.getItem("checkout_buy_now") : null;
  const buyNowData = location?.state || (storedData ? JSON.parse(storedData) : null);
  const [buyNowQty, setBuyNowQty] = useState<number>(buyNowData?.quantity || 1);

  // Fallback order type
  const rawType = searchParams.get("type");
  const checkoutType = (rawType || (buyNowData?.productId ? "BUY_NOW" : "CART")).toUpperCase();

  useScrollToTop();

  // Fetch all addresses for selection
  const fetchAddresses = async () => {
    try {
      const res = await api.get("/addresses");
      if (res.data?.status === "success") {
        setAllAddresses(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  };

  // ================= PREVIEW =================
  const getPreview = async () => {
    try {
      const res = await api.post("/checkout/preview", {
        type: checkoutType,
        productId: buyNowData?.productId,
        variantId: buyNowData?.variantId,
        buyNowQty,
      });

      if (res.data?.status === "success") {
        if (!res.data.data.cartItems || res.data.data.cartItems.length === 0) {
          if (checkoutType === "CART") {
            navigate("/cart");
          }
          return;
        }
        setPreviewData(res.data.data);
        if (res.data.data.address) {
          setSelectedAddress(res.data.data.address);
        }
      }
    } catch (err: any) {
      console.error("Preview fetch error:", err);
      toast.error(err.response?.data?.message || "Failed to load checkout preview");
    }
  };

  // Cart Qty Update
  const handleUpdateQuantityCart = async (cartItemId: string, type: "increment" | "decrement") => {
    try {
      setUpdatingItemId(cartItemId);
      const res = await api.patch(`/cart/items/${cartItemId}`, {
        type,
        quantity: 1,
      });

      if (res.data?.cart) {
        dispatch(
          setUserData({
            ...userData,
            cartCount: res.data.cart.cartCount,
          })
        );
      }
      await getPreview();
    } catch (error) {
      console.error("Error updating cart item:", error);
      toast.error("Failed to adjust item quantity");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Switch default address
  const handleSelectAddress = async (addr: AddressType) => {
    setSelectedAddress(addr);
    setShowAddressModal(false);
    try {
      await api.patch(`/addresses/${addr._id}/default`);
      toast.success("Delivery address updated");
    } catch (err) {
      console.error("Failed to set default address:", err);
    }
  };

  // Initial Load
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      setPageLoading(true);
      await Promise.all([getPreview(), fetchAddresses()]);
      setPageLoading(false);
    })();
  }, [checkoutType, buyNowQty, isAuthenticated]);

  // Apply Coupon
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    if (promoCode.trim().toUpperCase() === "ATELIER10") {
      setPromoApplied(true);
      toast.success("10% promotional discount applied!");
    } else {
      toast.error("Invalid promo code");
    }
  };

  // ================= PLACE ORDER =================
  const handlePlaceOrder = async () => {
    const activeAddress = selectedAddress || previewData?.address;
    if (!activeAddress) {
      toast.error("Please provide or select a delivery address");
      return;
    }
    if (!paymentMode) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/orders", {
        type: checkoutType,
        productId: buyNowData?.productId,
        variantId: buyNowData?.variantId,
        buyNowQty,
        paymentMethod: paymentMode,
      });

      if (paymentMode === "online") {
        if (res.data?.razorpayOrderId) {
          openRazorpay(res.data, navigate);
          return;
        } else {
          toast.error("Online payment authorization failed");
          navigate("/checkout?payment=failed", { replace: true });
        }
        return;
      }

      // COD flow
      if (res.data.status === "success") {
        if (checkoutType === "BUY_NOW") {
          sessionStorage.removeItem("checkout_buy_now");
        }
        navigate(`/profile/orders/${res.data.order.orderDocId}?justPlaced=true`, {
          replace: true,
          state: { justPlaced: true },
        });
      } else {
        navigate("/checkout?payment=failed", { replace: true });
      }
    } catch (error: any) {
      console.error("Order placement error:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
      navigate("/checkout?payment=failed", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <CheckoutSkeleton />;
  }

  const activeAddress = selectedAddress || previewData?.address;
  const items = previewData?.cartItems || [];
  const summary = previewData?.cartSummary;

  const taxAmount = Number(summary?.taxAmount) || items.reduce((sum, item) => sum + ((item.gstAmount || 0) * item.quantity), 0);
  const sellingPriceSubtotal = Number(summary?.total) || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const subtotalBeforeTax = Number(summary?.basePriceSubTotal) || Math.max(0, sellingPriceSubtotal - taxAmount);
  const mrpTotal = Number(summary?.mrpSubTotal) || items.reduce((sum, item) => sum + ((item.mrp || item.price) * item.quantity), 0);
  const discount = Number(summary?.discount) || Math.max(0, mrpTotal - sellingPriceSubtotal);
  const deliveryCharge = Number(summary?.deliveryCharge) || 0;
  const promoDiscount = promoApplied ? Math.round(sellingPriceSubtotal * 0.1) : 0;
  const finalPayable = Math.max(0, sellingPriceSubtotal - promoDiscount + deliveryCharge);

  return (
    <AuthGuard fallback={<CheckoutSkeleton />}>
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 px-4 sm:px-6 lg:px-12 py-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Payment Failed / Dismissed Recovery Banner */}
        {failed && (
          <div className="mb-8 p-5 rounded-3xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-3 shadow-sm">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-900 dark:text-rose-100">
                  Payment Was Not Completed
                </p>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                  The payment window was closed or authorization was interrupted. No amount was charged. Your items remain safely in your bag—you can retry or switch to Cash on Delivery below.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPaymentMode("cod");
                  toast.info("Switched to Cash on Delivery");
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-200/80 dark:bg-rose-800 text-rose-900 dark:text-rose-100 hover:bg-rose-300 dark:hover:bg-rose-700 transition cursor-pointer"
              >
                Switch to COD
              </button>
              <button
                type="button"
                onClick={() => navigate("/checkout", { replace: true })}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-200/50 dark:hover:bg-rose-900/50 transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Stepper Header */}
        <div className="mb-10 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Atelier Concierge Checkout
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mt-0.5">
                Acquisition Settlement
              </h1>
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Address</span>
              </span>
              <span className="w-6 h-0.5 bg-zinc-300 dark:bg-zinc-700" />
              <span className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Payment</span>
              </span>
              <span className="w-6 h-0.5 bg-zinc-300 dark:bg-zinc-700" />
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Review</span>
              </span>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. DELIVERY ADDRESS CARD */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                      1. Delivery Address
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Dispatched via complimentary insured courier
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {allAddresses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white underline cursor-pointer"
                    >
                      Change
                    </button>
                  )}
                  <Link
                    to="/profile/addresses/add"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 text-xs font-bold uppercase tracking-wider transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </Link>
                </div>
              </div>

              {/* Selected Address Display */}
              {activeAddress ? (
                <div className="mt-5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">
                        {activeAddress.fullName}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                        Default Dispatch
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                      {[
                        activeAddress.addressLine1 || activeAddress.street,
                        activeAddress.addressLine2,
                        activeAddress.landmark,
                        activeAddress.city,
                        `${activeAddress.state} - ${activeAddress.pincode}`,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="text-xs font-mono text-zinc-500 mt-1.5">
                      Phone: {activeAddress.phone}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified Address</span>
                  </div>
                </div>
              ) : (
                <div className="mt-5 text-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <p className="text-xs text-zinc-500 mb-3">No delivery address specified yet.</p>
                  <Link
                    to="/profile/addresses/add"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Delivery Address</span>
                  </Link>
                </div>
              )}
            </section>

            {/* 2. PAYMENT SELECTION CARD */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                    2. Payment Method
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Encrypted through 256-bit bank-grade payment gateway
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Online Payment Option */}
                <label
                  onClick={() => setPaymentMode("online")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMode === "online"
                      ? "border-zinc-900 dark:border-white bg-zinc-50/80 dark:bg-zinc-800/60 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-5 h-5 text-zinc-900 dark:text-white" />
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        Online Payment
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMode === "online"
                          ? "border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white"
                          : "border-zinc-300 dark:border-zinc-600"
                      }`}
                    >
                      {paymentMode === "online" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-zinc-900" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, NetBanking.
                  </p>
                  <div className="mt-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center gap-2 text-[11px] font-semibold text-emerald-600">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant Authorization • Zero Extra Fees</span>
                  </div>
                </label>

                {/* Cash on Delivery Option */}
                <label
                  onClick={() => setPaymentMode("cod")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMode === "cod"
                      ? "border-zinc-900 dark:border-white bg-zinc-50/80 dark:bg-zinc-800/60 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <Banknote className="w-5 h-5 text-zinc-900 dark:text-white" />
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        Cash on Delivery
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMode === "cod"
                          ? "border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white"
                          : "border-zinc-300 dark:border-zinc-600"
                      }`}
                    >
                      {paymentMode === "cod" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-zinc-900" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Settle with cash or UPI directly with the delivery agent upon courier arrival.
                  </p>
                  <div className="mt-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center gap-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Standard Express Dispatch</span>
                  </div>
                </label>
              </div>
            </section>

            {/* 3. ORDER ITEMS REVIEW */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                      3. Acquisition Review ({items.length} {items.length === 1 ? "Item" : "Items"})
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Curated pieces prepared for swift tailoring and dispatch
                    </p>
                  </div>
                </div>

                {checkoutType === "CART" && (
                  <Link
                    to="/cart"
                    className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white underline cursor-pointer"
                  >
                    Edit Bag
                  </Link>
                )}
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.map((item, idx) => {
                  const isUpdating = updatingItemId === item._id;
                  return (
                    <div key={idx} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.mainImage}
                          alt={item.title}
                          className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0"
                        />

                        <div>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">
                            {item.title}
                          </h3>

                          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                            {item.attributes?.size?.sizeName && (
                              <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-800 dark:text-zinc-200">
                                {item.attributes.size.sizeName}
                              </span>
                            )}
                            {item.attributes?.color?.colorName && (
                              <span className="flex items-center gap-1">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-zinc-300"
                                  style={{
                                    backgroundColor:
                                      item.attributes.color.colorHex ||
                                      item.attributes.color.colorCode ||
                                      "#888",
                                  }}
                                />
                                <span>{item.attributes.color.colorName}</span>
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex items-baseline gap-2 flex-wrap text-xs">
                            <span className="font-bold text-zinc-900 dark:text-white">
                              ₹{item.price.toLocaleString()}
                            </span>
                            {item.mrp > item.price && (
                              <span className="line-through text-zinc-400">
                                ₹{item.mrp.toLocaleString()}
                              </span>
                            )}
                            <span className="text-[11px] text-zinc-400 block w-full mt-0.5">
                              Inclusive of all taxes{item.gstRate ? ` (${item.gstRate}% GST)` : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Item Subtotal */}
                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-zinc-500 block">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white font-mono">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>

          {/* ================= RIGHT COLUMN: STICKY ORDER SUMMARY ================= */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-100 dark:border-zinc-800">
                Acquisition Summary
              </h2>

              {/* Financial breakdown */}
              <div className="py-4 space-y-3 text-xs border-b border-zinc-100 dark:border-zinc-800">
                {mrpTotal > sellingPriceSubtotal && discount > 0 ? (
                  <>
                    <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                      <span>Gross MRP Subtotal:</span>
                      <span className="font-mono line-through">₹{mrpTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Catalog Discount:</span>
                      <span className="font-mono">- ₹{discount.toLocaleString()}</span>
                    </div>
                  </>
                ) : null}

                <div className="flex justify-between text-zinc-700 dark:text-zinc-300 font-medium">
                  <span>Items Subtotal:</span>
                  <span className="font-mono">₹{sellingPriceSubtotal.toLocaleString()}</span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Promo Code (10%):</span>
                    <span className="font-mono">- ₹{promoDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Insured Express Courier:</span>
                  <span>
                    {deliveryCharge === 0 ? (
                      <strong className="text-emerald-600 uppercase text-[10px]">Complimentary</strong>
                    ) : (
                      `₹${deliveryCharge.toLocaleString()}`
                    )}
                  </span>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="py-4 border-b border-zinc-100 dark:border-zinc-800">
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo Code (e.g. ATELIER10)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white uppercase placeholder:normal-case placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              </div>

              {/* Total Row */}
              <div className="pt-4 flex justify-between items-baseline">
                <div>
                  <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider block">
                    Payable Amount
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Settled via {paymentMode === "online" ? "Razorpay" : "Cash on Delivery"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                    ₹{finalPayable.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 text-right mt-2">
                {taxAmount > 0
                  ? `Inclusive of all taxes (Includes ₹${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GST)`
                  : 'Inclusive of all taxes'}
              </p>

              {/* Complete Order CTA */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading || !activeAddress}
                className="w-full mt-6 py-4 px-6 rounded-2xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 font-bold text-sm uppercase tracking-wider transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer group"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900 border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span>
                      {paymentMode === "online" ? "Authorize & Complete Order" : "Place Order (Cash on Delivery)"}
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              {/* Trust Assurances */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>256-Bit SSL Bank Encrypted Settlement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0" />
                  <span>100% Authentic Guaranteed Atelier Creations</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0" />
                  <span>7-Day Complimentary Concierge Returns</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Address Switcher Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Select Dispatch Address
              </h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {allAddresses.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => handleSelectAddress(addr)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                    selectedAddress?._id === addr._id
                      ? "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800/60"
                      : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  <p className="font-bold text-sm text-zinc-900 dark:text-white">{addr.fullName}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                    {[addr.addressLine1 || addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-xs font-mono text-zinc-400 mt-1">📞 {addr.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
    </AuthGuard>
  );
}
