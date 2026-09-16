import React, { useState } from "react";
import axios from "axios";
import { apiUrl, getApiError } from "../utils/api";

export default function ProductUpload() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    "Dress", "Jewellery", "Footwear", "Traditional", "Western", 
    "Party", "Mehandi", "Engagement", "Reception", "Sangeet"
  ];

  const handleCategoryChange = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleUpload = async () => {
    if (!name || !price || !image || selectedCategories.length === 0) {
      alert("Please fill all fields and select at least one category");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("category", selectedCategories.join(","));
    // For style column compatibility, pick the first style-like category or default
    const styleVal = selectedCategories.find(c => ["Traditional", "Western"].includes(c)) || "Traditional";
    formData.append("style", styleVal);
    formData.append("image", image);

    setLoading(true);
    try {
      await axios.post(apiUrl("/upload_product"), formData);
      alert("Product Uploaded!");
      setName("");
      setPrice("");
      setSelectedCategories([]);
      setImage(null);
    } catch (err) {
      alert(getApiError(err, "Product upload failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 min-h-screen bg-transparent relative z-10 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold mb-8 neon-text tracking-wide text-center">📤 Upload Product</h1>
        
        <div className="glass-panel p-8 md:p-10">
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#d4b3ff] mb-2">Product Name</label>
            <input
              type="text"
              placeholder="e.g. Red Bridal Lehenga"
              value={name}
              className="w-full p-4 rounded-xl bg-white/5 border border-[#9b59f4]/30 text-[#f0e6ff] placeholder-white/20 focus:outline-none focus:border-[#9b59f4] focus:ring-1 focus:ring-[#9b59f4] transition"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#d4b3ff] mb-2">Price (₹)</label>
            <input
              type="number"
              placeholder="e.g. 15000"
              value={price}
              className="w-full p-4 rounded-xl bg-white/5 border border-[#9b59f4]/30 text-[#f0e6ff] placeholder-white/20 focus:outline-none focus:border-[#9b59f4] focus:ring-1 focus:ring-[#9b59f4] transition"
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#d4b3ff] mb-4">Select Categories</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <label key={cat} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  selectedCategories.includes(cat) 
                  ? "bg-[#9b59f4]/20 border-[#9b59f4] text-white" 
                  : "bg-white/5 border-white/10 text-[#a89bc0] hover:border-[#9b59f4]/50"
                }`}>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryChange(cat)}
                  />
                  <span className="text-sm font-medium">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-[#d4b3ff] mb-2">Product Image</label>
            <div className="relative flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-[#9b59f4]/40 border-dashed rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-[#9b59f4] transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {image ? (
                    <p className="text-[#d4b3ff] font-medium text-lg">📸 {image.name}</p>
                  ) : (
                    <>
                      <span className="text-4xl mb-3">📁</span>
                      <p className="mb-2 text-sm text-[#a89bc0]"><span className="font-semibold text-[#d4b3ff]">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-[#a89bc0]/70">PNG, JPG or JPEG (MAX. 5MB)</p>
                    </>
                  )}
                </div>
                <input 
                  id="dropzone-file" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full primary-btn py-4 text-lg mt-2 disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload Product to Store"}
          </button>
          
        </div>
      </div>
    </div>
  );
}
