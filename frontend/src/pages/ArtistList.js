import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { apiUrl, getApiError, getStoredUser, imageUrl, loadRazorpayScript } from "../utils/api";

export default function ArtistList() {
  const [artists, setArtists] = useState([]);
  const [busyArtistId, setBusyArtistId] = useState(null);
  const location = useLocation();
  const category = new URLSearchParams(location.search).get("category") || "mehandi";

  const fetchArtists = useCallback(async () => {
    try {
      const res = await axios.get(apiUrl(`/artists/${category}`));
      setArtists(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      alert(getApiError(err, "Could not load artists."));
    }
  }, [category]);

  useEffect(() => {
    fetchArtists();
    loadRazorpayScript();
  }, [fetchArtists]);

  const bookArtist = async (artist) => {
    const date = prompt("Enter booking date (YYYY-MM-DD):");
    const time = prompt("Enter time slot (for example: Morning or Evening):");

    if (!date || !time) return;

    setBusyArtistId(artist.id);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        alert("Payment service could not load. Check your internet connection and try again.");
        return;
      }

      const availabilityRes = await axios.post(apiUrl("/check_availability"), {
        item_id: artist.id,
        type: category,
        date,
        time_slot: time,
      });

      if (!availabilityRes.data.available) {
        alert("This artist is already booked for that date and time.");
        return;
      }

      const orderRes = await axios.post(apiUrl("/create_order"), { amount: 500 });
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
        description: `Booking for ${artist.name}`,
        order_id: orderRes.data.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(apiUrl("/verify_payment"), {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email: user.email,
              item_id: artist.id,
              type: category,
              date,
              time_slot: time,
              amount: "500",
            });

            alert(verifyRes.data.success ? "Payment Successful! Artist Booking Confirmed." : (verifyRes.data.message || "Payment Verification Failed."));
          } catch (err) {
            alert(getApiError(err, "Payment verification failed."));
          }
        },
        prefill: {
          name: user.name || "User",
          email: user.email,
        },
        theme: { color: "#b6874d" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      alert(getApiError(err, "Something went wrong with the payment process."));
    } finally {
      setBusyArtistId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-transparent flex-col md:flex-row">
      <Sidebar role="user" />

      <div className="p-5 md:p-10 w-full relative z-10">
        <h1 className="text-4xl font-extrabold mb-8 neon-text tracking-wide uppercase">
          {category} Artists
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((a) => (
            <div key={a.id} className="glass-card p-5 flex flex-col h-full">
              <div className="h-56 w-full flex items-center justify-center bg-white/5 rounded-xl border border-white/10 mb-4 overflow-hidden relative group">
                <img src={imageUrl(a.image)} alt={a.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-bold text-xl text-[#e2d4ff]">{a.name}</h2>
                  <span className="text-[10px] bg-[#9b59f4]/20 text-[#d4b3ff] px-2 py-1 rounded-md border border-[#9b59f4]/30 uppercase font-bold">
                    {a.category}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-[#a89bc0] text-sm">{a.location}</p>
                  <p className="text-[#a89bc0] text-sm">{a.experience} Years Experience</p>
                  <p className="text-[#a89bc0] text-sm">{a.phone}</p>
                </div>
                <p className="text-pink-400 font-bold mb-4 text-lg">Booking Fee: Rs. 500</p>
              </div>
              <button
                onClick={() => bookArtist(a)}
                disabled={busyArtistId === a.id}
                className="w-full primary-btn py-3 text-sm disabled:opacity-60"
              >
                {busyArtistId === a.id ? "Please wait" : "Book Artist"}
              </button>
            </div>
          ))}
        </div>

        {artists.length === 0 && (
          <div className="glass-panel p-10 text-center text-[#a89bc0]">
            <p className="text-xl">No artists found in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
