import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { apiUrl, getApiError, imageUrl } from "../utils/api";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Form state for editing
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [image, setImage] = useState(null);

  const categories = [
    "Dress", "Jewellery", "Footwear", "Traditional", "Western", 
    "Party", "Mehandi", "Engagement", "Reception", "Sangeet"
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(apiUrl("/products"));
      setProducts(res.data);
    } catch (err) {
      alert(getApiError(err, "Could not load products."));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(apiUrl(`/delete_product/${id}`));
        fetchProducts();
        alert("Product deleted!");
      } catch (err) {
        alert(getApiError(err, "Could not delete product."));
      }
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price);
    setSelectedCategories(product.category ? product.category.split(",") : []);
    setShowEditModal(true);
  };

  const handleCategoryChange = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("category", selectedCategories.join(","));
    const styleVal = selectedCategories.find(c => ["Traditional", "Western"].includes(c)) || "Traditional";
    formData.append("style", styleVal);
    if (image) formData.append("image", image);

    try {
      await axios.post(apiUrl(`/update_product/${editingProduct.id}`), formData);
      alert("Product updated successfully!");
      setShowEditModal(false);
      fetchProducts();
    } catch (err) {
      alert(getApiError(err, "Could not update product."));
    }
  };

  return (
    <div className="flex min-h-screen bg-transparent flex-col md:flex-row">
      <Sidebar role="admin" />

      <div className="p-5 md:p-10 w-full relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="section-kicker">Inventory</p>
            <h1 className="text-4xl font-extrabold neon-text tracking-wide">Manage Products</h1>
          </div>
          <button 
            onClick={() => window.location.href = "/upload"}
            className="primary-btn flex items-center gap-2"
          >
            <span>+</span> Add New Product
          </button>
        </div>

        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 text-sm font-semibold text-[#e8c892] uppercase tracking-wider">Product</th>
                  <th className="p-4 text-sm font-semibold text-[#e8c892] uppercase tracking-wider">Price</th>
                  <th className="p-4 text-sm font-semibold text-[#e8c892] uppercase tracking-wider">Categories</th>
                  <th className="p-4 text-sm font-semibold text-[#e8c892] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                          <img 
                            src={imageUrl(p.image)} 
                            alt={p.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-pink-400 font-bold">₹ {p.price}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {p.category && p.category.split(",").map((cat, i) => (
                          <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#b6874d]/10 text-[#e8c892] rounded-full border border-[#b6874d]/20">
                            {cat.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(p)}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition text-xs font-bold"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition text-xs font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 border-[#e8c892]/30 shadow-[0_0_50px_rgba(182,135,77,0.2)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Product</h2>
              <button onClick={() => setShowEditModal(false)} className="text-white/60 hover:text-white text-2xl">&times;</button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#d4b3ff] mb-2">Product Name</label>
                <input
                  type="text"
                  value={name}
                  className="input-shell"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#d4b3ff] mb-2">Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  className="input-shell"
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#d4b3ff] mb-4">Categories</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <label key={cat} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      selectedCategories.includes(cat) 
                      ? "bg-[#b6874d]/20 border-[#b6874d] text-white" 
                      : "bg-white/5 border-white/10 text-white/60 hover:border-[#b6874d]/50"
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
                <label className="block text-sm font-medium text-[#d4b3ff] mb-2">Product Image (Optional)</label>
                <input 
                  type="file" 
                  className="input-shell" 
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
                <p className="text-xs text-white/40 mt-2">Leave empty to keep existing image</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 primary-btn py-4"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
