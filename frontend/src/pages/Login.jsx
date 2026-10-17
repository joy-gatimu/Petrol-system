import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, forgotPassword, resetPassword, saveToken } from "../api";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState(""); // Empty by default
  const [password, setPassword] = useState(""); // Empty by default
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const token = new URLSearchParams(window.location.search).get("token");
  
  // This forces the page to change URL
  const navigate = useNavigate(); 

  async function submit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "login") {
        // 1. Verify username & password against mock data
        const res = await login(username, password);
        
        // 2. Save the session
        saveToken(res.token);
        localStorage.setItem("ps_user", JSON.stringify(res.user));
        
        // 3. Tell App.jsx we are logged in
        if (typeof onLogin === "function") {
          onLogin(res.user);
        }
        
        // 4. Force navigation to the dashboard
        navigate("/dashboard");
        
      } else if (mode === "forgot") {
        const r = await forgotPassword(username);
        setInfo(r.message);
      } else {
        const r = await resetPassword(token, password);
        setInfo(r.message);
        setMode("login");
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        autoComplete="off"
        className="bg-white rounded-lg shadow-xl w-full max-w-sm p-8"
      >
        <h1 className="text-2xl font-bold text-center text-slate-800">
          Petrol Station
        </h1>
        <p className="text-center text-slate-500 text-sm mb-6">
          {mode === "login"
            ? "Sign in to continue"
            : mode === "forgot"
            ? "Enter your username to reset"
            : "Set a new password"}
        </p>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm p-2 rounded mb-3">
            {error}
          </p>
        )}
        {info && (
          <p className="bg-green-50 text-green-700 text-sm p-2 rounded mb-3">
            {info}
          </p>
        )}

        {mode !== "reset" && (
          <>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 mb-3"
            />
          </>
        )}

        {mode !== "forgot" && (
          <>
            <label className="block text-sm font-medium mb-1">
              {mode === "reset" ? "New password" : "Password"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 mb-4"
            />
          </>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded py-2.5"
        >
          {busy
            ? "Please wait…"
            : mode === "login"
            ? "Log in"
            : mode === "forgot"
            ? "Send reset link"
            : "Reset password"}
        </button>

        <div className="text-center mt-4 text-sm">
          {mode === "login" ? (
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="text-blue-600"
            >
              Forgot password?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-blue-600"
            >
              Back to login
            </button>
          )}
        </div>
      </form>
    </div>
  );
}