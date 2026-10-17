import { useEffect, useState } from "react";
import { dashboardData, money, litres, dateFmt } from "../api";
import { Table, StatusBadge, Alert } from "../components/ui";

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardData(today)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [today]);

  if (error) return <Alert type="error">{error}</Alert>;
  if (!data) return <p>Loading…</p>;

  const open = data.recon.filter((r) => r.status !== "balanced");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Kpi label="Litres sold today" value={litres(data.totalLitres)} />
        <Kpi label="Sales today" value={money(data.totalSales)} />
        <Kpi label="Open discrepancies" value={open.length} />
      </div>

      <h2 className="text-lg font-semibold mb-3">Tank levels (latest dip)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {data.tankCapacities.map((t) => {
          const dip = data.dips.find((d) => d.tank_id === t.tank_id);
          const pct = dip
            ? Math.round((dip.closing_litres / t.capacity_litres) * 100)
            : 0;
          return (
            <div key={t.tank_id} className="bg-white rounded-lg shadow p-4">
              <p className="text-sm font-semibold">{t.tank_name}</p>
              <div className="w-full h-3 bg-slate-200 rounded mt-3">
                <div
                  className="h-3 bg-blue-500 rounded"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">{pct}% full</p>
            </div>
          );
        })}
      </div>

      <h2 className="text-lg font-semibold mb-3">
        Recent shortages / surpluses
      </h2>
      <Table
        columns={[
          { key: "recon_date", label: "Date", render: (r) => dateFmt(r.recon_date) },
          { key: "tank_name", label: "Tank" },
          {
            key: "variance",
            label: "Variance (L)",
            align: "right",
            render: (r) => `${r.variance > 0 ? "+" : ""}${r.variance.toFixed(2)}`,
          },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]}
        rows={data.recon.filter((r) => r.status !== "balanced")}
      />
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-slate-500 text-sm">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}