'use client';

import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import api from "../../config/apiUser";
import useScrollToTop from "../../hooks/useScrollToTop";
import OrderDetailsSkeleton from "../../components/user/loadingSkeleton/OrderDetailsSkeleton";
import { 
  ArrowLeft, 
  FileText, 
  Package, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  RotateCcw,
  CreditCard,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Printer,
  AlertCircle
} from "lucide-react";

interface OrderItemGallery {
  url: string;
  public_id?: string;
}

interface OrderItem {
  product: string;
  title: string;
  price: number;
  mrp: number;
  quantity: number;
  size?: string;
  color?: string;
  description?: string;
  gallery?: OrderItemGallery[];
  subTotal: number;
  basePrice?: number;
  gstRate?: number;
  gstAmount?: number;
}

interface OrderAddress {
  fullName: string;
  phone: string;
  alternatePhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  street?: string;
  landmark?: string;
  city: string;
  state: string;
  country?: string;
  pincode: string;
}

interface OrderPaymentDetails {
  method: string;
  transactionId?: string;
  payableAmount: number;
  status: string;
}

interface OrderPriceSummary {
  basePriceSubTotal?: number;
  mrpSubTotal?: number;
  subTotal: number;
  taxAmount?: number;
  deliveryCharge: number;
  discount: number;
  total: number;
}

interface OrderData {
  _id: string;
  orderId: string;
  createdAt: string;
  status: string;
  cancelReason?: string;
  items: OrderItem[];
  address: OrderAddress;
  paymentDetails: OrderPaymentDetails;
  priceSummary: OrderPriceSummary;
}

