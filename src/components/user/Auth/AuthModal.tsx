'use client';

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  KeyRound, 
  CheckCircle2,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import api from "../../../config/apiUser";
import { useAppDispatch } from "../../../redux/hooks";
import { setIsAuthModalOpen, setIsAuthenticated, setUserData } from "../../../redux/userSlice";
import { toast } from "react-toastify";

interface AuthModalProps {
  isAuthModalOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean | null;
}

type AuthTab = "login" | "register";
type LoginMode = "password" | "otp";
type RegisterStep = "form" | "otp";

export default function AuthModal({ isAuthModalOpen, onClose, isAuthenticated }: AuthModalProps) {
  const dispatch = useAppDispatch();

  // Navigation & Form State
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [loginMode, setLoginMode] = useState<LoginMode>("password");
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login OTP State
  const [otpStep, setOtpStep] = useState<"enter-email" | "enter-otp">("enter-email");
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isNewUserOtp, setIsNewUserOtp] = useState(false);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Registration OTP State
  const [registerStep, setRegisterStep] = useState<RegisterStep>("form");
  const [registerOtp, setRegisterOtp] = useState<string[]>(new Array(6).fill(""));
  const [registerTimer, setRegisterTimer] = useState(30);
  const [canResendRegisterOtp, setCanResendRegisterOtp] = useState(false);
  const registerOtpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Sync local cart helper
  const syncGuestCart = async () => {
    try {
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (Array.isArray(localCart) && localCart.length > 0) {
        await api.post("/cart/guest/sync", { items: localCart });
        localStorage.removeItem("cart");
      }
    } catch (err) {
      console.warn("Cart sync notice:", err);
    }
  };

  // Timer countdown for Login OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeTab === "login" && loginMode === "otp" && otpStep === "enter-otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, loginMode, otpStep, timer]);

  // Focus Login OTP input on transition
  useEffect(() => {
    if (activeTab === "login" && loginMode === "otp" && otpStep === "enter-otp") {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }
  }, [activeTab, loginMode, otpStep]);

  // Timer countdown for Registration OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeTab === "register" && registerStep === "otp" && registerTimer > 0) {
      interval = setInterval(() => {
        setRegisterTimer((prev) => prev - 1);
      }, 1000);
    } else if (registerTimer === 0) {
      setCanResendRegisterOtp(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, registerStep, registerTimer]);

  // Focus Registration OTP input on transition
  useEffect(() => {
    if (activeTab === "register" && registerStep === "otp") {
      setTimeout(() => {
        registerOtpInputsRef.current[0]?.focus();
      }, 150);
    }
  }, [activeTab, registerStep]);

  if (!isAuthModalOpen) return null;

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  /* ================= PASSWORD LOGIN ================= */
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!validateEmail(cleanEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", {
        email: cleanEmail,
        password,
      });

      if (res.data.status === "success") {
        if (res.data.token && typeof window !== "undefined") {
          localStorage.setItem("user_token", res.data.token);
          localStorage.setItem("token", res.data.token);
        }
        dispatch(setIsAuthenticated(true));
        dispatch(setUserData(res.data.userData));
        dispatch(setIsAuthModalOpen(false));
        toast.success(`Welcome back, ${res.data.userData?.name || "Member"}!`);
        await syncGuestCart();
        onClose();
      } else {
        toast.error(res.data.message || "Failed to sign in");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEND REGISTRATION OTP (STEP 1) ================= */
  const handleSendRegisterOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      toast.error("Please enter your full name");
      return;
    }
    if (!validateEmail(cleanEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register-otp", {
        name: cleanName,
        email: cleanEmail,
      });

      if (res.data.status === "success") {
        setRegisterStep("otp");
        setRegisterTimer(30);
        setCanResendRegisterOtp(false);
        setRegisterOtp(new Array(6).fill(""));
        toast.success(`Verification code dispatched to ${cleanEmail}!`);
      } else {
        toast.error(res.data.message || "Failed to dispatch verification code");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An account with this email may already exist. Please sign in.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY REGISTRATION OTP (STEP 2) ================= */
  const handleVerifyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const enteredOtp = registerOtp.join("").trim();

    if (enteredOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        name: cleanName,
        email: cleanEmail,
        password,
        otp: enteredOtp,
      });

      if (res.data.status === "success") {
        if (res.data.token && typeof window !== "undefined") {
          localStorage.setItem("user_token", res.data.token);
          localStorage.setItem("token", res.data.token);
        }
        dispatch(setIsAuthenticated(true));
        dispatch(setUserData(res.data.userData));
        dispatch(setIsAuthModalOpen(false));
        toast.success(`Account verified & created! Welcome to Atelier, ${res.data.userData?.name || cleanName}.`);
        await syncGuestCart();
        onClose();
      } else {
        toast.error(res.data.message || "Registration failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid or expired passcode. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGIN OTP: SEND OTP ================= */
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!validateEmail(cleanEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/send-otp", { email: cleanEmail });

      if (res.data.status === "success") {
        setOtpStep("enter-otp");
        setTimer(30);
        setCanResend(false);
        setIsNewUserOtp(Boolean(res.data.isNewUser));
        setOtp(new Array(6).fill(""));
        toast.success(
          res.data.isNewUser
            ? "Passcode sent! Check your email to verify and continue."
            : "Verification passcode dispatched to your email inbox."
        );
      } else {
        toast.error(res.data.message || "Failed to send verification code");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to dispatch verification code");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGIN OTP: VERIFY OTP ================= */
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const enteredOtp = otp.join("").trim();

    if (enteredOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp: enteredOtp,
      });

      if (res.data.status === "success") {
        if (res.data.token && typeof window !== "undefined") {
          localStorage.setItem("user_token", res.data.token);
          localStorage.setItem("token", res.data.token);
        }
        dispatch(setIsAuthenticated(true));
        dispatch(setUserData({
          email: res.data.email,
          name: res.data.name,
          role: "customer",
          cartCount: 0
        }));
        dispatch(setIsAuthModalOpen(false));
        toast.success(res.data.isNewUser ? "Welcome to Atelier & Co.!" : "Welcome back!");
        await syncGuestCart();
        onClose();
      } else {
        toast.error(res.data.message || "Invalid or expired passcode");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Passcode verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DIGIT CHANGE HANDLERS ================= */
  const handleOtpDigitChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const updated = new Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) {
      updated[i] = pasted[i];
    }
    setOtp(updated);
    const nextIdx = Math.min(pasted.length, 5);
    otpInputsRef.current[nextIdx]?.focus();
  };

  /* Register OTP Handlers */
  const handleRegisterOtpDigitChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...registerOtp];
    updated[index] = digit;
    setRegisterOtp(updated);

    if (digit && index < 5) {
      registerOtpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleRegisterOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !registerOtp[index] && index > 0) {
      registerOtpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleRegisterOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const updated = new Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) {
      updated[i] = pasted[i];
    }
    setRegisterOtp(updated);
    const nextIdx = Math.min(pasted.length, 5);
    registerOtpInputsRef.current[nextIdx]?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden z-10 transition-all my-8">
        
        {/* Top Header Glow Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-indigo-600 to-amber-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          
          {/* Brand Monogram */}
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-serif font-black text-sm flex items-center justify-center shadow-sm">
              A
            </span>
            <span className="text-xs uppercase tracking-widest font-bold text-zinc-400 dark:text-zinc-500 font-mono">
              Atelier & Co.
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-zinc-900 dark:text-white">
            {activeTab === "login" 
              ? (loginMode === "password" ? "Sign In to Atelier" : "Passcode Authentication")
              : (registerStep === "form" ? "Create Client Account" : "Verify Your Email")}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {activeTab === "login"
              ? "Access your saved addresses, private orders, and curated wishlist."
              : (registerStep === "form" 
                  ? "Join our distinguished client circle for tailored styling and express checkout." 
                  : `Please enter the 6-digit verification passcode dispatched to ${email}`)}
          </p>

          {/* Tab Selector: Sign In vs Create Account */}
          <div className="mt-6 flex rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 p-1 border border-zinc-200/60 dark:border-zinc-700/60">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setLoginMode("password");
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === "login"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setRegisterStep("form");
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === "register"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* ================= TAB 1: SIGN IN ================= */}
          {activeTab === "login" && (
            <div className="mt-5">
              {loginMode === "password" ? (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="client@atelier.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition text-sm"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMode("otp");
                          setOtpStep("enter-email");
                        }}
                        className="text-xs text-zinc-500 dark:text-zinc-400 hover:underline cursor-pointer"
                      >
                        Use OTP instead?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email.trim() || !password}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 font-semibold text-sm transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMode("otp");
                        setOtpStep("enter-email");
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      Sign in with One-Time Email Passcode
                    </button>
                  </div>
                </form>
              ) : (
                /* OTP Flow */
                <div>
                  {otpStep === "enter-email" ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="client@atelier.com"
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition text-sm"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !email.trim()}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 font-semibold text-sm transition-all duration-200 shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Send OTP Passcode</span>}
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => setLoginMode("password")}
                          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline cursor-pointer"
                        >
                          Sign in with Password instead
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Enter 6-digit OTP */
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                          6-Digit Passcode
                        </label>
                        <button
                          type="button"
                          onClick={() => setOtpStep("enter-email")}
                          className="text-xs text-zinc-500 hover:underline cursor-pointer"
                        >
                          Change Email
                        </button>
                      </div>

                      <div className="grid grid-cols-6 gap-2" onPaste={handleOtpPaste}>
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => {
                              otpInputsRef.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpDigitChange(e.target.value, index)}
                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                            className="w-full aspect-square text-center font-bold text-lg rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition"
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>Didn't receive code?</span>
                        {canResend ? (
                          <button
                            type="button"
                            onClick={() => handleSendOtp()}
                            disabled={loading}
                            className="font-semibold text-zinc-900 dark:text-white hover:underline cursor-pointer"
                          >
                            Resend Code
                          </button>
                        ) : (
                          <span className="font-mono text-zinc-400">
                            Resend in {timer}s
                          </span>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading || otp.join("").length !== 6}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 font-semibold text-sm transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify & Sign In</span>}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: CREATE ACCOUNT (OTP BASED) ================= */}
          {activeTab === "register" && (
            <div className="mt-5">
              {registerStep === "form" ? (
                /* Step 1: Registration Details Form */
                <form onSubmit={handleSendRegisterOtp} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alexander Wright"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition text-sm"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="client@atelier.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition text-sm"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Create Password (min. 6 chars) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !name.trim() || !email.trim() || password.length < 6 || password !== confirmPassword}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 font-semibold text-sm transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Continue & Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Enter 6-digit OTP to complete registration */
                <form onSubmit={handleVerifyRegister} className="space-y-5">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setRegisterStep("form")}
                      className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      STEP 2 OF 2
                    </span>
                  </div>

                  <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 p-3.5 text-center">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      We sent a 6-digit verification code to
                    </p>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-0.5">
                      {email}
                    </p>
                  </div>

                  {/* OTP Digits Grid */}
                  <div className="grid grid-cols-6 gap-2" onPaste={handleRegisterOtpPaste}>
                    {registerOtp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          registerOtpInputsRef.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleRegisterOtpDigitChange(e.target.value, index)}
                        onKeyDown={(e) => handleRegisterOtpKeyDown(e, index)}
                        className="w-full aspect-square text-center font-bold text-lg rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition"
                      />
                    ))}
                  </div>

                  {/* Resend & Timer */}
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Didn't receive passcode?</span>
                    {canResendRegisterOtp ? (
                      <button
                        type="button"
                        onClick={() => handleSendRegisterOtp()}
                        disabled={loading}
                        className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    ) : (
                      <span className="font-mono text-zinc-400">
                        Resend in {registerTimer}s
                      </span>
                    )}
                  </div>

                  {/* Verify & Create Account Button */}
                  <button
                    type="submit"
                    disabled={loading || registerOtp.join("").length !== 6}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 font-semibold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Verify & Complete Registration</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Security Assurance Badge */}
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-center gap-2 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>256-Bit SSL Encrypted • Privacy Assured</span>
          </div>

        </div>
      </div>
    </div>
  );
}
