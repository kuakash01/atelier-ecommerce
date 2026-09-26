'use client';

import React, { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../../config/apiUser";
import { toast } from "react-toastify";
import useScrollToTop from "../../hooks/useScrollToTop";
import { MapPin, Phone, User, Building, ArrowLeft, Check, ShieldCheck } from "lucide-react";

interface AddressFormData {
  fullName: string;
  phone: string;
  alternatePhone?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: "home" | "work" | "other";
}

export default function AddressForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  useScrollToTop();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    defaultValues: {
      fullName: "",
      phone: "",
      alternatePhone: "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      addressType: "home",
    },
  });

  const addressType = watch("addressType");

  // Fetch for edit
  useEffect(() => {
    if (!isEdit || !id) return;
    const fetchSingle = async () => {
      try {
        const res = await api.get("/addresses");
        const list = res.data?.data || [];
        const found = list.find((a: any) => a._id === id);

        if (!found) {
          toast.error("Address not found");
          return;
        }

        Object.keys(found).forEach((key) => {
          setValue(key as any, found[key]);
        });
      } catch (err) {
        console.error("Failed to load address:", err);
        toast.error("Failed to load address details");
      }
    };
    fetchSingle();
  }, [id, isEdit, setValue]);

  const onSubmit = async (data: AddressFormData) => {
    try {
      if (isEdit) {
        await api.put(`/addresses/${id}`, data);
        toast.success("Delivery address updated");
      } else {
        await api.post("/addresses", data);
        toast.success("New delivery address registered");
      }

      if (redirect) {
        navigate(redirect);
      } else {
        navigate("/profile/addresses");
      }
    } catch (err: any) {
      console.error("Save address error:", err);
      toast.error(err.response?.data?.message || "Failed to save address");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-6">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {isEdit ? "Edit Delivery Address" : "Register Dispatch Address"}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Ensure accurate information for seamless bespoke courier delivery.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Contact Info Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <User className="w-4 h-4 text-zinc-500" />
            <span>Recipient Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="Lord / Lady Jane Doe"
                {...register("fullName", { required: "Full name is required" })}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              />
              {errors.fullName && (
                <p className="text-rose-500 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                placeholder="9876543210"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Enter a valid 10-digit Indian phone number",
                  },
                })}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              />
              {errors.phone && (
                <p className="text-rose-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              Alternate Phone (Optional)
            </label>
            <input
              type="tel"
              placeholder="Optional backup phone"
              {...register("alternatePhone")}
              className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
            />
          </div>
        </div>

        {/* Address Fields Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <MapPin className="w-4 h-4 text-zinc-500" />
            <span>Street & Location</span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              Address Line 1 (Flat, House No., Building) *
            </label>
            <input
              type="text"
              placeholder="Apt 4B, The Atelier Residences"
              {...register("addressLine1", { required: "Address line 1 is required" })}
              className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
            />
            {errors.addressLine1 && (
              <p className="text-rose-500 text-xs mt-1">{errors.addressLine1.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Address Line 2 (Area, Sector)
              </label>
              <input
                type="text"
                placeholder="Pali Hill, Bandra West"
                {...register("addressLine2")}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Landmark
              </label>
              <input
                type="text"
                placeholder="Near Olive Bar"
                {...register("landmark")}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                City *
              </label>
              <input
                type="text"
                placeholder="Mumbai"
                {...register("city", { required: "City is required" })}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              />
              {errors.city && (
                <p className="text-rose-500 text-xs mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                State *
              </label>
              <input
                type="text"
                placeholder="Maharashtra"
                {...register("state", { required: "State is required" })}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              />
              {errors.state && (
                <p className="text-rose-500 text-xs mt-1">{errors.state.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Pincode *
              </label>
              <input
                type="text"
                placeholder="400050"
                maxLength={6}
                {...register("pincode", {
                  required: "Pincode is required",
                  pattern: { value: /^\d{6}$/, message: "6 digit pincode" },
                })}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              />
              {errors.pincode && (
                <p className="text-rose-500 text-xs mt-1">{errors.pincode.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Type Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
            Address Classification
          </label>
          <div className="flex gap-3">
            {(["home", "work", "other"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setValue("addressType", type)}
                className={`px-5 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider border transition cursor-pointer ${
                  addressType === type
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-2xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-xs font-bold uppercase tracking-wider transition shadow-sm hover:shadow disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Saving..." : isEdit ? "Update Address" : "Save Address"}
          </button>
        </div>

      </form>
    </div>
  );
}