export default function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const justPlaced = location?.state?.justPlaced || (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("justPlaced") === "true");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useScrollToTop();

  const getOrderDetails = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.data?.status === "success") {
        setOrder(res.data.data.order);
      }
    } catch (err) {
      console.error("Order details fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrderDetails();
  }, [orderId]);

  if (loading) {
    return <OrderDetailsSkeleton />;
  }

  if (!order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
        <Package className="w-12 h-12 text-zinc-400 mb-3" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Order Not Found</h2>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm">
          We could not locate this acquisition record. It may have been archived or entered incorrectly.
        </p>
        <Link
          to="/profile/orders"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const addressFormatted = [
    order.address.addressLine1 || order.address.street,
    order.address.addressLine2,
    order.address.landmark,
    order.address.city,
    `${order.address.state} - ${order.address.pincode}`
  ].filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      
      {/* Just Placed Success Banner */}
      {justPlaced && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-4 rounded-3xl flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Acquisition Confirmed
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Your Atelier order #{order.orderId} has been securely authorized and dispatched to our ateliers.
              </p>
            </div>
          </div>
          <Link
            to={`/profile/orders/${order._id}/invoice`}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 transition shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tax Invoice</span>
          </Link>
        </div>
      )}

      {/* Navigation & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          to="/profile/orders"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition w-fit"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back to Order History</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/profile/orders/${order._id}/invoice`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-white text-zinc-800 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider transition hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Tax Invoice</span>
          </Link>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        {/* Top Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Order #{order.orderId}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Placed on {orderDate}</span>
            </p>
          </div>

          <div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        {/* Tracking Progress Stepper */}
        <div className="py-8 border-b border-zinc-100 dark:border-zinc-800">
          <OrderProgressTracker status={order.status} />

          {order.status === "cancelled" && (
            <div className="mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900 dark:text-rose-100">Order Cancelled</p>
                <p className="mt-0.5 text-rose-700 dark:text-rose-300">
                  {order.cancelReason || "Payment was not authorized or the payment session was dismissed."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Items in Order */}
        <div className="py-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
            Curated Acquisition Items
          </h2>

          <div className="space-y-4">
            {order.items.map((item, idx) => {
              const imgUrl = item.gallery?.[0]?.url;
              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
                >
                  <div className="flex items-center gap-4">
                    <Link to={`/products/${item.product}`} className="shrink-0 group">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.title}
                          className="w-20 h-24 sm:w-22 sm:h-26 object-cover rounded-xl bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-20 h-24 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                          <Package className="w-6 h-6 text-zinc-400" />
                        </div>
                      )}
                    </Link>

                    <div>
                      <Link 
                        to={`/products/${item.product}`}
                        className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white hover:underline line-clamp-1"
                      >
                        {item.title}
                      </Link>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {item.size && (
                          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-semibold text-zinc-800 dark:text-zinc-200">
                            Size: {item.size}
                          </span>
                        )}
                        <span>Quantity: <strong>{item.quantity}</strong></span>
                      </div>

                      <div className="mt-2 text-xs text-zinc-400 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span>Price: ₹{item.price.toLocaleString()} each</span>
                          {item.mrp > item.price && (
                            <span className="line-through text-zinc-400">₹{item.mrp.toLocaleString()}</span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          Inclusive of all taxes{item.gstRate ? ` (${item.gstRate}% GST)` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right self-end sm:self-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                      Line Total
                    </span>
                    <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-mono">
                      ₹{(item.subTotal || item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Address and Payment Grid */}
        <div className="py-6 border-b border-zinc-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dispatch Destination */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <MapPin className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <span>Dispatch Address</span>
            </div>
            <p className="font-bold text-sm text-zinc-900 dark:text-white">
              {order.address.fullName}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
              {addressFormatted}
            </p>
            <p className="text-xs font-mono text-zinc-500 mt-2">
              📞 {order.address.phone}
              {order.address.alternatePhone && ` / ${order.address.alternatePhone}`}
            </p>
          </div>

          {/* Payment Method */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <CreditCard className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <span>Payment Details</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment Mode:</span>
                <span className="font-semibold uppercase text-zinc-900 dark:text-white">
                  {order.paymentDetails.method === "online" ? "Online / Razorpay" : "Cash on Delivery"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Settlement Status:</span>
                <span className={`font-semibold capitalize ${
                  order.paymentDetails.status === "paid" 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-amber-600 dark:text-amber-400"
                }`}>
                  {order.paymentDetails.status || "Pending"}
                </span>
              </div>
              {order.paymentDetails.transactionId && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Transaction ID:</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300 truncate max-w-[180px]">
                    {order.paymentDetails.transactionId}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
                <span className="text-zinc-500">Amount Authorized:</span>
                <span className="font-bold text-zinc-900 dark:text-white font-mono">
                  ₹{order.priceSummary.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Price Details */}
        {(() => {
          const taxAmount = Number(order.priceSummary?.taxAmount) || 0;
          const subTotalInclusive = Number(order.priceSummary?.subTotal) || 0;
          const subTotalBeforeTax = (order.priceSummary?.basePriceSubTotal && order.priceSummary.basePriceSubTotal > 0)
            ? Number(order.priceSummary.basePriceSubTotal)
            : Math.max(0, subTotalInclusive - taxAmount);
          const mrpTotal = Number(order.priceSummary?.mrpSubTotal) || 0;
          const discount = Number(order.priceSummary?.discount) || 0;
          const deliveryCharge = Number(order.priceSummary?.deliveryCharge) || 0;
          const total = Number(order.priceSummary?.total) || (subTotalInclusive + deliveryCharge);

          return (
            <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="text-xs text-zinc-500 space-y-1">
                <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Atelier Compliments & Assurances
                </p>
                <p>• All garments eligible for complimentary 7-day concierge exchange.</p>
                <p>• Full GST breakdown and HSN details available in printable invoice.</p>
              </div>

              <div className="w-full sm:w-80 space-y-2 text-xs">
                {mrpTotal > subTotalInclusive && discount > 0 ? (
                  <>
                    <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                      <span>Gross MRP:</span>
                      <span className="font-mono line-through">₹{mrpTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>VIP Privilege Savings:</span>
                      <span className="font-mono">- ₹{discount.toLocaleString()}</span>
                    </div>
                  </>
                ) : null}

                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Items Subtotal:</span>
                  <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    ₹{subTotalInclusive.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Express Insured Shipping:</span>
                  <span>
                    {deliveryCharge === 0 ? (
                      <strong className="text-emerald-600 uppercase text-[10px]">Free</strong>
                    ) : (
                      `₹${deliveryCharge}`
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-base font-extrabold text-zinc-900 dark:text-white">
                  <span>Grand Total:</span>
                  <span className="font-mono">₹{total.toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-zinc-400 text-right">
                  {taxAmount > 0
                    ? `Inclusive of all taxes (Includes ₹${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GST)`
                    : 'Inclusive of all taxes'}
                </p>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}

/* ================= STATUS BADGE ================= */
function OrderStatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();

  if (s === "delivered") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>Delivered</span>
      </span>
    );
  }
  if (s === "shipped" || s === "in transit") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
        <Truck className="w-3.5 h-3.5 shrink-0" />
        <span>In Transit</span>
      </span>
    );
  }
  if (s === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
        <XCircle className="w-3.5 h-3.5 shrink-0" />
        <span>Cancelled</span>
      </span>
    );
  }
  if (s === "returned") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
        <span>Returned</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
      <Clock className="w-3.5 h-3.5 shrink-0" />
      <span>Processing</span>
    </span>
  );
}

/* ================= STEPPER ================= */
function OrderProgressTracker({ status }: { status: string }) {
  const steps = ["pending", "confirmed", "processing", "shipped", "delivered"];
  const labels: Record<string, string> = {
    pending: "Order Placed",
    confirmed: "Authorized",
    processing: "Atelier Tailoring",
    shipped: "Express Transit",
    delivered: "Delivered",
  };

  const isCancelled = status === "cancelled";
  const isReturned = status === "returned";
  const currentIndex = steps.indexOf(status);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-2">
        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex && !isCancelled;
          const isCurrent = idx === currentIndex && !isCancelled;

          return (
            <div key={step} className="flex md:flex-1 items-center relative">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                    isCancelled
                      ? "bg-rose-100 text-rose-600 border border-rose-300"
                      : isDone
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-xs ${
                    isCurrent
                      ? "font-bold text-zinc-900 dark:text-white"
                      : isDone
                      ? "font-medium text-zinc-700 dark:text-zinc-300"
                      : "text-zinc-400"
                  }`}
                >
                  {labels[step]}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`hidden md:block flex-1 h-0.5 mx-3 rounded ${
                    idx < currentIndex && !isCancelled
                      ? "bg-zinc-900 dark:bg-white"
                      : "bg-zinc-200 dark:bg-zinc-800"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {isCancelled && (
        <div className="mt-3 p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>This order has been cancelled and any paid funds are eligible for auto-reversal.</span>
        </div>
      )}
    </div>
  );
}
