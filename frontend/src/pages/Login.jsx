import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, saveToken } from "../api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await login(username, password);
      saveToken(res.token);
      localStorage.setItem("ps_user", JSON.stringify(res.user));
      onLogin(res.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-4 shadow-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Petrol Station</h1>
          <p className="text-slate-500 mt-2">Sign in to manage sales & stock</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100">{error}</div>}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg py-3 shadow-md transition disabled:opacity-70"
          >
            {busy ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-slate-400 text-sm mt-8">Petrol Station Management System &copy; 2026</p>
      </div>
    </div>
  );
}