import { api } from "../lib/api.js";

export async function startPayment({
  studentId,
  courseId,
  serviceId,
  bookingDetails,
  customer,
  amount,
  couponCode,
  description = "Course purchase",
  onSuccess,
  onClose,
  onError,
}) {
  const { data } = await api("/payments/order", {
    method: "POST",
    body: JSON.stringify({ studentId, courseId, serviceId, bookingDetails, amount, couponCode }),
  });

  if (data?.isFree) {
    onSuccess?.();
    return;
  }

  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!key) throw new Error("Payment key is missing. Set VITE_RAZORPAY_KEY_ID and restart the dev server.");
  if (!window.Razorpay) throw new Error("Payment gateway failed to load. Refresh the page and try again.");

  const options = {
    key,
    amount: data.amount,
    currency: data.currency,
    name: "Vanakkam Soccer",
    description,
    order_id: data.razorpayOrderId,
    prefill: customer
      ? {
          name: customer.name || "",
          email: customer.email || "",
          contact: customer.phone || "",
        }
      : undefined,
    handler: async (response) => {
      try {
        await api("/payments/verify", {
          method: "POST",
          body: JSON.stringify({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: data.orderId,
          }),
        });
        onSuccess?.();
      } catch (err) {
        console.error("Payment verification failed:", err);
        onError?.(
          `Payment received but verification failed (ref: ${response.razorpay_payment_id}). ` +
            (err?.message || "Please contact support.")
        );
      }
    },
    method: { upi: true, card: true, netbanking: true, wallet: true },
    theme: { color: "#ffd400" },
    modal: { ondismiss: () => onClose?.() },
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (resp) => {
    console.error("Razorpay payment failed:", resp?.error);
    onError?.(resp?.error?.description || "Payment failed. Please try again.");
  });
  rzp.open();
}