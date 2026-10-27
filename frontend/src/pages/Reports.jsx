import { useState } from "react";
import { dailyReport, getCashReconciliation, monthlyReport, money, litres, dateFmt } from "../api";
import { Table, StatusBadge } from "../components/ui";

export default function Reports() {
  const today = new Date();
  const [mode, setMode] = useState("daily");
  
  const [date, setDate] = useState(today.toISOString().slice(0, 10));
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  
  const [data, setData] = useState(null);
  const [cashData, setCashData] = useState(null); // New state for Cash
  const [busy, setBusy] = useState(false);

  async function generateReport() {
    setBusy(true);
    if (mode === "daily") {
      const res = await dailyReport(date);
      const cashRes = await getCashReconciliation(date); // Fetch cash for the report
      setData({ type: "daily", date, rows: res });
      setCashData(cashRes);
    } else {
      const res = await monthlyReport(year, month);
      setData({ type: "monthly", year, month, rows: res });
      setCashData(null);
    }
    setBusy(false);
  }

  function exportCSV() {
    if (!data) return;
    let headers = [];
    let csvRows = [];

    if (data.type === "daily") {
      headers = ["Tank", "Opening", "Deliveries", "Sold", "Expected", "Actual", "Variance", "Status"];
      csvRows = data.rows.map(r => [r.tank_name, r.opening, r.deliveries, r.sold, r.expected, r.actual, r.variance, r.status]);
      
      if (cashData) {
        csvRows.push([]);
        csvRows.push(["CASH RECONCILIATION"]);
        csvRows.push(["Expected Cash", cashData.expected_sales]);
        csvRows.push(["Actual Cash", cashData.actual_cash]);
        csvRows.push(["M-Pesa", cashData.actual_mpesa]);
        csvRows.push(["Card", cashData.actual_card]);
        csvRows.push(["Cash Variance", Number(cashData.actual_cash) + Number(cashData.actual_mpesa) + Number(cashData.actual_card) - Number(cashData.expected_sales)]);
        csvRows.push(["Cash Status", cashData.status]);
      }
    } else {
      headers = ["Pump", "Litres Sold", "Revenue (KES)"];
      csvRows = data.rows.map(r => [r.pump, r.litres, r.sales]);
    }

    const csvContent = [headers, ...csvRows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Petrol_Station_${data.type}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
      <div className="hidden print:block text-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">Petrol Station</h1>
        <p className="text-slate-600">Official Sales & Stock Report</p>
      </div>

      <div className="flex justify-between items-end mb-6 border-b pb-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports Center</h1>
          <p className="text-slate-500 text-sm mt-1">Generate, print, and export station records.</p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 no-print">
        <div className="flex gap-4 mb-6 border-b pb-4">
          <button onClick={() => { setMode("daily"); setData(null); }} className={`px-6 py-2 rounded-lg font-semibold text-sm transition ${mode === "daily" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Daily Summary</button>
          <button onClick={() => { setMode("monthly"); setData(null); }} className={`px-6 py-2 rounded-lg font-semibold text-sm transition ${mode === "monthly" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Monthly Summary</button>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {mode === "daily" ? (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Report Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-slate-300 rounded-lg px-4 py-2" />
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Year</label>
                <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="border border-slate-300 rounded-lg px-4 py-2 w-32" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Month</label>
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border border-slate-300 rounded-lg px-4 py-2">
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>
              </div>
            </>
          )}

          <button onClick={generateReport} disabled={busy} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow-sm transition">
            {busy ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Report Output */}
      {data && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {data.type === "daily" ? `Daily Summary — ${dateFmt(data.date)}` : `Monthly Summary — ${data.year}-${String(data.month).padStart(2, "0")}`}
              </h2>
              <p className="text-slate-500 text-sm">Generated on {dateFmt(new Date())}</p>
            </div>
            
            <div className="flex gap-2 no-print">
              <button onClick={exportCSV} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 text-sm">Export CSV</button>
              <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 text-sm">Print PDF</button>
            </div>
          </div>

          {/* DAILY REPORT VIEW */}
          {data.type === "daily" && (
            <div>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <p className="text-sm text-slate-500 font-semibold">Total Litres Sold</p>
                  <p className="text-2xl font-bold text-slate-800">{litres(data.rows.reduce((s, r) => s + r.sold, 0))}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <p className="text-sm text-slate-500 font-semibold">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-800">{money(data.rows.reduce((s, r) => s + (r.sold * 205), 0))}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <p className="text-sm text-slate-500 font-semibold">Stock Variances</p>
                  <p className={`text-2xl font-bold ${data.rows.some(r => r.variance !== 0) ? "text-red-600" : "text-emerald-600"}`}>
                    {data.rows.filter(r => r.status !== "balanced").length} Tanks
                  </p>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 mb-3 text-lg">Stock Reconciliation Details</h3>
              <Table
                columns={[
                  { key: "tank_name", label: "Tank" },
                  { key: "opening", label: "Opening", align: "right", render: (r) => r.opening.toFixed(2) },
                  { key: "deliveries", label: "Deliv.", align: "right", render: (r) => r.deliveries.toFixed(2) },
                  { key: "sold", label: "Sold", align: "right", render: (r) => r.sold.toFixed(2) },
                  { key: "expected", label: "Expected", align: "right", render: (r) => r.expected.toFixed(2) },
                  { key: "actual", label: "Actual", align: "right", render: (r) => r.actual.toFixed(2) },
                  { key: "variance", label: "Variance", align: "right", render: (r) => <span className={r.variance < 0 ? "text-red-600 font-bold" : r.variance > 0 ? "text-amber-600 font-bold" : ""}>{r.variance > 0 ? "+" : ""}{r.variance.toFixed(2)}</span> },
                  { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
                ]}
                rows={data.rows}
              />

              {/* CASH RECONCILIATION SECTION */}
              <h3 className="font-bold text-slate-800 mb-3 mt-10 text-lg">Cash Reconciliation Details</h3>
              {cashData ? (
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 font-semibold mb-1">Expected Cash</p>
                      <p className="font-bold text-slate-800">{money(cashData.expected_sales)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold mb-1">Physical Cash</p>
                      <p className="font-bold text-slate-800">{money(cashData.actual_cash)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold mb-1">M-Pesa</p>
                      <p className="font-bold text-slate-800">{money(cashData.actual_mpesa)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold mb-1">Card</p>
                      <p className="font-bold text-slate-800">{money(cashData.actual_card)}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-slate-500 font-semibold mb-1">Total Received</p>
                      <p className="font-bold text-slate-800 text-lg">
                        {money(Number(cashData.actual_cash) + Number(cashData.actual_mpesa) + Number(cashData.actual_card))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Cash Variance</p>
                      <div className="flex items-center gap-2 justify-end">
                        <p className={`font-bold text-lg ${cashData.status === "balanced" ? "text-emerald-600" : "text-red-600"}`}>
                          {money(Number(cashData.actual_cash) + Number(cashData.actual_mpesa) + Number(cashData.actual_card) - Number(cashData.expected_sales))}
                        </p>
                        <StatusBadge status={cashData.status} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic">No cash reconciliation recorded for this date.</p>
              )}
            </div>
          )}

          {/* MONTHLY REPORT VIEW */}
          {data.type === "monthly" && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <p className="text-sm text-slate-500 font-semibold">Total Monthly Litres</p>
                  <p className="text-2xl font-bold text-slate-800">{litres(data.rows.reduce((s, r) => s + Number(r.litres), 0))}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <p className="text-sm text-slate-500 font-semibold">Total Monthly Revenue</p>
                  <p className="text-2xl font-bold text-blue-700">{money(data.rows.reduce((s, r) => s + Number(r.sales), 0))}</p>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 mb-3 text-lg">Sales by Pump</h3>
              <Table
                columns={[
                  { key: "pump", label: "Pump Name" },
                  { key: "litres", label: "Total Litres Dispensed", align: "right", render: (r) => Number(r.litres).toFixed(2) },
                  { key: "sales", label: "Total Revenue", align: "right", render: (r) => money(r.sales) },
                ]}
                rows={data.rows}
                empty="No sales recorded for this month."
              />
            </div>
          )}

          <div className="mt-12 pt-8 border-t text-center text-sm text-slate-500">
            <p>This is a system-generated document. Petrol Station Sales & Stock System.</p>
            <p>Generated by: Administrator</p>
          </div>
        </div>
      )}
    </div>
  );
}