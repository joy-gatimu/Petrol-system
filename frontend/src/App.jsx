import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Readings from "./pages/Readings";
import Reconciliation from "./pages/Reconciliation";
import Reports from "./pages/Reports";
import Setup from "./pages/Setup";
import Users from "./pages/Users";
import AuditLog from "./pages/AuditLog";
import Help from "./pages/Help";

function RequireAuth({ user, children }) {
  const loggedIn = user && typeof user === "object" && user.user_id;
  return loggedIn ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ user, children }) {
  const ok = user && (user.role === "admin" || user.role === "super_admin");
  return ok ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
const [user, setUser] = useState(null); 

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={setUser} />} />

      <Route
        element={
          <RequireAuth user={user}>
            <Layout user={user} onLogout={() => setUser(null)} />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/readings" element={<Readings />} />
        <Route path="/reconciliation" element={<Reconciliation />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/setup" element={<RequireAdmin user={user}><Setup /></RequireAdmin>} />
        <Route path="/users" element={<RequireAdmin user={user}><Users /></RequireAdmin>} />
        <Route path="/audit" element={<RequireAdmin user={user}><AuditLog /></RequireAdmin>} />
        <Route path="/help" element={<Help />} />
      </Route>

      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}