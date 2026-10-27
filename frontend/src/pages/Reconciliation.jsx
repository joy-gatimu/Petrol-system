import { useState, useEffect } from "react";
import { 
  runStockReconciliation, getExpectedCash, getCashReconciliation, 
  saveCashReconciliation, deleteCashReconciliation, money 
} from "../api";
import { Table, StatusBadge } from "../components/ui";

export default function Reconciliation() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [stockData, setStockData] = useState(null);
  const [expectedCash, setExpectedCash] = useState(0);
  
  // Cash State
  const [cashInputs, setCashInputs] = useState({ cash: "", mpesa: "", card: "" });
  const [isSaved, setIsSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // Automatically reload data whenever the date changes
  useEffect(() => {
    loadPageData();
  }, [date]);

  async function loadPageData() {
    setBusy(true);
    setSaveMsg("");
    
    // 1. Clear previous state so we don't accidentally show old data
    setStockData(null);
    setCashInputs({ cash: "", mpesa: "", card: "" });
    setIsSaved(false);

    // 2. Fetch Stock Data
    const stock = await runStockReconciliation(date);
    setStockData(stock);

    // 3. Fetch Expected Cash
    const cashRes = await getExpectedCash(date);
    setExpectedCash(cashRes.expectedCash);

    // 4. Fetch Saved Cash for this specific date
    try {
      const savedCash = await getCashReconciliation(date);
      if (savedCash && savedCash.cash_id) {
        setCashInputs({
          cash: savedCash.actual_cash ? Number(savedCash.actual_cash).toString() : "",
          mpesa: savedCash.actual_mpesa ? Number(savedCash.actual_mpesa).toString() : "",
          card: savedCash.actual_card ? Number(savedCash.actual_card).toString() : ""
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error("No saved cash for this date", err);
    }
    
    setBusy(false);
  }

  async function handleSaveCash() {
    setBusy(true);
    try {
      await saveCashReconciliation({
        recon_date: date,
        expected_sales: expectedCash,
        actual_cash: Number(cashInputs.cash) || 0,
        actual_mpesa: Number(cashInputs.mpesa) || 0,
        actual_card: Number(cashInputs.card) || 0,
      });
      setSaveMsg("✅ Cash reconciliation saved successfully!");
      setIsSaved(true);
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveMsg("❌ Error: " + err.message);
    }
    setBusy(false);
  }

  async function handleDeleteCash() {
    if (!window.confirm("Are you sure you want to delete the cash record for this date?")) return;
    setBusy(true);
    try {
      await deleteCashReconciliation(date);
      setCashInputs({ cash: "", mpesa: "", card: "" });
      setIsSaved(false);
      setSaveMsg("🗑️ Cash record deleted.");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveMsg("❌ Error: " + err.message);
    }
    setBusy(false);
  }

  const actualCash = 
    (Number(cashInputs.cash) || 0) + 
    (Number(cashInputs.mpesa) || 0) + 
    (Number(cashInputs.card) || 0);

  const cashDifference = actualCash - expectedCash;
  const cashStatus = cashDifference === 0 ? "balanced" : cashDifference < 0 ? "shortage" : "surplus";

  return (
    <div className="max-w-5xl">
      <div className="flex justify-between items-end mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daily Reconciliation</h1>
          <p className="text-slate-500 text-sm mt-1">Compare physical stock and cash against system records.</p>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border-slate-300 border rounded-lg px-3 py-2 text-sm" />
          </div>
          <button onClick={loadPageData} disabled={busy} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-700">
            {busy ? "Loading..." : "Refresh Data"}
          </button>
        </div>
      </div>

      {!stockData ? (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">Loading data for {date}...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* STOCK SECTION */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm">1</span> Stock Verification (Litres)
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                rows={stockData}
              />
            </div>
          </div>

          {/* CASH SECTION */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-sm">2</span> Cash Verification (Money)
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-600 mb-2 uppercase tracking-wide text-xs">Expected Cash (System)</h3>
                  <p className="text-sm text-slate-500 mb-2">Total value of fuel dispensed today:</p>
                  <p className="text-3xl font-bold text-slate-800">{money(expectedCash)}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-600 mb-3 uppercase tracking-wide text-xs">Actual Cash Received</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="w-24 text-sm font-medium text-slate-700">Physical Cash</label>
                      <input type="number" min="0" step="0.01" value={cashInputs.cash} onChange={(e) => setCashInputs({ ...cashInputs, cash: e.target.value })} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-right" placeholder="0.00" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="w-24 text-sm font-medium text-slate-700">M-Pesa</label>
                      <input type="number" min="0" step="0.01" value={cashInputs.mpesa} onChange={(e) => setCashInputs({ ...cashInputs, mpesa: e.target.value })} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-right" placeholder="0.00" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="w-24 text-sm font-medium text-slate-700">Card</label>
                      <input type="number" min="0" step="0.01" value={cashInputs.card} onChange={(e) => setCashInputs({ ...cashInputs, card: e.target.value })} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-right" placeholder="0.00" />
                    </div>
                  </div>
                </div>
              </div>

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

              {/* ACTION BUTTONS */}
              <div className="mt-6 flex justify-end items-center gap-4">
                {saveMsg && <span className="text-sm font-semibold text-emerald-600">{saveMsg}</span>}
                
                {isSaved ? (
                  <>
                    <button onClick={handleDeleteCash} disabled={busy} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition">
                      Delete Cash
                    </button>
                    <button onClick={handleSaveCash} disabled={busy} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition">
                      Update Cash
                    </button>
                  </>
                ) : (
                  <button onClick={handleSaveCash} disabled={actualCash === 0 || busy} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-lg font-bold shadow-md transition disabled:opacity-50">
                    Submit Cash Report
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}