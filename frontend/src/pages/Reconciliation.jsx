import { useEffect, useState } from "react";
import { runStockReconciliation, dailyReport, money, dateFmt } from "../api";
import { Table, StatusBadge, Alert } from "../components/ui";

export default function Reconciliation() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [stockData, setStockData] = useState(null);
  const [expectedSales, setExpectedSales] = useState(0);
  
  // Cash state
  const [cashInputs, setCashInputs] = useState({ cash: "", mpesa: "", card: "" });
  const [isSaved, setIsSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  // Load data for the selected date
  async function loadData() {
    setBusy(true);
    setIsSaved(false);
    
    // 1. Get Stock Reconciliation
    const stock = await runStockReconciliation(date);
    setStockData(stock);

    // 2. Get Expected Cash from Sales
    const report = await dailyReport(date);
    const totalSales = report.reduce((sum, row) => sum + row.sales_value, 0);
    setExpectedSales(totalSales);

    // Reset cash inputs for the new date
    setCashInputs({ cash: "", mpesa: "", card: "" });
    setBusy(false);
  }

  // Calculate totals dynamically
  const actualCash = 
    (Number(cashInputs.cash) || 0) + 
    (Number(cashInputs.mpesa) || 0) + 
    (Number(cashInputs.card) || 0);

  const cashDifference = actualCash - expectedSales;
  const cashStatus = cashDifference === 0 ? "balanced" : cashDifference < 0 ? "shortage" : "surplus";

  function saveShift() {
    // In a real backend, this is where you would POST the cash inputs to the DB
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  }

  return (
    <div className="max-w-5xl">
      <div className="flex justify-between items-end mb-6 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daily Reconciliation</h1>
          <p className="text-slate-500 text-sm mt-1">Verify stock levels and balance the shift cash.</p>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">Business Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-slate-300 border rounded-lg px-3 py-2 text-sm shadow-sm"
            />
          </div>
          <button
            onClick={loadData}
            disabled={busy}
            className="bg-slate-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-700 shadow-sm transition"
          >
            {busy ? "Loading..." : "Run Reconciliation"}
          </button>
        </div>
      </div>

      {!stockData ? (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500">Select a date and click "Run Reconciliation" to view the daily worksheet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* SECTION 1: STOCK RECONCILIATION */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm">1</span>
              Stock Verification (Litres)
            </h2>
            {stockData.some((r) => !r.hasDip) && (
              <Alert type="warn">Note: Some tanks have no dip recorded for this date.</Alert>
            )}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <Table
                columns={[
                  { key: "tank_name", label: "Tank" },
                  { key: "opening", label: "Opening Dip", align: "right", render: (r) => r.opening.toFixed(2) },
                  { key: "deliveries", label: "Deliveries", align: "right", render: (r) => r.deliveries.toFixed(2) },
                  { key: "sold", label: "Sold (Meters)", align: "right", render: (r) => r.sold.toFixed(2) },
                  { key: "expected", label: "Expected", align: "right", render: (r) => r.expected.toFixed(2) },
                  { key: "actual", label: "Actual Dip", align: "right", render: (r) => r.actual.toFixed(2) },
                  { key: "variance", label: "Variance", align: "right", render: (r) => <span className={r.variance < 0 ? "text-red-600 font-bold" : r.variance > 0 ? "text-amber-600 font-bold" : ""}>{r.variance > 0 ? "+" : ""}{r.variance.toFixed(2)}</span> },
                  { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
                ]}
                rows={stockData}
              />
            </div>
          </div>

          {/* SECTION 2: CASH RECONCILIATION */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-sm">2</span>
              Cash Verification (Money)
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                
                {/* Expected Column */}
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-600 mb-2 uppercase tracking-wide text-xs">Expected Cash (System)</h3>
                  <p className="text-sm text-slate-500 mb-2">Total value of fuel dispensed today:</p>
                  <p className="text-3xl font-bold text-slate-800">{money(expectedSales)}</p>
                </div>

                {/* Input Column */}
                <div>
                  <h3 className="font-semibold text-slate-600 mb-3 uppercase tracking-wide text-xs">Actual Cash Received</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="w-24 text-sm font-medium text-slate-700">Physical Cash</label>
                      <input
                        type="number" min="0" step="0.01"
                        value={cashInputs.cash}
                        onChange={(e) => { setCashInputs({ ...cashInputs, cash: e.target.value }); setIsSaved(false); }}
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-right"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="w-24 text-sm font-medium text-slate-700">M-Pesa</label>
                      <input
                        type="number" min="0" step="0.01"
                        value={cashInputs.mpesa}
                        onChange={(e) => { setCashInputs({ ...cashInputs, mpesa: e.target.value }); setIsSaved(false); }}
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-right"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="w-24 text-sm font-medium text-slate-700">Card / Bank</label>
                      <input
                        type="number" min="0" step="0.01"
                        value={cashInputs.card}
                        onChange={(e) => { setCashInputs({ ...cashInputs, card: e.target.value }); setIsSaved(false); }}
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-right"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Table */}
              <div className="bg-slate-900 text-white rounded-lg p-5 flex justify-between items-center">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total Actual Received</p>
                  <p className="text-2xl font-bold">{money(actualCash)}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm mb-1">Difference (Actual - Expected)</p>
                  <div className="flex items-center justify-end gap-3">
                    <p className={`text-2xl font-bold ${cashDifference === 0 ? "text-emerald-400" : cashDifference < 0 ? "text-red-400" : "text-amber-400"}`}>
                      {cashDifference > 0 ? "+" : ""}{money(cashDifference)}
                    </p>
                    {actualCash > 0 && (
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${cashDifference === 0 ? "bg-emerald-500/20 text-emerald-400" : cashDifference < 0 ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>
                        {cashStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 flex justify-end items-center gap-4">
                {isSaved && <span className="text-emerald-600 font-semibold text-sm">✓ Shift balanced and saved!</span>}
                <button
                  onClick={saveShift}
                  disabled={actualCash === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-lg font-bold shadow-md transition disabled:opacity-50"
                >
                  Submit Shift Report
                </button>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}