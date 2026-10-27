import { useEffect, useState } from "react";
import { listAuditLogs, listUsers } from "../api";
import { Table } from "../components/ui";

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    listAuditLogs().then(setLogs);
    listUsers().then(setUsers);
  }, []);

  function getUserName(id) {
    const user = users.find(u => u.user_id === id);
    return user ? user.full_name : `User ${id}`;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString("en-GB", { 
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Audit Log</h1>
        <p className="text-slate-500 text-sm mt-1">A permanent history of all critical system actions.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table
          columns={[
            { key: "log_id", label: "ID" },
            { key: "user_id", label: "User", render: (r) => <span className="font-semibold">{getUserName(r.user_id)}</span> },
            { key: "action", label: "Action", render: (r) => {
              // Add colors for different actions
              let badgeStyle = "bg-slate-100 text-slate-700";
              if (r.action === "LOGIN") badgeStyle = "bg-blue-100 text-blue-700";
              if (r.action === "CREATE_USER") badgeStyle = "bg-purple-100 text-purple-700";
              if (r.action.startsWith("CREATE_")) badgeStyle = "bg-emerald-100 text-emerald-700";
              if (r.action.startsWith("DELETE_")) badgeStyle = "bg-red-100 text-red-700";
              
              return <span className={`px-2 py-0.5 rounded text-xs font-bold ${badgeStyle}`}>{r.action.replace("_", " ")}</span>;
            }},
            { key: "table_name", label: "Table" },
            { key: "record_id", label: "Record ID" },
            { key: "created_at", label: "Timestamp", render: (r) => formatDate(r.created_at) },
          ]}
          rows={logs}
          empty="No audit logs recorded yet."
        />
      </div>
    </div>
  );
}