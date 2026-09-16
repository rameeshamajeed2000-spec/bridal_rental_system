import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { backgroundImages } from "../utils/uiTheme";
import { apiUrl, getApiError, getStoredUser } from "../utils/api";

export default function ArtistBookings() {
  const [bookings, setBookings] = useState([]);
  const [user] = useState(() => getStoredUser({}));
  const role = user.role || "mehandi";
  const bgImage = role === "mehandi" ? backgroundImages.mehandi_artist : backgroundImages.makeup_artist;

  const fetchBookings = useCallback(async () => {
    try {
      const res = await axios.get(apiUrl(`/artist_bookings/${role}`));
      setBookings(res.data);
    } catch (err) {
      alert(getApiError(err, "Could not load artist bookings."));
    }
  }, [role]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="flex min-h-screen bg-transparent flex-col md:flex-row">
      <Sidebar role={role} />

      <div className="p-5 md:p-10 w-full relative z-10">
        <h1 className="text-4xl font-extrabold mb-8 neon-text tracking-wide uppercase">
          📋 {role} Client Bookings
        </h1>

        {bookings.length === 0 ? (
          <div className="glass-panel p-12 text-center text-[#a89bc0]">
            <div className="text-5xl mb-4">💤</div>
            <p className="text-xl">No bookings available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {bookings.map((b, i) => (
              <div key={i} className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ backgroundImage: `url("${bgImage}")`, backgroundSize: "cover", backgroundPosition: "center" }}
                ></div>
                <div className="relative z-10">
                  <p className="text-[#a89bc0] text-sm uppercase font-bold tracking-wider mb-1">Client Email</p>
                  <p className="text-xl text-[#f0e6ff] font-semibold">{b.email}</p>
                  <p className="text-sm text-pink-300 mt-1">Status: {b.status}</p>
                </div>
                <div className="relative z-10 mt-4 md:mt-0 flex flex-col items-end">
                  <div className="bg-white/10 px-4 py-2 rounded-lg flex items-center gap-4 border border-white/10">
                    <p className="text-pink-400 font-bold flex items-center gap-2"><span>📅</span> {b.date}</p>
                    <div className="w-[1px] h-6 bg-white/20"></div>
                    <p className="text-[#d4b3ff] font-bold flex items-center gap-2"><span>⏰</span> {b.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
