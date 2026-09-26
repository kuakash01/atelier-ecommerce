'use client';

import React, { useEffect, useRef, useState } from "react";
import api from "../../config/apiUser";
import { toast } from "react-toastify";
import useScrollToTop from "../../hooks/useScrollToTop";
import ProfileSkeleton from "../../components/user/loadingSkeleton/ProfileSkeleton";
import { 
  Camera, 
  Check, 
  Edit3, 
  Mail, 
  Calendar, 
  Shield, 
  Sparkles,
  Lock,
  UserCheck
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setUserData } from "../../redux/userSlice";

interface UserProfile {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  profilePicture?: string;
  createdAt?: string;
}

export default function Profile() {
  useScrollToTop();
  const dispatch = useAppDispatch();
  const { userData } = useAppSelector((state) => state.user);

  const [user, setUser] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Profile
  const fetchProfile = async () => {
    try {
      const res = await api.get("/user/profile");
      const profile = res.data?.data || {};
      setUser(profile);
      setNameInput(profile.name || "");
    } catch {
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update Name
  const handleUpdateName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      toast.error("Full name cannot be empty");
      return;
    }

    try {
      const res = await api.put("/user/profile", { name: trimmed });
      const updated = res.data?.data || {};
      setUser(updated);
      setIsEditingName(false);
      
      // Update global user slice
      if (userData) {
        dispatch(setUserData({ ...userData, name: updated.name || trimmed }));
      }
      toast.success("Profile name updated successfully");
    } catch {
      toast.error("Failed to update name");
    }
  };

  // Image Upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image must be under 3MB");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      setIsUpdatingImage(true);
      const res = await api.put("/user/profile", formData);
      const updated = res.data?.data || {};
      setUser(updated);

      if (userData) {
        dispatch(
          setUserData({
            ...userData,
            profilePicture: updated.profilePicture,
          })
        );
      }
      toast.success("Profile portrait updated");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUpdatingImage(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  const avatarUrl =
    user.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.name || "VIP"
    )}&background=18181b&color=ffffff&bold=true`;

  return (
    <div className="space-y-6">
      
      {/* Primary Identity Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
          {/* Avatar with Camera Overlay */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 shadow-md">
              <img
                src={avatarUrl}
                alt={user.name || "User Portrait"}
                className={`w-full h-full object-cover transition-opacity ${
                  isUpdatingImage ? "opacity-40" : "opacity-100"
                }`}
              />
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUpdatingImage}
              aria-label="Upload profile photo"
              className="absolute -bottom-2 -right-2 p-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {/* Identity & Inline Edit */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 mb-1">
              <Sparkles className="w-3 h-3" />
              Verified Client Profile
            </div>

            {!isEditingName ? (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  {user.name || "VIP Atelier Client"}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  title="Edit Name"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 max-w-sm mt-1">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-sm font-semibold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleUpdateName}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider shadow-sm hover:opacity-90 transition"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingName(false);
                    setNameInput(user.name || "");
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
                >
                  Cancel
                </button>
              </div>
            )}

            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Account identity synchronized with Atelier client registry.
            </p>
          </div>
        </div>

        {/* Credentials & Details Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 shadow-xs text-zinc-700 dark:text-zinc-300">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Registered Email
              </span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate block">
                {user.email || "—"}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 shadow-xs text-zinc-700 dark:text-zinc-300">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Account Type
              </span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-white capitalize block">
                {user.role || "Customer"}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 shadow-xs text-zinc-700 dark:text-zinc-300">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Account Created
              </span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-white block">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "2026"}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 shadow-xs text-zinc-700 dark:text-zinc-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Session Security
              </span>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 block">
                Encrypted Cookie Auth
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Security & Authentication Notice Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Password & Passwordless Security
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Your account utilizes multi-factor OTP verification protected by HttpOnly SameSite authentication cookies.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
