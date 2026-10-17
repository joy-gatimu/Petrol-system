import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearToken } from "../api";

const base = "block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-700";
const active = "bg-slate-700 text-white font-semibold";

export default function Layout({ user, onLogout }) {
  const nav = useNavigate();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  function logout() {
    clearToken();
    localStorage.removeItem("ps_user");
    onLogout?.();
    nav("/login");
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-60 bg-slate-800 p-4 flex flex-col">
        <div className="mb-8">
          <h2 className="text-white font-bold">Petrol Station</h2>
          <p className="text-slate-400 text-xs">Sales & Stock</p>
        </div>
        <nav className="space-y-1 flex-1">
          <NavLink to="/dashboard" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
            Dashboard
          </NavLink>
          <NavLink to="/readings" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
            Record Readings
          </NavLink>
          <NavLink to="/reconciliation" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
            Reconciliation
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
            Reports
          </NavLink>
          {isAdmin && (
            <NavLink to="/setup" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
              Pumps, Tanks & Prices
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/users" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
              Users
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/audit" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
              Audit Log
            </NavLink>
          )}
          <NavLink to="/help" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
            Help
          </NavLink>
        </nav>
        <div className="border-t border-slate-700 pt-4">
          <p className="text-slate-300 text-sm mb-2">
            {user?.full_name}{" "}
            <span className="text-xs text-slate-400">({user?.role})</span>
          </p>
          <button
            onClick={logout}
            className="bg-white text-slate-800 text-sm rounded px-3 py-1.5 font-semibold"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}