import { useEffect, useState } from "react";
import { listUsers } from "../api";
import { Table } from "../components/ui";

export default function Users() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    listUsers().then(setRows);
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <Table
        columns={[
          { key: "user_id", label: "ID" },
          { key: "full_name", label: "Name" },
          { key: "username", label: "Username" },
          { key: "role", label: "Role" },
          {
            key: "is_active",
            label: "Active",
            render: (r) => (r.is_active ? "Yes" : "No"),
          },
        ]}
        rows={rows}
      />
    </div>
  );
}