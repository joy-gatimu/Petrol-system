import { useState } from "react";
import { runStockReconciliation, runCashReconciliation, money, dateFmt } from "../api";
import { Table, StatusBadge, Alert } from "../components/ui";

export default function Reconciliation() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [tab, setTab] = useState("stock");
  const [stock, setStock] = useState(null);
  const [cash, setCash] = useState(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      if (tab === "stock") setStock(await runStockReconciliation(date));
      else setCash(await runCashReconciliation(date));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reconciliation</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("stock")}
          className={`px-4 py-2 rounded text-sm font-medium ${
            tab === "stock" ? "bg-blue-600 text-white" : "bg-white shadow"
          }`}
        >
          Stock (litres)
        </button>
        <button
          onClick={() => setTab("cash")}
          className={`px-4 py-2 rounded text-sm font-medium ${
            tab === "cash" ? "bg-blue-600 text-white" : "bg-white shadow"
          }`}
        >
          Cash / M-Pesa / Card
        </button>
      </div>

      <div className="flex items-end gap-4 mb-6">
        <div>
          <label className="text-sm text-slate-600">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded px-3 py-2 block"
          />
        </div>
        <button
          onClick={run}
          disabled={busy}
          className="bg-blue-600 text-white px-6 py-2 rounded font-semibold"
        >
          {busy ? "Running…" : "Run reconciliation"}
        </button>
      </div>

      {tab === "stock" && stock && (
        <>
          {stock.some((r) => !r.hasDip) && (
            <Alert type="warn">Some tanks have no dip for this date.</Alert>
          )}
          <Table
            columns={[
              { key: "tank_name", label: "Tank" },
              { key: "opening", label: "Opening", align: "right", render: (r) => r.opening.toFixed(2) },
              { key: "deliveries", label: "+ Deliv.", align: "right", render: (r) => r.deliveries.toFixed(2) },
              { key: "sold", label: "− Sold", align: "right", render: (r) => r.sold.toFixed(2) },
              { key: "expected", label: "Expected", align: "right", render: (r) => r.expected.toFixed(2) },
              { key: "actual", label: "Actual", align: "right", render: (r) => r.actual.toFixed(2) },
              { key: "variance", label: "Variance", align: "right", render: (r) => `${r.variance > 0 ? "+" : ""}${r.variance.toFixed(2)}` },
              { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            ]}
            rows={stock}
          />
          <p className="text-xs text-slate-500 mt-3">
            Expected = Opening + Deliveries − Litres sold · Variance = Actual − Expected
          </p>
        </>
      )}

      {tab === "cash" && cash && (
        <>
          <Table
            columns={[
              { key: "cashIn", label: "Cash", align: "right", render: (r) => money(r.cashIn) },
              { key: "mpesaIn", label: "M-Pesa", align: "right", render: (r) => money(r.mpesaIn) },
              { key: "cardIn", label: "Card", align: "right", render: (r) => money(r.cardIn) },
              { key: "expected", label: "Expected sales", align: "right", render: (r) => money(r.expected) },
              { key: "actual", label: "Actual received", align: "right", render: (r) => money(r.actual) },
              { key: "variance", label: "Variance", align: "right", render: (r) => money(r.variance) },
            ]}
            rows={[cash]}
          />
          <p className="text-xs text-slate-500 mt-3">
            Reconciliation date: {dateFmt(date)}
          </p>
        </>
      )}
    </div>
  );
}