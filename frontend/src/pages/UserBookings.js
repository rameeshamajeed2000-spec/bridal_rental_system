import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { backgroundImages } from "../utils/uiTheme";
import { apiUrl, getApiError, getStoredUser } from "../utils/api";

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [user] = useState(() => getStoredUser({ email: "user@gmail.com", role: "user" }));

  const fetchBookings = useCallback(async () => {
    try {
      const res = await axios.get(apiUrl(`/my_bookings/${encodeURIComponent(user.email)}`));
      setBookings(res.data);
    } catch (err) {
      alert(getApiError(err, "Could not load your bookings."));
    }
  }, [user.email]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="flex min-h-screen bg-transparent flex-col md:flex-row">
      <Sidebar role="user" />

      <div className="p-5 md:p-10 w-full relative z-10">
        <h1 className="text-4xl font-extrabold mb-8 neon-text tracking-wide uppercase">
          📋 My Bookings
        </h1>

        {bookings.length === 0 ? (
          <div className="glass-panel p-12 text-center text-[#a89bc0]">
            <div className="text-5xl mb-4">🗓️</div>
            <p className="text-xl">You have no upcoming bookings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((b) => (
              <div key={b.id} className="glass-card p-6 flex flex-col relative overflow-hidden group">
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700"
                  style={{ backgroundImage: `url("${backgroundImages.bridal}")`, backgroundSize: "cover", backgroundPosition: "center" }}
                ></div>
                <div className="relative z-10 flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[#a89bc0] text-[10px] uppercase font-bold tracking-widest mb-1">Service Type</p>
                    <p className="text-lg text-[#f0e6ff] font-semibold uppercase">{b.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#a89bc0] text-[10px] uppercase font-bold tracking-widest mb-1">Price</p>
                    <p className="text-lg text-pink-400 font-bold">₹ {b.amount}</p>
                  </div>
                </div>

                <div className="relative z-10 bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center mb-4">
                  <p className="text-[#f0e6ff] font-medium flex items-center gap-2"><span>📅</span> {b.date}</p>
                  <div className="w-[1px] h-4 bg-white/20"></div>
                  <p className="text-[#f0e6ff] font-medium flex items-center gap-2"><span>⏰</span> {b.time}</p>
                </div>

                <div className="relative z-10 flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                  <span className="text-[10px] text-[#a89bc0]">Booking ID: #{b.id}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    b.status === "Paid" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  }`}>
                    {b.status || "Paid"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
