import { useEffect, useState } from "react";
import { dashboardData, money, litres, dateFmt } from "../api";
import { Table, StatusBadge } from "../components/ui";

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardData(today).then(setData);
  }, [today]);

  if (!data) return <div className="text-slate-500">Loading dashboard...</div>;

  const openDiscrepancies = data.recon.filter((r) => r.status !== "balanced");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Snapshot for {dateFmt(today)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 border-t-4 border-t-blue-500">
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Sales Today</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{money(data.totalSales)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 border-t-4 border-t-emerald-500">
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Volume Sold</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{litres(data.totalLitres)}</p>
        </div>
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 border-t-4 ${openDiscrepancies.length > 0 ? "border-t-red-500" : "border-t-slate-300"}`}>
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Stock Discrepancies</p>
          <p className={`text-3xl font-bold mt-2 ${openDiscrepancies.length > 0 ? "text-red-600" : "text-slate-800"}`}>
            {openDiscrepancies.length}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-800 mb-4">Tank Levels</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {data.tankCapacities.map((t) => {
          const dip = data.dips.find((d) => d.tank_id === t.tank_id);
          const pct = dip ? Math.round((dip.closing_litres / t.capacity_litres) * 100) : 0;
          const barColor = pct < 20 ? "bg-red-500" : pct < 50 ? "bg-amber-500" : "bg-emerald-500";
          return (
            <div key={t.tank_id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold text-slate-700">{t.tank_name} <span className="text-slate-400 font-normal">({t.fuelName})</span></p>
                <span className="text-sm font-semibold text-slate-600">{pct}%</span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${barColor} rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-2 text-right">{dip ? litres(dip.closing_litres) : "No dip"} / {litres(t.capacity_litres)}</p>
            </div>
          );
        })}
      </div>

      <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Loss Alerts</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table
          columns={[
            { key: "recon_date", label: "Date", render: (r) => dateFmt(r.recon_date) },
            { key: "tank_name", label: "Tank" },
            { key: "variance", label: "Variance (L)", align: "right", render: (r) => <span className={r.variance < 0 ? "text-red-600 font-bold" : "text-amber-600 font-bold"}>{r.variance > 0 ? "+" : ""}{r.variance.toFixed(2)}</span> },
            { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={openDiscrepancies}
          empty="No shortages or surpluses detected today. Perfectly balanced!"
        />
      </div>
    </div>
  );
}