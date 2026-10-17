import { useEffect, useState } from "react";
import { listAuditLogs, dateFmt } from "../api";
import { Table } from "../components/ui";

export default function AuditLog() {
  const [rows, setRows] = useState([]);
  useEffect(() => { listAuditLogs().then(setRows); }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Log</h1>
      <Table
        columns={[
          { key: "log_id", label: "ID" },
          { key: "user_id", label: "User" },
          { key: "action", label: "Action" },
          { key: "table_name", label: "Table" },
          { key: "record_id", label: "Record" },
          { key: "created_at", label: "When", render: (r) => dateFmt(r.created_at) },
        ]}
        rows={rows}
      />
    </div>
  );
}