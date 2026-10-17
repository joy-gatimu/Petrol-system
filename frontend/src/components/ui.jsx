export function Table({ columns, rows, empty = "No records" }) {
  return (
    <div className="overflow-auto bg-white rounded-lg shadow">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-3 py-2 ${
                  c.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-slate-400 py-6"
              >
                {empty}
              </td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-3 py-2 ${
                    c.align === "right" ? "text-right" : ""
                  }`}
                >
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Alert({ type = "info", children }) {
  const styles = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    success: "bg-green-50 text-green-800 border-green-200",
    warn: "bg-amber-50 text-amber-800 border-amber-200",
    error: "bg-red-50 text-red-800 border-red-200",
  };
  return (
    <div className={`border rounded p-3 text-sm mb-4 ${styles[type]}`}>
      {children}
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    shortage: "bg-red-100 text-red-700",
    surplus: "bg-amber-100 text-amber-700",
    balanced: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}