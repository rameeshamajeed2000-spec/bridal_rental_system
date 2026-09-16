import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { apiUrl, getApiError } from "../utils/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(apiUrl("/all_users"));
      setUsers(res.data);
    } catch (err) {
      alert(getApiError(err, "Could not load users."));
    }
  };

  return (
    <div className="flex min-h-screen bg-transparent flex-col md:flex-row">
      <Sidebar role="admin" />

      <div className="p-5 md:p-10 w-full relative z-10">
        <h1 className="text-4xl font-extrabold mb-8 neon-text tracking-wide uppercase">
          👥 Registered Users
        </h1>

        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/10 text-[#d4b3ff] uppercase text-xs tracking-widest font-bold">
                  <th className="p-5 border-b border-white/10">ID</th>
                  <th className="p-5 border-b border-white/10">Name</th>
                  <th className="p-5 border-b border-white/10">Email</th>
                  <th className="p-5 border-b border-white/10">Role</th>
                </tr>
              </thead>
              <tbody className="text-[#f0e6ff]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors border-b border-white/5">
                    <td className="p-5 text-sm font-mono text-pink-300">#{u.id}</td>
                    <td className="p-5 font-semibold">{u.name}</td>
                    <td className="p-5 text-slate-300">{u.email}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === "admin" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="p-20 text-center text-[#a89bc0]">
              <p className="text-xl">No users registered yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
