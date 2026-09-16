import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { backgroundImages } from "../utils/uiTheme";
import { apiUrl, getApiError, imageUrl } from "../utils/api";

export default function AdminArtists() {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const res = await axios.get(apiUrl("/all_artists"));
      setArtists(res.data);
    } catch (err) {
      alert(getApiError(err, "Could not load artists."));
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.post(apiUrl(`/toggle_artist_status/${id}`));
      fetchArtists();
    } catch (err) {
      alert(getApiError(err, "Could not update artist status."));
    }
  };

  const deleteArtist = async (id) => {
    if (window.confirm("Are you sure you want to delete this artist?")) {
      try {
        await axios.delete(apiUrl(`/delete_artist/${id}`));
        fetchArtists();
      } catch (err) {
        alert(getApiError(err, "Could not delete artist."));
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-transparent flex-col md:flex-row">
      <Sidebar role="admin" />

      <div className="p-5 md:p-10 w-full relative z-10">
        <h1 className="text-4xl font-extrabold mb-8 neon-text tracking-wide uppercase">
          🎨 Registered Artists
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((a) => (
            <div key={a.id} className="glass-card p-5 flex flex-col relative overflow-hidden group">
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700"
                style={{ backgroundImage: `url("${a.category === 'mehandi' ? backgroundImages.mehandi_artist : backgroundImages.makeup_artist}")`, backgroundSize: "cover", backgroundPosition: "center" }}
              ></div>
              
              <div className="relative z-10 flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#9b59f4]/40 shrink-0 shadow-lg">
                  <img
                    src={imageUrl(a.image)}
                    alt={a.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/150" }}
                  />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-[#f0e6ff]">{a.name}</h2>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className={`text-[9px] px-2 py-0.5 rounded-md border font-bold uppercase tracking-wider ${
                      a.category === 'mehandi' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                    }`}>
                      {a.category} Artist
                    </span>
                    {a.status === 'Deactivated' && (
                      <span className="text-[9px] px-2 py-0.5 rounded-md border font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border-rose-500/30">
                        Deactivated
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative z-10 space-y-2 text-sm text-slate-300 mb-4 bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="flex justify-between">
                  <span className="text-white/40">Phone:</span>
                  <span className="font-medium">{a.phone}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-white/40">Exp:</span>
                  <span className="font-medium">{a.experience} Years</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-white/40">Location:</span>
                  <span className="font-medium">{a.location}</span>
                </p>
              </div>
              
              <div className="relative z-10 mt-auto flex gap-2">
                <button className="flex-grow glass-panel hover:bg-white/10 text-xs py-2 text-[#d4b3ff] font-bold transition-all">
                  Contact
                </button>
                <button 
                  onClick={() => toggleStatus(a.id)}
                  className={`flex-grow glass-panel hover:bg-white/10 text-xs py-2 font-bold transition-all ${
                    a.status === 'Deactivated' ? 'text-green-300' : 'text-rose-300'
                  }`}
                >
                  {a.status === 'Deactivated' ? 'Activate' : 'Deactivate'}
                </button>
                <button 
                  onClick={() => deleteArtist(a.id)}
                  className="flex-grow glass-panel hover:bg-red-500/20 text-xs py-2 text-rose-400 font-bold transition-all border border-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {artists.length === 0 && (
          <div className="glass-panel p-20 text-center text-[#a89bc0]">
            <p className="text-xl">No artists registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
