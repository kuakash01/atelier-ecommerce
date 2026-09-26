'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import apiAdmin from "@/config/apiAdmin";
import { 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  ReceiptText,
  Package,
  Calendar,
  CreditCard,
  User,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";

interface InvoiceItem {
  product?: string;
  title: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  mrp?: number;
  basePrice?: number;
  gstRate?: number;
  gstAmount?: number;
  subTotal: number;
}

interface InvoiceAddress {
  fullName: string;
  phone: string;
  alternatePhone?: string;
  addressLine1?: string;
  street?: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  country?: string;
  pincode: string;
}

interface InvoiceOrder {
  _id: string;
  orderId: string;
  createdAt: string;
  status: string;
  user?: {
    name?: string;
    email?: string;
  };
  items: InvoiceItem[];
  address: InvoiceAddress;
  paymentDetails: {
    method: string;
    transactionId?: string;
    payableAmount: number;
    status: string;
  };
  priceSummary: {
    basePriceSubTotal?: number;
    mrpSubTotal?: number;
    subTotal: number;
    taxAmount?: number;
    deliveryCharge: number;
    discount?: number;
    total: number;
  };
}

export default function AdminOrderInvoice() {
  const params = useParams();
  const orderIdParam = (params?.id || params?.orderId) as string;
  const [order, setOrder] = useState<InvoiceOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderIdParam) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await apiAdmin.get(`/admin/orders/${orderIdParam}`);
        if (res.data?.status === "success" && res.data.data) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load admin invoice:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderIdParam]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Loading Official Tax Invoice...
        </span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
        <ReceiptText className="w-12 h-12 text-zinc-400 mb-3" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Tax Invoice Not Found</h2>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm">
          We could not locate the order invoice for record #{orderIdParam}. Please verify the order ID.
        </p>
        <Link
          href="/admin/orders"
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-bold uppercase tracking-wider transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Orders Management</span>
        </Link>
      </div>
    );
  }

  const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const invoiceNumber = `INV-${order.orderId || order._id.slice(-8).toUpperCase()}`;
  const addressLine = [
    order.address?.addressLine1 || order.address?.street,
    order.address?.addressLine2,
    order.address?.landmark,
    order.address?.city,
    `${order.address?.state} - ${order.address?.pincode}`,
  ]
    .filter(Boolean)
    .join(", ");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const taxAmount = Number(order.priceSummary?.taxAmount) || 0;
  const subTotalInclusive = Number(order.priceSummary?.subTotal) || 0;
  const subtotalBeforeTax = (order.priceSummary?.basePriceSubTotal && order.priceSummary.basePriceSubTotal > 0)
    ? Number(order.priceSummary.basePriceSubTotal)
    : Math.max(0, subTotalInclusive - taxAmount);
  const deliveryCharge = Number(order.priceSummary?.deliveryCharge) || 0;
  const discount = Number(order.priceSummary?.discount) || 0;
  const mrpTotal = Number(order.priceSummary?.mrpSubTotal) || 0;
  const total = Number(order.priceSummary?.total) || (subTotalInclusive + deliveryCharge);

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 space-y-6 print:p-0 print:m-0 print:max-w-none print:w-full print:space-y-0">
      {/* Top Admin Action Bar (Hidden in Print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Admin Invoice Preview
          </span>
          <StatusBadge status={order.status} type="order" />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
            Customer: {order.user?.email || order.address?.fullName}
          </span>
          <Button
            type="button"
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-4 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </Button>
        </div>
      </div>

      {/* ================= TAX INVOICE SHEET ================= */}
      <div 
        id="invoice-sheet"
        className="bg-white text-zinc-900 p-6 sm:p-10 rounded-3xl border border-zinc-200 shadow-xl print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none print:w-full print:block"
      >
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-zinc-900">
          <div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 uppercase">
              ATELIER & CO.
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mt-0.5">
              Haute Couture & Contemporary Apparel
            </p>
            <div className="mt-3 text-xs text-zinc-600 leading-relaxed max-w-sm">
              <p className="font-semibold text-zinc-900">Atelier Luxury Retail Pvt. Ltd.</p>
              <p>45 Haute Couture Avenue, Bandra West</p>
              <p>Mumbai, Maharashtra 400050, India</p>
              <p className="mt-1 font-mono text-[11px]">
                <span className="font-semibold text-zinc-800">GSTIN:</span> 27AABCA9876K1Z9
              </p>
              <p className="font-mono text-[11px]">
                <span className="font-semibold text-zinc-800">CIN:</span> U18101MH2024PTC123456
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="inline-block px-3 py-1 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-md mb-2">
              TAX INVOICE
            </span>
            <div className="space-y-1 text-xs text-zinc-600">
              <p>
                <span className="font-semibold text-zinc-900">Invoice No: </span>
                <span className="font-mono font-bold text-zinc-900">{invoiceNumber}</span>
              </p>
              <p>
                <span className="font-semibold text-zinc-900">Date: </span>
                <span>{invoiceDate}</span>
              </p>
              <p>
                <span className="font-semibold text-zinc-900">Order ID: </span>
                <span className="font-mono">#{order.orderId || order._id}</span>
              </p>
              <p>
                <span className="font-semibold text-zinc-900">Payment Mode: </span>
                <span className="uppercase font-semibold text-zinc-900">
                  {order.paymentDetails?.method === "online" ? "Online / Razorpay" : "Cash on Delivery (COD)"}
                </span>
              </p>
              {order.paymentDetails?.transactionId && (
                <p className="text-[11px] font-mono truncate max-w-[200px] sm:ml-auto">
                  <span className="font-semibold text-zinc-800">Txn ID: </span>
                  {order.paymentDetails.transactionId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bill To & Ship To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-zinc-200 text-xs">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
              Billed & Dispatched To
            </span>
            <p className="font-bold text-sm text-zinc-900">
              {order.address?.fullName || order.user?.name || "Valued Customer"}
            </p>
            <p className="text-zinc-600 mt-1 leading-relaxed">{addressLine}</p>
            <p className="text-zinc-700 mt-2 font-mono">
              <span className="font-semibold">Phone:</span> {order.address?.phone || "N/A"}
              {order.address?.alternatePhone && ` / ${order.address.alternatePhone}`}
            </p>
            {order.user?.email && (
              <p className="text-zinc-500 font-mono text-[11px]">
                Email: {order.user.email}
              </p>
            )}
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
              Place of Supply & Delivery
            </span>
            <p className="font-semibold text-zinc-900">{order.address?.state || "Maharashtra"}, India</p>
            <p className="text-zinc-600 mt-1">State Code: 27 (Maharashtra)</p>
            <p className="text-zinc-600 mt-1">
              Dispatch Carrier: Atelier Premier Express Air
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Complimentary Insured Shipping</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6 border-b border-zinc-200 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-zinc-900 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                <th className="py-2.5 pr-2">#</th>
                <th className="py-2.5 px-2">Description</th>
                <th className="py-2.5 px-2">HSN</th>
                <th className="py-2.5 px-2 text-center">Qty</th>
                <th className="py-2.5 px-2 text-right">Unit Price (Incl. GST)</th>
                <th className="py-2.5 px-2 text-right">Taxable Value</th>
                <th className="py-2.5 px-2 text-right">GST %</th>
                <th className="py-2.5 pl-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {order.items?.map((item, idx) => {
                const itemGstRate = item.gstRate || 18;
                const itemBasePrice = (item.basePrice && item.basePrice > 0)
                  ? item.basePrice
                  : item.price / (1 + itemGstRate / 100);
                const itemTotalBase = itemBasePrice * item.quantity;
                const itemTotal = item.subTotal || (item.price * item.quantity);

                return (
                  <tr key={idx} className="hover:bg-zinc-50/50">
                    <td className="py-3 pr-2 text-zinc-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-2">
                      <p className="font-bold text-zinc-900">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-2 font-mono text-zinc-600">6203</td>
                    <td className="py-3 px-2 text-center font-bold text-zinc-900 font-mono">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-zinc-800">
                      ₹{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-zinc-600">
                      ₹{itemTotalBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-zinc-600">
                      {itemGstRate}%
                    </td>
                    <td className="py-3 pl-2 text-right font-bold text-zinc-900 font-mono">
                      ₹{itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Financial Summary & Tax Breakdown */}
        <div className="py-6 border-b border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* GST Split Summary */}
          <div className="space-y-2 rounded-2xl bg-zinc-50 p-4 border border-zinc-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
              Statutory Tax Breakdown (Reverse Calculated)
            </span>
            <div className="space-y-1.5 text-zinc-600">
              <div className="flex justify-between">
                <span>Central GST (CGST - 50%):</span>
                <span className="font-mono">{formatCurrency(taxAmount / 2)}</span>
              </div>
              <div className="flex justify-between">
                <span>State GST (SGST - 50%):</span>
                <span className="font-mono">{formatCurrency(taxAmount / 2)}</span>
              </div>
              <div className="flex justify-between font-bold text-zinc-900 pt-1 border-t border-zinc-200">
                <span>Total Tax Amount (Included in Price):</span>
                <span className="font-mono">{formatCurrency(taxAmount)}</span>
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 pt-1 leading-relaxed">
              All product prices are tax-inclusive. GST has been reverse-calculated at applicable rates.
            </p>
          </div>

          {/* Grand Totals */}
          <div className="space-y-2 sm:pl-6">
            {mrpTotal > subTotalInclusive && discount > 0 && (
              <>
                <div className="flex justify-between text-zinc-500">
                  <span>Gross MRP Subtotal:</span>
                  <span className="font-mono line-through">{formatCurrency(mrpTotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Catalog Discount:</span>
                  <span className="font-mono">-{formatCurrency(discount)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between text-zinc-600">
              <span>Taxable Subtotal (Before Tax):</span>
              <span className="font-mono font-medium text-zinc-900">
                {formatCurrency(subtotalBeforeTax)}
              </span>
            </div>

            <div className="flex justify-between text-zinc-600">
              <span>Taxes (CGST + SGST):</span>
              <span className="font-mono font-medium text-zinc-900">
                +{formatCurrency(taxAmount)}
              </span>
            </div>

            <div className="flex justify-between text-zinc-600">
              <span>Shipping / Courier Charges:</span>
              <span className="font-mono text-zinc-900">
                {deliveryCharge === 0 ? "Complimentary" : formatCurrency(deliveryCharge)}
              </span>
            </div>

            <div className="pt-2 border-t-2 border-zinc-900 flex justify-between items-baseline text-base font-black text-zinc-900">
              <span>Total Invoice Amount:</span>
              <span className="text-xl font-mono">{formatCurrency(total)}</span>
            </div>
            <p className="text-[10px] text-zinc-500 text-right">
              Total amount settled in full via {order.paymentDetails?.method === "online" ? "Razorpay Gateway" : "Cash on Delivery"}
            </p>
          </div>
        </div>

        {/* Footer & Declaration */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-[10px] text-zinc-500">
          <div className="space-y-1 max-w-md">
            <p className="font-bold uppercase tracking-wider text-zinc-700">Declaration & Conditions</p>
            <p>
              This is a digitally generated computer invoice issued pursuant to Section 31 of the CGST Act 2017.
              All disputes are subject to Mumbai, Maharashtra jurisdiction only.
            </p>
            <p className="text-zinc-400 font-mono">
              Generated by Atelier Operations Platform · Support: concierge@atelier.com
            </p>
          </div>

          <div className="text-right sm:text-right shrink-0">
            <div className="h-10 border-b border-zinc-300 w-44 mb-1 mx-auto sm:ml-auto" />
            <p className="font-bold text-zinc-800 uppercase tracking-wider">Authorised Signatory</p>
            <p className="text-zinc-500">Atelier Luxury Retail Pvt. Ltd.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
