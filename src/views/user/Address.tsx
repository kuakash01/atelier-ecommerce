'use client';

import React, { useEffect, useState } from "react";
import api from "../../config/apiUser";
import { toast } from "react-toastify";
import useScrollToTop from "../../hooks/useScrollToTop";
import AddressSkeleton from "../../components/user/loadingSkeleton/AddressSkeleton";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Home, 
  Briefcase, 
  Building2, 
  Phone, 
  X,
  Sparkles
} from "lucide-react";

interface AddressItem {
  _id: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  addressType: "home" | "work" | "other" | string;
  isDefault?: boolean;
}

export default function Address() {
  useScrollToTop();

  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
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
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/address");
      setAddresses(res.data.data || []);
    } catch {
      toast.error("Failed to load delivery addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setFormData({
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
      isDefault: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: AddressItem) => {
    setEditingAddress(addr);
    setFormData({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      alternatePhone: addr.alternatePhone || "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      addressType: addr.addressType || "home",
      isDefault: !!addr.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/address/${id}`);
      toast.success("Address removed");
      await fetchAddresses();
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.put(`/address/default/${id}`);
      toast.success("Default address updated");
      await fetchAddresses();
    } catch {
      toast.error("Failed to set default address");
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.phone.trim()) return toast.error("Phone number is required");
    if (!formData.addressLine1.trim()) return toast.error("Address line 1 is required");
    if (!formData.city.trim()) return toast.error("City is required");
    if (!formData.state.trim()) return toast.error("State is required");
    if (!formData.pincode.trim()) return toast.error("Pincode is required");

    try {
      setIsSubmitting(true);
      if (editingAddress) {
        await api.put(`/address/${editingAddress._id}`, formData);
        toast.success("Address updated successfully");
      } else {
        await api.post("/address", formData);
        toast.success("New address saved");
      }
      setIsModalOpen(false);
      await fetchAddresses();
    } catch {
      toast.error("Failed to save address details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAddressTypeIcon = (type: string) => {
    if (type === "work") return <Briefcase className="w-3.5 h-3.5" />;
    if (type === "other") return <Building2 className="w-3.5 h-3.5" />;
    return <Home className="w-3.5 h-3.5" />;
  };

  if (loading) {
    return <AddressSkeleton />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Delivery Addresses
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your personal dispatch locations and default shipping destinations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Address</span>
        </button>
      </div>

      {/* Address Cards Grid */}
      {addresses.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-5">
            <MapPin className="w-10 h-10 opacity-50" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            No Addresses Saved
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Add a dispatch address for seamless, one-click checkout and complimentary courier delivery.
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between shadow-sm relative ${
                addr.isDefault
                  ? "border-zinc-900 dark:border-white ring-1 ring-zinc-900 dark:ring-white"
                  : "border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div>
                {/* Badges Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                      {getAddressTypeIcon(addr.addressType)}
                      {addr.addressType}
                    </span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                        <Check className="w-3 h-3" />
                        Default
                      </span>
                    )}
                  </div>

                  {/* Edit & Delete Action Icons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(addr)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                      title="Edit Address"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(addr._id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Recipient Name & Phone */}
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  {addr.fullName}
                </h3>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  <Phone className="w-3.5 h-3.5 opacity-60" />
                  <span>{addr.phone}</span>
                  {addr.alternatePhone && <span>/ {addr.alternatePhone}</span>}
                </div>

                {/* Street & Postal Address */}
                <div className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  {addr.landmark && (
                    <p className="text-zinc-400 text-xs mt-0.5">
                      Landmark: {addr.landmark}
                    </p>
                  )}
                  <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-xs text-zinc-400">{addr.country || "India"}</p>
                </div>
              </div>

              {/* Bottom Card Controls */}
              {!addr.isDefault && (
                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
                  >
                    Set as default dispatch address
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modern Modal: Add / Edit Address */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Box */}
          <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-zinc-900 dark:text-white" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {editingAddress ? "Edit Address" : "Add Delivery Address"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-5 space-y-4">
              {/* Recipient details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="E.g. Alexander Vance"
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="10-digit mobile"
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-400"
                  />
                </div>
              </div>

              {/* Address Lines */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Address Line 1 (Flat, House no., Building) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.addressLine1}
                  onChange={(e) =>
                    setFormData({ ...formData, addressLine1: e.target.value })
                  }
                  placeholder="Street name and apartment number"
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Address Line 2 (Area, Colony, Sector)
                </label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) =>
                    setFormData({ ...formData, addressLine2: e.target.value })
                  }
                  placeholder="Optional area details"
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>

              {/* Landmark, City, State, Pincode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) =>
                      setFormData({ ...formData, landmark: e.target.value })
                    }
                    placeholder="Nearby landmark"
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                    placeholder="6 digits"
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="City"
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder="State"
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-400"
                  />
                </div>
              </div>

              {/* Address Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Address Type
                </label>
                <div className="flex gap-3">
                  {[
                    { type: "home", label: "Home", icon: Home },
                    { type: "work", label: "Work", icon: Briefcase },
                    { type: "other", label: "Other", icon: Building2 },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = formData.addressType === t.type;
                    return (
                      <button
                        key={t.type}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, addressType: t.type })
                        }
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          isSelected
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
