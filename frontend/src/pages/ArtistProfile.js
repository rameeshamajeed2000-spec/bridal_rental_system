import React, { useState } from "react";
import axios from "axios";
import { apiUrl, getApiError, getStoredUser } from "../utils/api";

export default function ArtistProfile() {
  const user = getStoredUser({});
  const [form, setForm] = useState({
    name: "",
    phone: "",
    category: user.role || "mehandi",
    experience: "",
    location: "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.experience || !form.location || !image) {
      alert("Please fill all fields and upload an image");
      return;
    }

    const data = new FormData();
    data.append("name", form.name);
    data.append("phone", form.phone);
    data.append("category", form.category);
    data.append("experience", form.experience);
    data.append("location", form.location);
    data.append("image", image);

    setLoading(true);
    try {
      await axios.post(apiUrl("/artist_profile"), data);
      alert("Profile saved");
    } catch (err) {
      alert(getApiError(err, "Profile save failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 min-h-screen bg-transparent relative z-10 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold mb-8 neon-text tracking-wide text-center">Artist Profile</h1>

        <div className="glass-panel p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#d4b3ff] mb-2">Full Name</label>
              <input
                placeholder="e.g. Maya Beauty"
                className="w-full p-4 rounded-xl bg-white/5 border border-[#9b59f4]/30 text-[#f0e6ff] placeholder-white/20 focus:outline-none focus:border-[#9b59f4] focus:ring-1 focus:ring-[#9b59f4] transition"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#d4b3ff] mb-2">Phone</label>
              <input
                placeholder="e.g. +91 9876543210"
                className="w-full p-4 rounded-xl bg-white/5 border border-[#9b59f4]/30 text-[#f0e6ff] placeholder-white/20 focus:outline-none focus:border-[#9b59f4] focus:ring-1 focus:ring-[#9b59f4] transition"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#d4b3ff] mb-2">Artist Category</label>
              <select
                className="w-full p-4 rounded-xl bg-white/5 border border-[#9b59f4]/30 text-[#f0e6ff] focus:outline-none focus:border-[#9b59f4] focus:ring-1 focus:ring-[#9b59f4] transition"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="mehandi" className="text-black">Mehandi Artist</option>
                <option value="makeup" className="text-black">Makeup Artist</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#d4b3ff] mb-2">Experience (Years)</label>
              <input
                placeholder="e.g. 5"
                type="number"
                className="w-full p-4 rounded-xl bg-white/5 border border-[#9b59f4]/30 text-[#f0e6ff] placeholder-white/20 focus:outline-none focus:border-[#9b59f4] focus:ring-1 focus:ring-[#9b59f4] transition"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#d4b3ff] mb-2">Location</label>
              <input
                placeholder="e.g. Mumbai, India"
                className="w-full p-4 rounded-xl bg-white/5 border border-[#9b59f4]/30 text-[#f0e6ff] placeholder-white/20 focus:outline-none focus:border-[#9b59f4] focus:ring-1 focus:ring-[#9b59f4] transition"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-[#d4b3ff] mb-2">Profile Picture</label>
            <div className="relative flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#9b59f4]/40 border-dashed rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-[#9b59f4] transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {image ? (
                    <p className="text-[#d4b3ff] font-medium text-lg">{image.name}</p>
                  ) : (
                    <p className="text-sm text-[#a89bc0]">
                      <span className="font-semibold text-[#d4b3ff]">Browse photos</span>
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0] || null)}
                />
              </label>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full primary-btn py-4 text-lg disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
