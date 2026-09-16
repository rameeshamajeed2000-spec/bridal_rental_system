export const API_BASE = "http://127.0.0.1:5000";

export function apiUrl(path) {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export function imageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return apiUrl(path.replace(/^\/+/, ""));
}

export function getStoredUser(fallback = {}) {
  try {
    return JSON.parse(localStorage.getItem("user")) || fallback;
  } catch {
    return fallback;
  }
}

export function getApiError(error, fallback = "Something went wrong. Please try again.") {
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;
}

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
