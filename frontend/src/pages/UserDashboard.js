import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { backgroundImages, userDashboardCardImages } from "../utils/uiTheme";

export default function UserDashboard() {
  const navigate = useNavigate();
  const sections = [
    {
      title: "Dresses",
      text: "Explore bridal dresses",
      route: "/products?category=dress",
      image: userDashboardCardImages.dresses,
    },
    {
      title: "Jewellery",
      text: "Find matching jewellery",
      route: "/products?category=jewellery",
      image: userDashboardCardImages.jewellery,
    },
    {
      title: "Makeup",
      text: "Book makeup artists",
      route: "/artists-list?category=makeup",
      image: userDashboardCardImages.makeup,
    },
    {
      title: "Mehandi",
      text: "Browse mehandi artists",
      route: "/artists-list?category=mehandi",
      image: userDashboardCardImages.mehandi,
    },
    {
      title: "Footwear",
      text: "Check matching footwear",
      route: "/products?category=footwear",
      image: userDashboardCardImages.footwear,
    },
    {
      title: "Cart",
      text: "View selected items",
      route: "/cart",
      image: userDashboardCardImages.cart,
    },
    {
      title: "Virtual Try-On",
      text: "Try outfits virtually with AI",
      route: "/tryon",
      featured: true,
      image: backgroundImages.beauty,
    },
  ];

  return (
    <div className="flex min-h-screen bg-transparent flex-col md:flex-row">
      <Sidebar role="user" />

      <div className="p-5 md:p-10 w-full relative">
        <div className="glass-panel overflow-hidden relative mb-8">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-center p-6 md:p-8">
            <div className="relative z-10">
              <p className="section-kicker mb-3">User Dashboard</p>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 neon-text tracking-wide">
                Design your full bridal look in one curated flow.
              </h1>
              <p className="text-slate-300 max-w-2xl leading-7">
                Shop essentials, explore artists, and move from inspiration to booking with a cleaner visual rhythm.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <span className="feature-chip">Bridal fashion</span>
                <span className="feature-chip">Artist discovery</span>
                <span className="feature-chip">AI try-on</span>
              </div>
            </div>
            <div
              className="min-h-[280px] rounded-[1.75rem] border border-white/10"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.42)), url("${backgroundImages.bridal}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <p className="text-sm text-slate-300">Collections</p>
            <p className="text-3xl font-extrabold mt-2">3+</p>
            <p className="text-sm text-slate-400 mt-2">Dress, jewellery, and footwear categories ready to browse.</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-slate-300">Services</p>
            <p className="text-3xl font-extrabold mt-2">2</p>
            <p className="text-sm text-slate-400 mt-2">Makeup and mehandi artist experiences are highlighted up front.</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-slate-300">Signature Tool</p>
            <p className="text-3xl font-extrabold mt-2">AI</p>
            <p className="text-sm text-slate-400 mt-2">Jump into try-on quickly from the dashboard hero or the feature grid.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section) => (
            <div
              key={section.title}
              onClick={section.route ? () => navigate(section.route) : section.action}
              className={`glass-card p-6 min-h-[180px] flex flex-col justify-end relative overflow-hidden ${
                section.featured ? "border-rose-300/25" : ""
              }`}
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.84)), url("${section.image}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <p className="section-kicker mb-2">{section.featured ? "Featured" : "Explore"}</p>
              <h2 className={`text-2xl font-bold ${section.featured ? "text-rose-200" : "text-white"}`}>
                {section.title}
              </h2>
              <p className="text-sm text-slate-200/80 mt-2">{section.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
