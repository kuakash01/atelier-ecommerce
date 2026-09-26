'use client';

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../config/apiUser";
import { 
  Printer, 
  ArrowLeft, 
  Download, 
  ShieldCheck, 
  Building2, 
  ReceiptText,
  CheckCircle2,
  Clock
} from "lucide-react";
import useScrollToTop from "../../hooks/useScrollToTop";
import InvoiceSkeleton from "../../components/user/loadingSkeleton/InvoiceSkeleton";

interface InvoiceItem {
  product: string;
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

export default function OrderInvoice() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<InvoiceOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useScrollToTop();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        if (res.data?.status === "success") {
          setOrder(res.data.data.order);
        }
      } catch (err) {
        console.error("Failed to load invoice:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return <InvoiceSkeleton />;
  }

  if (!order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
        <ReceiptText className="w-12 h-12 text-zinc-400 mb-3" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Invoice Not Found</h2>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm">
          We could not locate the tax invoice for order #{orderId}.
        </p>
        <Link
          to="/profile/orders"
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Orders</span>
        </Link>
      </div>
    );
  }

  const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const invoiceNumber = `INV-${order.orderId}`;
  const addressLine = [
    order.address.addressLine1 || order.address.street,
    order.address.addressLine2,
    order.address.landmark,
    order.address.city,
    `${order.address.state} - ${order.address.pincode}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-2 sm:px-4 print:p-0 print:m-0 print:max-w-none print:w-full print:space-y-0">
      {/* Action Bar (hidden in print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          to={`/profile/orders/${order._id}`}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order Details</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* ================= TAX INVOICE SHEET ================= */}
      <div 
        id="invoice-sheet"
        className="bg-white text-zinc-900 p-6 sm:p-10 rounded-3xl border border-zinc-200 shadow-lg print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none print:w-full print:block"
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
                <span className="font-mono">#{order.orderId}</span>
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
            <p className="font-bold text-sm text-zinc-900">{order.address.fullName}</p>
            <p className="text-zinc-600 mt-1 leading-relaxed">{addressLine}</p>
            <p className="text-zinc-700 mt-2 font-mono">
              <span className="font-semibold">Phone:</span> {order.address.phone}
              {order.address.alternatePhone && ` / ${order.address.alternatePhone}`}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
              Place of Supply & Delivery
            </span>
            <p className="font-semibold text-zinc-900">{order.address.state}, India</p>
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

        {/* Itemized Line Items Table */}
        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-900 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                <th className="py-2.5 pr-2">#</th>
                <th className="py-2.5 px-3">Description & Atelier Specifications</th>
                <th className="py-2.5 px-2 text-center">Qty</th>
                <th className="py-2.5 px-2 text-right">Unit Price (Incl. GST)</th>
                <th className="py-2.5 px-2 text-right">GST Rate</th>
                <th className="py-2.5 pl-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {order.items.map((item, idx) => {
                const itemGst = item.gstRate ? `${item.gstRate}%` : "Included";
                const lineTotal = item.subTotal || item.price * item.quantity;
                const unitBase = item.basePrice || (item.gstRate ? Number(((item.price * 100) / (100 + item.gstRate)).toFixed(2)) : item.price);
                return (
                  <tr key={idx} className="hover:bg-zinc-50/60">
                    <td className="py-3 pr-2 text-zinc-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-zinc-900">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                        {item.size && <span>Size: <strong className="text-zinc-700">{item.size}</strong></span>}
                        {item.color && <span>• Color: <strong className="text-zinc-700">{item.color}</strong></span>}
                        <span className="font-mono text-[10px] text-zinc-400">HSN: 6205</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-semibold text-zinc-900">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-zinc-700">
                      ₹{item.price.toLocaleString()}
                      {unitBase && unitBase !== item.price ? (
                        <span className="block text-[10px] text-zinc-400">
                          (Base: ₹{unitBase.toFixed(2)})
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 px-2 text-right text-zinc-500 text-[11px]">
                      {itemGst}
                    </td>
                    <td className="py-3 pl-3 text-right font-bold text-zinc-900 font-mono">
                      ₹{lineTotal.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Financial Summary Calculation */}
        <div className="pt-4 border-t-2 border-zinc-900 flex flex-col sm:flex-row justify-between gap-6 text-xs">
          <div className="max-w-xs text-zinc-500 space-y-1">
            <p className="font-bold text-zinc-900 text-[11px] uppercase tracking-wider">
              Terms & Verification
            </p>
            <p className="text-[11px] leading-relaxed">
              This is a digitally generated computer invoice issued pursuant to Section 31 of the CGST Act 2017.
            </p>
            <p className="text-[11px] leading-relaxed">
              All luxury garments are eligible for complimentary size adjustments or returns within 7 calendar days.
            </p>
          </div>

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
              <div className="w-full sm:w-80 space-y-2">
                {mrpTotal > subTotalInclusive && discount > 0 ? (
                  <>
                    <div className="flex justify-between text-zinc-500">
                      <span>Gross MRP Subtotal:</span>
                      <span className="font-mono line-through">₹{mrpTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Catalog Discount:</span>
                      <span className="font-mono">- ₹{discount.toLocaleString()}</span>
                    </div>
                  </>
                ) : null}

                <div className="flex justify-between text-zinc-700 font-medium">
                  <div>
                    <span>Taxable Subtotal (Before Tax):</span>
                    <span className="text-[10px] text-zinc-400 block font-normal">Excl. GST</span>
                  </div>
                  <span className="font-mono">
                    ₹{subTotalBeforeTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {taxAmount > 0 && (
                  <div className="flex justify-between text-zinc-700 font-medium">
                    <div>
                      <span>Taxes (CGST + SGST):</span>
                      <span className="text-[10px] text-zinc-400 block font-normal">Tax Amount</span>
                    </div>
                    <span className="font-mono">
                      + ₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-600">
                  <span>Estimated Delivery & Courier:</span>
                  <span>
                    {deliveryCharge === 0 ? (
                      <strong className="text-emerald-700 uppercase text-[10px]">Complimentary</strong>
                    ) : (
                      `₹${deliveryCharge}`
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t-2 border-zinc-900 flex justify-between text-sm sm:text-base font-black text-zinc-900">
                  <span>Total Invoice Value:</span>
                  <span className="font-mono">₹{total.toLocaleString()}</span>
                </div>

                <p className="text-[10px] text-zinc-400 text-right">
                  {taxAmount > 0
                    ? `Item retail prices are tax-inclusive (Includes ₹${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GST)`
                    : 'All applicable taxes included in retail prices'}
                </p>

                <div className="pt-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-[10px] border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Invoice Validated & Cleared</span>
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer Guarantee */}
        <div className="mt-10 pt-4 border-t border-zinc-100 text-center text-[10px] text-zinc-400 uppercase tracking-widest">
          Atelier & Co. Luxury Apparel • Customer Concierge: concierge@atelier.com • Made in Mumbai
        </div>

      </div>
    </div>
  );
}
