import api from "../config/apiUser";

export interface RazorpayOrderData {
  key: string;
  amount?: number;
  currency?: string;
  razorpayOrderId: string;
  orderDocId: string;
}

export type NavigateFn = (to: string, options?: { replace?: boolean; state?: any }) => void;

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const openRazorpay = async (data: RazorpayOrderData, navigate: NavigateFn) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    console.error("Razorpay SDK failed to load");
    navigate("/checkout?payment=failed", { replace: true });
    return;
  }

  const options = {
    key: data.key,
    amount: data.amount,
    currency: data.currency || "INR",
    order_id: data.razorpayOrderId,
    name: "ATELIER & CO.",
    description: "Contemporary Luxury Wardrobe Acquisition",
    image: "/icons/logo.png",
    handler: async function (response: any) {
      try {
        const verifyRes = await api.post("/orders/verify-payment", response);

        if (verifyRes.data.status === "success") {
          navigate(`/profile/orders/${data.orderDocId}?justPlaced=true`, {
            replace: true,
            state: { justPlaced: true }
          });
        } else {
          navigate("/checkout?payment=failed", { replace: true });
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        navigate("/checkout?payment=failed", { replace: true });
      }
    },
    modal: {
      ondismiss: async function () {
        try {
          if (data.orderDocId) {
            await api.post("/orders/payment-failed", {
              orderDocId: data.orderDocId,
              reason: "Payment window was dismissed or closed by customer"
            });
          }
        } catch (e) {
          console.error("Failed to notify server of payment dismissal:", e);
        }
        navigate("/checkout?payment=failed", { replace: true });
      }
    },
    theme: {
      color: "#09090b"
    }
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", async function (resp: any) {
      console.error("Payment failed event:", resp);
      try {
        if (data.orderDocId) {
          await api.post("/orders/payment-failed", {
            orderDocId: data.orderDocId,
            reason: resp?.error?.description || "Payment failed or declined at gateway"
          });
        }
      } catch (e) {
        console.error("Failed to notify server of payment failure:", e);
      }
      navigate("/checkout?payment=failed", { replace: true });
    });
    rzp.open();
  } catch (err) {
    console.error("Error opening Razorpay modal:", err);
    try {
      if (data.orderDocId) {
        await api.post("/orders/payment-failed", {
          orderDocId: data.orderDocId,
          reason: "Error opening payment gateway modal"
        });
      }
    } catch (e) {
      console.error("Failed to notify server of gateway modal error:", e);
    }
    navigate("/checkout?payment=failed", { replace: true });
  }
};

export default openRazorpay;
