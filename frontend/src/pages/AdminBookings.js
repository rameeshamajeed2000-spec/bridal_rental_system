import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import Sidebar from "../components/Sidebar";
import { backgroundImages } from "../utils/uiTheme";
import { apiUrl, getApiError } from "../utils/api";
import "react-calendar/dist/Calendar.css";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(apiUrl("/all_bookings"));
      setBookings(res.data);
    } catch (err) {
      alert(getApiError(err, "Could not load bookings."));
    }
  };

  const formattedDate = selectedDate.toISOString().split("T")[0];

  const filteredBookings = bookings.filter(
    (b) => b.date === formattedDate
  );

  return (
    <div className="flex min-h-screen bg-transparent flex-col md:flex-row">
      <Sidebar role="admin" />

      <div className="p-5 md:p-10 w-full relative z-10">
        <h1 className="text-4xl font-extrabold mb-8 neon-text tracking-wide uppercase">
          🗓️ Booking Calendar
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
          {/* Calendar */}
          <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: `url("${backgroundImages.admin}")`, backgroundSize: "cover", backgroundPosition: "center" }}
            ></div>
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-4 text-[#e2d4ff] text-center">Select a Date</h2>
              <div className="bg-white p-4 rounded-xl text-black shadow-2xl">
                <Calendar onChange={setSelectedDate} value={selectedDate} />
              </div>
            </div>
          </div>

          {/* Booking List */}
          <div className="glass-panel p-8">
            <h2 className="text-2xl font-bold mb-6 text-pink-400">
              Bookings on {formattedDate}
            </h2>

            {filteredBookings.length === 0 ? (
              <div className="bg-white/5 border border-white/10 p-10 rounded-xl text-center text-[#a89bc0]">
                <span className="text-5xl mb-4 block">💨</span>
                <p className="text-lg italic">No bookings for this date</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBookings.map((b) => (
                  <div key={b.id} className="glass-card p-5 cursor-default bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                    <p className="text-sm text-[#a89bc0] uppercase font-bold tracking-widest mb-2">Details</p>
                    <p className="text-[#f0e6ff] mb-1">
                      <span className="text-white/40 mr-2 text-xs">User:</span> 
                      <span className="font-semibold">{b.email}</span>
                    </p>
                    <p className="text-[#f0e6ff] mb-1">
                      <span className="text-white/40 mr-2 text-xs">Item ID:</span> 
                      <span className="font-semibold text-pink-300">#{b.item_id}</span>
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="uppercase text-[10px] font-bold bg-[#9b59f4]/20 px-3 py-1 rounded-full text-[#d4b3ff] border border-[#9b59f4]/30">
                        {b.type}
                      </span>
                      <span className="text-xs font-bold text-green-400">
                        {b.status || "Paid"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
