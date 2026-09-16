import React, { useState } from "react";
import axios from "axios";
import { apiUrl, getApiError } from "../utils/api";

export default function UploadWork() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!name || !price || !image) {
      alert("Please fill all fields");
      return;
    }

    const data = new FormData();
    data.append("name", name);
    data.append("price", price);
    data.append("image", image);

    setLoading(true);
    try {
      await axios.post(apiUrl("/upload_work"), data);
      alert("Work uploaded");
      setName("");
      setPrice("");
      setImage(null);
    } catch (err) {
      alert(getApiError(err, "Work upload failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 min-h-screen bg-transparent relative z-10 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold mb-8 neon-text tracking-wide text-center">Upload Work</h1>

        <div className="glass-panel p-8 md:p-10">
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#d4b3ff] mb-2">Design Name</label>
            <input
              placeholder="e.g. Traditional Mehandi"
              value={name}
              className="w-full p-4 rounded-xl bg-white/5 border border-[#9b59f4]/30 text-[#f0e6ff] placeholder-white/20 focus:outline-none focus:border-[#9b59f4] focus:ring-1 focus:ring-[#9b59f4] transition"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#d4b3ff] mb-2">Price</label>
            <input
              placeholder="e.g. 5000"
              type="number"
              value={price}
              className="w-full p-4 rounded-xl bg-white/5 border border-[#9b59f4]/30 text-[#f0e6ff] placeholder-white/20 focus:outline-none focus:border-[#9b59f4] focus:ring-1 focus:ring-[#9b59f4] transition"
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-[#d4b3ff] mb-2">Portfolio Image</label>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-[#9b59f4]/40 border-dashed rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-[#9b59f4] transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <p className="text-sm text-[#a89bc0]">
                  <span className="font-semibold text-[#d4b3ff]">{image ? image.name : "Upload Design Photo"}</span>
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0] || null)}
              />
            </label>
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full primary-btn py-4 text-lg disabled:opacity-60"
          >
            {loading ? "Publishing..." : "Publish Work"}
          </button>
        </div>
      </div>
    </div>
  );
}
