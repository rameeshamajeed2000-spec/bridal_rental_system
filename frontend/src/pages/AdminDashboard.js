import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { backgroundImages } from "../utils/uiTheme";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const cards = [
    { title: "Upload Product", text: "Add new items to store", route: "/upload" },
    { title: "Manage Products", text: "Edit or remove items", route: "/admin-products" },
    { title: "View Bookings", text: "Manage user reservations", route: "/admin-bookings" },
    { title: "Analytics", text: "View business performance", route: "/analytics" },
    { title: "Users", text: "Manage platform users", route: "/admin-users" },
    { title: "Artists", text: "Manage artist profiles", route: "/admin-artists" },
  ];

  return (
    <div className="flex min-h-screen bg-transparent flex-col md:flex-row">
      <Sidebar role="admin" />

      <div className="p-5 md:p-10 w-full relative">
        <div className="glass-panel overflow-hidden relative mb-8">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-center p-6 md:p-8">
            <div className="relative z-10">
              <p className="section-kicker mb-3">Admin Dashboard</p>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 neon-text tracking-wide">
                Run the platform from a more polished command center.
              </h1>
              <p className="text-slate-300 max-w-2xl leading-7">
                Products, bookings, and analytics now sit inside a clearer layout with stronger hierarchy and softer background imagery.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <span className="feature-chip">Catalog management</span>
                <span className="feature-chip">Bookings oversight</span>
                <span className="feature-chip">Performance tracking</span>
              </div>
            </div>
            <div
              className="min-h-[280px] rounded-[1.75rem] border border-white/10"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.42)), url("${backgroundImages.admin}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <p className="text-sm text-slate-300">Operations</p>
            <p className="text-3xl font-extrabold mt-2">Centralized</p>
            <p className="text-sm text-slate-400 mt-2">The refreshed layout groups core actions so admin work starts faster.</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-slate-300">Storefront</p>
            <p className="text-3xl font-extrabold mt-2">Visual</p>
            <p className="text-sm text-slate-400 mt-2">Background photography now supports the bridal context without overpowering the controls.</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-slate-300">Navigation</p>
            <p className="text-3xl font-extrabold mt-2">Simpler</p>
            <p className="text-sm text-slate-400 mt-2">The sidebar and cards are more consistent with the rest of the app.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div
              key={card.title}
              className="glass-card p-6 min-h-[220px] flex flex-col justify-end relative overflow-hidden"
              onClick={card.route ? () => navigate(card.route) : undefined}
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.82)), url("${
                  index % 2 === 0 ? backgroundImages.bridal : backgroundImages.admin
                }")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <p className="section-kicker mb-2">{card.route ? "Action" : "Overview"}</p>
              <h2 className="text-2xl font-bold text-white">{card.title}</h2>
              <p className="text-sm text-slate-200/80 mt-2">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
