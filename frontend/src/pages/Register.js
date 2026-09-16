import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl, getApiError } from "../utils/api";
import { backgroundImages } from "../utils/uiTheme";

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(apiUrl("/register"), {
        name,
        email,
        password,
        role,
      });

      alert(res.data.message);
      navigate("/");
    } catch (err) {
      alert(getApiError(err, "Error registering user"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-transparent">
      <div className="w-full max-w-6xl grid lg:grid-cols-[0.95fr_1.05fr] gap-6 items-stretch relative z-10">
        <div className="glass-panel p-8 lg:p-10 w-full relative z-10 text-white self-center order-2 lg:order-1">
          <p className="section-kicker mb-3">Create Account</p>
          <h2 className="text-4xl font-extrabold neon-text">Join Bridal Bliss</h2>
          <p className="text-slate-300 mt-3 text-sm">Set up your profile and step into a more refined planning experience.</p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Account Type</label>
              <select className="input-shell" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user" className="text-black">User</option>
                <option value="mehandi" className="text-black">Mehandi Artist</option>
                <option value="makeup" className="text-black">Makeup Artist</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Your Name"
                className="input-shell"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="input-shell"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Password</label>
              <input
                type="password"
                placeholder="Create a secure password"
                className="input-shell"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button onClick={handleRegister} disabled={loading} className="w-full primary-btn text-lg mt-8 disabled:opacity-60">
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-center mt-6 text-slate-300">
            Already have an account?{" "}
            <span className="font-bold text-rose-300 hover:text-rose-200 cursor-pointer transition" onClick={() => navigate("/")}>
              Sign In
            </span>
          </p>
        </div>

        <div
          className="glass-panel min-h-[640px] p-8 lg:p-10 overflow-hidden relative order-1 lg:order-2"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.38), rgba(15, 23, 42, 0.82)), url("${backgroundImages.artist}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 via-transparent to-rose-500/20" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <p className="section-kicker mb-4">For Shoppers And Artists</p>
              <h1 className="text-5xl lg:text-6xl font-extrabold max-w-xl leading-tight">
                Build your presence in a bridal marketplace that feels premium.
              </h1>
              <p className="text-slate-200/85 max-w-lg mt-5 text-base lg:text-lg leading-7">
                Whether you are booking services or showcasing artistry, the interface now leans into atmosphere, imagery, and cleaner hierarchy.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-10">
              <div className="glass-panel p-5 bg-slate-950/35">
                <p className="text-3xl font-extrabold text-white">01</p>
                <p className="mt-3 text-sm text-slate-200/80 leading-6">Choose the right account type and move straight into your dashboard.</p>
              </div>
              <div className="glass-panel p-5 bg-slate-950/35">
                <p className="text-3xl font-extrabold text-white">02</p>
                <p className="mt-3 text-sm text-slate-200/80 leading-6">Use richer visuals and clearer navigation to keep the experience feeling curated.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
