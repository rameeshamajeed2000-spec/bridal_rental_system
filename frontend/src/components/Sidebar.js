import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const homeRoute = role === "admin" ? "/admin" : role === "user" ? "/user" : "/artist";
  const menuItems = {
    admin: [
      { label: "Overview", route: "/admin" },
      { label: "Inventory", route: "/admin-products" },
      { label: "Users", route: "/admin-users" },
      { label: "Artists", route: "/admin-artists" },
      { label: "Upload", route: "/upload" },
      { label: "Bookings", route: "/admin-bookings" },
      { label: "Analytics", route: "/analytics" },
    ],
    user: [
      { label: "Home", route: "/user" },
      { label: "Products", route: "/products" },
      { label: "Cart", route: "/cart" },
      { label: "Try-On", route: "/tryon", featured: true },
    ],
    artist: [
      { label: "Overview", route: "/artist" },
      { label: "Profile", route: "/artist-profile" },
      { label: "Upload Work", route: "/upload-work" },
      { label: "Bookings", route: "/artist-bookings" },
    ],
  };

  const items =
    role === "admin" ? menuItems.admin : role === "user" ? menuItems.user : menuItems.artist;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="w-full md:w-72 md:min-h-screen glass-panel rounded-none md:rounded-r-[2rem] border-t-0 border-b-0 border-l-0 text-white p-6 flex flex-col justify-between relative z-20 shadow-2xl">
      <div>
        <div className="mb-8">
          <p className="section-kicker mb-3">Bridal Bliss</p>
          <h2 className="text-3xl font-extrabold neon-text cursor-pointer" onClick={() => navigate(homeRoute)}>
            Styled for every celebration
          </h2>
          <p className="text-sm text-slate-300/80 mt-3">
            {role === "admin" && "Track products, bookings, and platform activity from one place."}
            {role === "user" && "Browse bridal essentials, save favorites, and explore virtual try-on."}
            {(role === "mehandi" || role === "makeup") && "Present your work beautifully and stay on top of client bookings."}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={`w-full text-left px-4 py-3 rounded-2xl transition-all font-medium border ${
                item.featured
                  ? "bg-rose-400/12 text-rose-200 border-rose-300/25 hover:bg-rose-400/18"
                  : "bg-white/4 text-slate-200 border-white/8 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="glass-panel p-4 mb-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400 mb-2">Workspace</p>
          <p className="text-sm text-slate-200">A calmer, image-led interface for your bridal workflow.</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full glass-panel hover:bg-white/10 text-rose-200 hover:text-white font-bold py-3 mt-2 transition-all"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
