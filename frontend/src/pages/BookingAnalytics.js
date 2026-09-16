import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { apiUrl, getApiError } from "../utils/api";

export default function BookingAnalytics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(apiUrl("/all_bookings"));

      const grouped = {};
      res.data.forEach((b) => {
        if (!grouped[b.date]) grouped[b.date] = 0;
        grouped[b.date]++;
      });

      const chartData = Object.keys(grouped).map((date) => ({
        date,
        bookings: grouped[date],
      }));

      setData(chartData);
    } catch (err) {
      alert(getApiError(err, "Could not load analytics."));
    }
  };

  return (
    <div className="p-10 min-h-screen bg-transparent relative z-10 w-full max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-8 neon-text tracking-wide">
        Booking Analytics
      </h1>

      <div className="glass-panel p-8 w-full">
        <h2 className="text-2xl font-bold mb-6 text-[#e2d4ff]">Reservations Over Time</h2>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(155, 89, 244, 0.2)" vertical={false} />
              <XAxis dataKey="date" stroke="#a89bc0" tick={{fill: '#a89bc0'}} axisLine={{ stroke: 'rgba(155, 89, 244, 0.3)' }} />
              <YAxis stroke="#a89bc0" tick={{fill: '#a89bc0'}} axisLine={{ stroke: 'rgba(155, 89, 244, 0.3)' }} />
              <Tooltip 
                cursor={{fill: 'rgba(155, 89, 244, 0.1)'}} 
                contentStyle={{backgroundColor: 'rgba(10, 10, 20, 0.9)', borderColor: 'rgba(155, 89, 244, 0.4)', borderRadius: '8px', color: '#fff'}}
              />
              <Bar dataKey="bookings" fill="#e91e8c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
