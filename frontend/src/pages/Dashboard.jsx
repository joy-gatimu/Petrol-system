import { useEffect, useState } from "react";
import { dashboardData, money, litres, dateFmt } from "../api";
import { Table, StatusBadge } from "../components/ui";

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardData(today).then(setData);
  }, [today]);

  if (!data) return <div className="text-slate-500 p-8">Loading dashboard...</div>;

  const openDiscrepancies = data.recon.filter((r) => r.status !== "balanced");
  const totalDiscrepancies = (data.totalStockDiscrepancies || openDiscrepancies.length) + (data.cashDiscrepancy || 0);

  return (
    <div className="pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Snapshot for {dateFmt(today)}</p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Total Sales */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-6 text-white border border-blue-600 transform transition hover:scale-[1.02]">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Total Sales Today</p>
              <p className="text-3xl font-extrabold mt-1">{money(data.totalSales)}</p>
            </div>
          </div>
        </div>

        {/* Volume Sold */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl shadow-lg p-6 text-white border border-emerald-600 transform transition hover:scale-[1.02]">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <div>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Volume Sold</p>
              <p className="text-3xl font-extrabold mt-1">{litres(data.totalLitres)}</p>
            </div>
          </div>
        </div>

        {/* Discrepancies */}
        <div className={`relative overflow-hidden rounded-2xl shadow-lg p-6 text-white border transform transition hover:scale-[1.02] ${totalDiscrepancies > 0 ? "bg-gradient-to-br from-red-500 to-red-700 border-red-600" : "bg-gradient-to-br from-slate-600 to-slate-800 border-slate-700"}`}>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${totalDiscrepancies > 0 ? "text-red-100" : "text-slate-300"}`}>Total Discrepancies</p>
              <p className="text-3xl font-extrabold mt-1">{totalDiscrepancies}</p>
            </div>
          </div>
        </div>

      </div>

      {/* TANK LEVELS */}
      <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        Tank Levels
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {data.tankCapacities.map((t) => {
          const dip = data.dips.find((d) => d.tank_id === t.tank_id);
          const pct = dip ? Math.round((Number(dip.closing_litres) / Number(t.capacity_litres)) * 100) : 0;
          const barColor = pct < 20 ? "bg-red-500" : pct < 50 ? "bg-amber-500" : "bg-emerald-500";
          const bgColor = pct < 20 ? "bg-red-50 border-red-100" : pct < 50 ? "bg-amber-50 border-amber-100" : "bg-white border-slate-200";
          
          return (
            <div key={t.tank_id} className={`rounded-2xl shadow-sm border p-5 ${bgColor} transition-all`}>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.fuelName}</p>
                  <p className="text-lg font-bold text-slate-800">{t.tank_name}</p>
                </div>
                <span className={`text-2xl font-extrabold ${pct < 20 ? "text-red-600" : pct < 50 ? "text-amber-600" : "text-emerald-600"}`}>{pct}%</span>
              </div>
              
              <div className="w-full h-5 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              
              <div className="flex justify-between text-xs font-semibold text-slate-500 mt-3">
                <span>{dip ? litres(dip.closing_litres) : "No dip"}</span>
                <span>Capacity: {litres(t.capacity_litres)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ALERTS */}
      <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        Recent Loss Alerts
      </h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <Table
          columns={[
            { key: "recon_date", label: "Date", render: (r) => <span className="font-semibold text-slate-700">{r.recon_date ? dateFmt(r.recon_date) : "Today"}</span> },
            { key: "tank_name", label: "Tank", render: (r) => <span className="font-medium">{r.tank_name}</span> },
            { key: "variance", label: "Variance (L)", align: "right", render: (r) => (
              <span className={`px-2 py-1 rounded-md font-bold ${r.variance < 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                {r.variance > 0 ? "+" : ""}{Number(r.variance).toFixed(2)} L
              </span>
            )},
            { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={openDiscrepancies}
          empty={
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p className="text-slate-700 font-bold text-lg">All Clear!</p>
              <p className="text-slate-500 text-sm mt-1">No fuel shortages or surpluses detected today. Perfectly balanced.</p>
            </div>
          }
        />
      </div>
    </div>
  );
}