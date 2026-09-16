import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { apiUrl, getApiError, getStoredUser, imageUrl, loadRazorpayScript } from "../utils/api";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(data);
    loadRazorpayScript();
  }, []);

  const saveCart = (items) => {
    setCart(items);
    localStorage.setItem("cart", JSON.stringify(items));
  };

  const removeItem = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    saveCart(updated);
  };

  const clearCart = () => {
    localStorage.removeItem("cart");
    setCart([]);
  };

  const updateItem = (index, field, value) => {
    const updated = cart.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    ));
    saveCart(updated);
  };

  const total = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price || 0), 0), [cart]);

  const checkout = async () => {
    if (cart.length === 0) return;
    const missingDate = cart.some((item) => !item.selectedDate);
    if (missingDate) {
      alert("Please select a booking date for every item.");
      return;
    }

    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        alert("Payment service could not load. Check your internet connection and try again.");
        return;
      }

      for (const item of cart) {
        const availabilityRes = await axios.post(apiUrl("/check_availability"), {
          item_id: item.id,
          type: "product",
          date: item.selectedDate,
          time_slot: item.timeSlot || "",
        });
        if (!availabilityRes.data.available) {
          alert(`${item.name} is not available for the selected date.`);
          return;
        }
      }

      const orderRes = await axios.post(apiUrl("/create_order"), { amount: total });
      const user = getStoredUser({ email: "user@gmail.com" });
      const options = {
        key: "rzp_test_SisvfkFMGPZkFX",
        amount: orderRes.data.amount,
        currency: "INR",
        name: "Bridal Bliss",
        description: "Cart checkout",
        order_id: orderRes.data.id,
        handler: async function (response) {
          try {
            for (const item of cart) {
              const verifyRes = await axios.post(apiUrl("/verify_payment"), {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                email: user.email,
                item_id: item.id,
                type: "product",
                date: item.selectedDate,
                time_slot: item.timeSlot || "",
                amount: item.price,
              });

              if (!verifyRes.data.success) {
                alert(verifyRes.data.message || `Could not confirm ${item.name}.`);
                return;
              }
            }
            clearCart();
            alert("Payment successful. Bookings confirmed.");
          } catch (err) {
            alert(getApiError(err, "Payment verification failed."));
          }
        },
        prefill: {
          name: user.name || "User",
          email: user.email,
        },
        theme: { color: "#9b59f4" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      alert(getApiError(err, "Checkout failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 min-h-screen bg-transparent relative z-10 max-w-5xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-8 neon-text tracking-wide">Your Cart</h1>

      {cart.length === 0 && (
        <div className="glass-panel p-12 text-center mt-10">
          <h2 className="text-2xl font-bold text-[#e2d4ff]">Your cart is empty</h2>
          <p className="text-[#a89bc0] mt-2">Looks like you have not added anything to your cart yet.</p>
        </div>
      )}

      {cart.map((item, index) => (
        <div key={`${item.id}-${index}`} className="glass-card p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
              {item.image ? (
                <img src={imageUrl(item.image)} alt={item.name} className="max-w-full max-h-full object-cover" />
              ) : (
                <span className="text-3xl">Item</span>
              )}
            </div>

            <div>
              <h2 className="font-bold text-xl text-[#e2d4ff] mb-1">{item.name}</h2>
              <p className="text-pink-400 font-bold text-lg mb-3">Rs. {item.price}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="date"
                  value={item.selectedDate || ""}
                  onChange={(e) => updateItem(index, "selectedDate", e.target.value)}
                  className="bg-white/5 border border-[#9b59f4]/30 text-[#f0e6ff] p-2 text-sm rounded-lg"
                />
                <select
                  value={item.timeSlot || ""}
                  onChange={(e) => updateItem(index, "timeSlot", e.target.value)}
                  className="bg-white/5 border border-[#9b59f4]/30 text-[#f0e6ff] p-2 text-sm rounded-lg"
                >
                  <option value="" className="text-black">Time Slot</option>
                  <option value="morning" className="text-black">Morning</option>
                  <option value="afternoon" className="text-black">Afternoon</option>
                  <option value="evening" className="text-black">Evening</option>
                </select>
              </div>
            </div>
          </div>

          <button onClick={() => removeItem(index)} className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 hover:border-red-500 px-5 py-2.5 rounded-xl transition-all font-semibold">
            Remove
          </button>
        </div>
      ))}

      {cart.length > 0 && (
        <div className="mt-10 p-8 glass-panel border-[#e91e8c]/30 flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-white/5 to-[#e91e8c]/10">
          <div className="mb-6 md:mb-0">
            <p className="text-[#a89bc0] mb-1">Subtotal</p>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-200">
              Rs. {total}
            </h2>
          </div>

          <div className="flex gap-4">
            <button onClick={clearCart} className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-3 rounded-xl transition-all font-semibold">
              Clear Cart
            </button>
            <button onClick={checkout} disabled={loading} className="primary-btn px-10 py-3 text-lg font-bold disabled:opacity-60">
              {loading ? "Please wait" : "Checkout Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
