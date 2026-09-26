'use client';

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../config/apiUser";
import useScrollToTop from "../../hooks/useScrollToTop";
import OrdersSkeleton from "../../components/user/loadingSkeleton/OrdersSkeleton";
import { 
  Package, 
  ChevronRight, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Sparkles,
  FileText
} from "lucide-react";
import { toast } from "react-toastify";

interface OrderItem {
  _id?: string;
  title: string;
  price: number;
  quantity: number;
  mainImage?: string;
  thumbnail?: { url: string };
  attributes?: {
    size?: { sizeName?: string };
    color?: { colorName?: string; colorCode?: string };
  };
}

interface OrderPriceSummary {
  subtotal?: number;
  discount?: number;
  deliveryCharge?: number;
  total?: number;
}

interface OrderType {
  _id: string;
  orderId: string;
  status: string;
  items: OrderItem[];
  priceSummary: OrderPriceSummary;
  createdAt: string;
}

export default function Orders() {
  useScrollToTop();

  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCopyOrderId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Order ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Delivered
        </span>
      );
    }
    if (s === "shipped" || s === "in transit") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80">
          <Truck className="w-3.5 h-3.5" />
          In Transit
        </span>
      );
    }
    if (s === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80">
          <XCircle className="w-3.5 h-3.5" />
          Cancelled
        </span>
      );
    }
    if (s === "returned") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80">
          <RotateCcw className="w-3.5 h-3.5" />
          Returned
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
        <Clock className="w-3.5 h-3.5" />
        Processing
      </span>
    );
  };

  if (loading) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Order History
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Track dispatches, view invoices, and manage past acquisitions.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 self-start sm:self-auto">
          {orders.length} {orders.length === 1 ? "Order" : "Orders"} Placed
        </span>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-5">
            <Package className="w-10 h-10 opacity-50" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            No Orders Placed Yet
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Your personal order history is currently empty. Discover atelier pieces and timeless styles tailored for you.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-sm"
          >
            <span>Explore Collections</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const dateStr = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Recent";

            return (
              <div
                key={order._id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                {/* Top Row: ID, Placed Date & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white tracking-tight">
                      Order #{order.orderId}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyOrderId(order.orderId, e)}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      title="Copy Order ID"
                    >
                      {copiedId === order.orderId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {dateStr}
                    </span>
                  </div>

                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Middle: Items Preview */}
                {order.items && order.items.length > 0 && (
                  <div className="py-4 flex flex-wrap items-center gap-3">
                    {order.items.slice(0, 4).map((item, idx) => {
                      const img = item.mainImage || item.thumbnail?.url;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800"
                        >
                          {img ? (
                            <img
                              src={img}
                              alt={item.title}
                              className="w-12 h-14 object-cover rounded-xl bg-zinc-200"
                            />
                          ) : (
                            <div className="w-12 h-14 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                              <Package className="w-5 h-5 text-zinc-400" />
                            </div>
                          )}
                          <div className="pr-2 max-w-[150px]">
                            <div className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              Qty: {item.quantity} • ₹{item.price}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {order.items.length > 4 && (
                      <div className="h-14 px-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-500 flex items-center justify-center">
                        +{order.items.length - 4} more
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Row: Total & Detailed Action */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
                      Total Paid
                    </span>
                    <span className="text-lg font-extrabold text-zinc-900 dark:text-white">
                      ₹{(order.priceSummary?.total || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/profile/orders/${order._id}/invoice`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-white text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      title="View Tax Invoice"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Invoice</span>
                    </Link>

                    <Link
                      to={`/profile/orders/${order._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-sm"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
