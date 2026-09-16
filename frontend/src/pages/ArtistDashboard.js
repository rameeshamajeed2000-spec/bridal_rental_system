import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { backgroundImages } from "../utils/uiTheme";

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role || "mehandi"; // Default to mehandi for safety
  
  const bgImage = role === "mehandi" ? backgroundImages.mehandi_artist : backgroundImages.makeup_artist;

  const cards = [
    { title: "Profile", text: "Add your personal details", route: "/artist-profile" },
    { title: "Upload Work", text: "Upload your designs", route: "/upload-work" },
    { title: "Bookings", text: "View your bookings", route: "/artist-bookings" },
  ];

  return (
    <div className="flex min-h-screen bg-transparent flex-col md:flex-row">
      <Sidebar role={role} />

      <div className="p-5 md:p-10 w-full relative">
        <div className="glass-panel overflow-hidden relative mb-8">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-center p-6 md:p-8">
            <div className="relative z-10">
              <p className="section-kicker mb-3">{role === "mehandi" ? "Mehandi" : "Makeup"} Artist Dashboard</p>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 neon-text tracking-wide">
                Present your craft with more confidence and atmosphere.
              </h1>
              <p className="text-slate-300 max-w-2xl leading-7">
                Highlight your portfolio, keep bookings visible, and give your workspace a premium studio feel.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <span className="feature-chip">Portfolio led</span>
                <span className="feature-chip">Booking friendly</span>
                <span className="feature-chip">Visual storytelling</span>
              </div>
            </div>
            <div
              className="min-h-[280px] rounded-[1.75rem] border border-white/10"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.42)), url("${bgImage}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <p className="text-sm text-slate-300">Profile Quality</p>
            <p className="text-3xl font-extrabold mt-2">High</p>
            <p className="text-sm text-slate-400 mt-2">A cleaner dashboard now puts your identity and services front and center.</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-slate-300">Portfolio Flow</p>
            <p className="text-3xl font-extrabold mt-2">Fast</p>
            <p className="text-sm text-slate-400 mt-2">Move from editing profile details to uploading work with less visual friction.</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-slate-300">Bookings View</p>
            <p className="text-3xl font-extrabold mt-2">Ready</p>
            <p className="text-sm text-slate-400 mt-2">Keep client requests easier to spot and manage from the same workspace.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={() => navigate(card.route)}
              className="glass-card p-6 min-h-[220px] flex flex-col justify-end relative overflow-hidden"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.82)), url("${bgImage}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <p className="section-kicker mb-2">Artist Tools</p>
              <h2 className="text-2xl font-bold text-white">{card.title}</h2>
              <p className="text-slate-200/80 text-sm mt-2">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
