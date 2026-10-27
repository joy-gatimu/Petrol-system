import { useEffect, useState } from "react";
import { listUsers, createUser } from "../api";
import { Table, Alert } from "../components/ui";

export default function Users() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ full_name: "", username: "", password: "", role: "attendant" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadUsers = () => {
    listUsers().then(setRows);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(""); setError(""); setBusy(true);
    
    try {
      await createUser(form);
      setMessage("User created successfully!");
      setForm({ full_name: "", username: "", password: "", role: "attendant" }); // Reset form
      loadUsers(); // Refresh table
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">User Management</h1>

      {/* ADD USER FORM */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Add New User</h2>
        
        {message && <Alert type="success">{message}</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
            <input type="text" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="John Doe" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Username</label>
            <input type="text" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="johndoe" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Password</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="••••••••" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2">
              <option value="attendant">Attendant</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div>
            <button type="submit" disabled={busy} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2.5 disabled:opacity-50">
              {busy ? "Saving..." : "Add User"}
            </button>
          </div>
        </form>
      </div>

      {/* USER LIST TABLE */}
      <h2 className="text-lg font-bold text-slate-800 mb-4">Registered Users</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table
          columns={[
            { key: "user_id", label: "ID" },
            { key: "full_name", label: "Name" },
            { key: "username", label: "Username" },
            { key: "role", label: "Role", render: (r) => <span className="capitalize">{r.role.replace('_', ' ')}</span> },
            { key: "is_active", label: "Status", render: (r) => (
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${r.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {r.is_active ? "Active" : "Inactive"}
              </span>
            )},
          ]}
          rows={rows}
        />
      </div>
    </div>
  );
}