import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl, getApiError } from "../utils/api";
import { authShowcase, backgroundImages } from "../utils/uiTheme";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(apiUrl("/login"), {
        email,
        password,
        role,
      });

      if (res.data.message === "Login successful") {
        localStorage.setItem("user", JSON.stringify({ email, role }));

        if (role === "admin") navigate("/admin");
        else if (role === "user") navigate("/user");
        else navigate("/artist");
      } else {
        alert(res.data.message || "Invalid credentials");
      }
    } catch (err) {
      alert(getApiError(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-transparent">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch relative z-10">
        <div
          className="glass-panel min-h-[640px] p-8 lg:p-10 overflow-hidden relative"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.42), rgba(15, 23, 42, 0.84)), url("${backgroundImages.bridal}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/15 via-transparent to-sky-400/10" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <p className="section-kicker mb-4">Luxury Bridal Experience</p>
              <h1 className="text-5xl lg:text-6xl font-extrabold max-w-xl leading-tight">
                Plan your bridal look with a more cinematic storefront.
              </h1>
              <p className="text-slate-200/85 max-w-lg mt-5 text-base lg:text-lg leading-7">
                A warmer, image-rich interface for shoppers, artists, and admins working in the same space.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-10">
              {authShowcase.map((item) => (
                <div key={item.title} className="glass-panel p-4 bg-slate-950/35">
                  <p className="text-sm font-semibold text-white mb-2">{item.title}</p>
                  <p className="text-sm text-slate-200/75 leading-6">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 lg:p-10 w-full relative z-10 text-white self-center">
          <p className="section-kicker mb-3">Welcome Back</p>
          <h2 className="text-4xl font-extrabold neon-text">Sign in to Bridal Bliss</h2>
          <p className="text-slate-300 mt-3 text-sm">Access your account and continue planning, managing, or creating.</p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Account Type</label>
              <select className="input-shell" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user" className="text-black">User</option>
                <option value="admin" className="text-black">Admin</option>
                <option value="mehandi" className="text-black">Mehandi Artist</option>
                <option value="makeup" className="text-black">Makeup Artist</option>
              </select>
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
                placeholder="Enter your password"
                className="input-shell"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button onClick={handleLogin} disabled={loading} className="w-full primary-btn text-lg mt-8 disabled:opacity-60">
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p className="text-center mt-6 text-slate-300">
            Do not have an account?{" "}
            <span
              className="font-bold text-rose-300 hover:text-rose-200 cursor-pointer transition"
              onClick={() => navigate("/register")}
            >
              Create one
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
