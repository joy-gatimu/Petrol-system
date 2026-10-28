import { useEffect, useState } from "react";
import { dashboardData, getSalesTrend, money, litres, dateFmt } from "../api";
import { Table, StatusBadge } from "../components/ui";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const [data, setData] = useState(null);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    dashboardData(today).then(setData);
    getSalesTrend().then(setTrendData);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-6 text-white border border-blue-600 transform transition hover:scale-[1.02]">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
          <div className="relative z-10">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Total Sales Today</p>
            <p className="text-3xl font-extrabold mt-2">{money(data.totalSales)}</p>
          </div>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl shadow-lg p-6 text-white border border-emerald-600 transform transition hover:scale-[1.02]">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
          <div className="relative z-10">
            <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Volume Sold</p>
            <p className="text-3xl font-extrabold mt-2">{litres(data.totalLitres)}</p>
          </div>
        </div>
        <div className={`relative overflow-hidden rounded-2xl shadow-lg p-6 text-white border transform transition hover:scale-[1.02] ${totalDiscrepancies > 0 ? "bg-gradient-to-br from-red-500 to-red-700 border-red-600" : "bg-gradient-to-br from-slate-600 to-slate-800 border-slate-700"}`}>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
          <div className="relative z-10">
            <p className={`text-xs font-bold uppercase tracking-wider ${totalDiscrepancies > 0 ? "text-red-100" : "text-slate-300"}`}>Total Discrepancies</p>
            <p className="text-3xl font-extrabold mt-2">{totalDiscrepancies}</p>
          </div>
        </div>
      </div>

      {/* TANK LEVELS (Moved Above Graph) */}
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

      {/* 7-DAY SALES TREND CHART (Moved Below Tank Levels) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">7-Day Sales Trend</h2>
            <p className="text-sm text-slate-500 mt-1">Total revenue generated over the last week</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            Live Data
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `KSh ${value / 1000}k`} />
              <Tooltip 
                formatter={(value) => [money(value), "Sales"]}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
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