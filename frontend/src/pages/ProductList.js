import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { apiUrl, getApiError, getStoredUser, imageUrl, loadRazorpayScript } from "../utils/api";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [budget, setBudget] = useState("");
  const [bookingInputs, setBookingInputs] = useState({});
  const [busyProductId, setBusyProductId] = useState(null);

  const location = useLocation();
  const categoryFromURL = new URLSearchParams(location.search).get("category");

  useEffect(() => {
    fetchProducts();
    if (categoryFromURL) setFilter(categoryFromURL);
    loadRazorpayScript();
  }, [categoryFromURL]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(apiUrl("/products"));
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      alert(getApiError(err, "Could not load products."));
    }
  };

  const updateBookingInput = (productId, field, value) => {
    setBookingInputs((current) => ({
      ...current,
      [productId]: {
        ...(current[productId] || {}),
        [field]: value,
      },
    }));
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ ...product, ...(bookingInputs[product.id] || {}) });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart!");
  };

  const checkAvailability = async (product) => {
    const booking = bookingInputs[product.id] || {};
    if (!booking.selectedDate) {
      alert("Select a date first.");
      return false;
    }

    try {
      const res = await axios.post(apiUrl("/check_availability"), {
        item_id: product.id,
        type: "product",
        date: booking.selectedDate,
        time_slot: booking.timeSlot || "",
      });
      alert(res.data.available ? "Available" : (res.data.message || "Not Available"));
      return Boolean(res.data.available);
    } catch (err) {
      alert(getApiError(err, "Availability check failed."));
      return false;
    }
  };

  const bookItem = async (product) => {
    const booking = bookingInputs[product.id] || {};
    if (!booking.selectedDate) {
      alert("Select a date first.");
      return;
    }

    setBusyProductId(product.id);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        alert("Payment service could not load. Check your internet connection and try again.");
        return;
      }

      const availabilityRes = await axios.post(apiUrl("/check_availability"), {
        item_id: product.id,
        type: "product",
        date: booking.selectedDate,
        time_slot: booking.timeSlot || "",
      });

      if (!availabilityRes.data.available) {
        alert("Not Available. This product can be booked again only after 2 days from its booked date.");
        return;
      }

      const orderRes = await axios.post(apiUrl("/create_order"), {
        amount: product.price,
      });

      if (orderRes.data.error) {
        alert(`Payment Error: ${orderRes.data.error}`);
        return;
      }

      const user = getStoredUser({ email: "user@gmail.com" });
      const options = {
        key: "rzp_test_SisvfkFMGPZkFX",
        amount: orderRes.data.amount,
        currency: "INR",
        name: "Bridal Bliss",
        description: `Booking for ${product.name}`,
        order_id: orderRes.data.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(apiUrl("/verify_payment"), {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email: user.email,
              item_id: product.id,
              type: "product",
              date: booking.selectedDate,
              time_slot: booking.timeSlot || "",
              amount: product.price,
            });

            alert(verifyRes.data.success ? "Payment Successful! Booking Confirmed." : (verifyRes.data.message || "Payment Verification Failed."));
          } catch (err) {
            alert(getApiError(err, "Payment verification failed."));
          }
        },
        prefill: {
          name: user.name || "User",
          email: user.email,
          contact: "9999999999",
        },
        theme: { color: "#9b59f4" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      alert(getApiError(err, "Something went wrong with the payment process."));
    } finally {
      setBusyProductId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const productCats = p.category ? p.category.toLowerCase().split(",").map((cat) => cat.trim()) : [];
      const matchCategory = filter === "all" || productCats.includes(filter.toLowerCase());
      const matchStyle = styleFilter === "all" || productCats.includes(styleFilter.toLowerCase());
      const matchBudget = budget === "" || Number(p.price || 0) <= Number(budget);
      return matchCategory && matchStyle && matchBudget;
    });
  }, [products, filter, styleFilter, budget]);

  const categories = ["Dress", "Jewellery", "Footwear", "Party", "Mehandi", "Engagement", "Reception", "Sangeet"];
  const styles = ["Traditional", "Western"];

  return (
    <div className="p-10 min-h-screen bg-transparent relative z-10">
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 mb-8">
        <h1 className="text-4xl font-extrabold neon-text tracking-wide">Products Collection</h1>

        <div className="flex flex-wrap gap-4">
          <select className="p-3 rounded-lg bg-white/5 border border-[#9b59f4]/30 text-[#f0e6ff] focus:outline-none focus:border-[#9b59f4]" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all" className="text-black">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat.toLowerCase()} className="text-black">{cat}</option>
            ))}
          </select>

          <select className="p-3 rounded-lg bg-white/5 border border-[#9b59f4]/30 text-[#f0e6ff] focus:outline-none focus:border-[#9b59f4]" value={styleFilter} onChange={(e) => setStyleFilter(e.target.value)}>
            <option value="all" className="text-black">All Styles</option>
            {styles.map((style) => (
              <option key={style} value={style.toLowerCase()} className="text-black">{style}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Max Budget"
            className="p-3 rounded-lg bg-white/5 border border-[#9b59f4]/30 text-[#f0e6ff] placeholder-white/30 focus:outline-none focus:border-[#9b59f4]"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="glass-panel p-10 text-center text-[#a89bc0]">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((p) => (
            <div key={p.id} className="glass-card p-5 flex flex-col h-full">
              <div className="h-56 w-full flex items-center justify-center bg-white/5 rounded-xl border border-white/10 mb-4 overflow-hidden relative group">
                <img src={imageUrl(p.image)} alt={p.name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500" />
              </div>

              <div className="flex-grow">
                <div className="flex flex-wrap gap-1 mb-2">
                  {p.category && p.category.split(",").map((cat, i) => (
                    <span key={`${p.id}-${cat}-${i}`} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#9b59f4]/10 text-[#d4b3ff] rounded-full border border-[#9b59f4]/20">
                      {cat.trim()}
                    </span>
                  ))}
                </div>
                <h2 className="font-bold text-lg text-[#e2d4ff] leading-tight">{p.name}</h2>
                <p className="text-pink-400 font-bold mb-4">Rs. {p.price}</p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <input
                    type="date"
                    className="bg-white/5 border border-[#9b59f4]/30 text-[#f0e6ff] p-2 text-sm rounded-lg w-full focus:border-[#9b59f4] outline-none"
                    value={bookingInputs[p.id]?.selectedDate || ""}
                    onChange={(e) => updateBookingInput(p.id, "selectedDate", e.target.value)}
                  />

                  <select
                    className="bg-white/5 border border-[#9b59f4]/30 text-[#f0e6ff] p-2 text-sm rounded-lg w-full focus:border-[#9b59f4] outline-none"
                    value={bookingInputs[p.id]?.timeSlot || ""}
                    onChange={(e) => updateBookingInput(p.id, "timeSlot", e.target.value)}
                  >
                    <option value="" className="text-black">Time Slot</option>
                    <option value="morning" className="text-black">Morning</option>
                    <option value="afternoon" className="text-black">Afternoon</option>
                    <option value="evening" className="text-black">Evening</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <button onClick={() => addToCart(p)} className="w-full primary-btn py-2 text-sm">
                  Add to Cart
                </button>

                <div className="flex gap-2">
                  <button onClick={() => checkAvailability(p)} className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-2 py-2 text-xs rounded-lg transition">
                    Check Availability
                  </button>

                  <button
                    onClick={() => bookItem(p)}
                    disabled={busyProductId === p.id}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-2 py-2 text-xs font-bold rounded-lg shadow-lg transition disabled:opacity-60"
                  >
                    {busyProductId === p.id ? "Please wait" : "Book Now"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
