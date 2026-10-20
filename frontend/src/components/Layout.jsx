import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearToken } from "../api";

const base = "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150 text-slate-300 hover:bg-slate-700 hover:text-white";
const active = "bg-blue-600 text-white shadow-md";

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
    <div className="min-h-screen flex bg-slate-50 font-sans">
      <aside className="w-64 bg-slate-900 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-white text-xl font-bold tracking-tight">Petrol Station</h2>
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mt-1">Sales & Stock System</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2">Operations</p>
          <NavLink to="/dashboard" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
            Dashboard
          </NavLink>
          <NavLink to="/readings" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
            Daily Data Entry
          </NavLink>
          <NavLink to="/reconciliation" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
            Reconciliation
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
            Reports
          </NavLink>

          {isAdmin && (
            <>
              <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Administration</p>
              <NavLink to="/setup" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
                Station Setup
              </NavLink>
              <NavLink to="/users" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
                User Management
              </NavLink>
              <NavLink to="/audit" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
                Audit Log
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{user?.full_name}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full bg-slate-800 text-white text-sm rounded-lg py-2 font-semibold hover:bg-slate-700 transition">
            Sign out
          </button>
        </div>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}