import { useEffect, useState } from "react";
import {
  listReadings,
  createReading,
  listPumps,
  listDips,
  createDip,
  listTanks,
  listDeliveries,
  createDelivery,
  listSuppliers,
} from "../api";
import { Alert } from "../components/ui";

export default function Readings() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [pumps, setPumps] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState("");

  // Forms state
  const [pumpForm, setPumpForm] = useState({ pump_id: 1, opening_meter: "", closing_meter: "", unit_price: 205 });
  const [dipForm, setDipForm] = useState({ tank_id: 1, opening_litres: "", closing_litres: "" });
  const [delForm, setDelForm] = useState({ tank_id: 1, supplier_id: 1, litres_received: "", delivery_note_no: "" });

  useEffect(() => {
    listPumps().then(setPumps);
    listTanks().then(setTanks);
    listSuppliers().then(setSuppliers);
  }, []);

  // --- Handlers ---
  async function savePump(e) {
    e.preventDefault();
    const litres = Number(pumpForm.closing_meter) - Number(pumpForm.opening_meter);
    if (litres < 0) return alert("Closing meter cannot be less than opening meter.");
    
    await createReading({
      ...pumpForm,
      reading_date: date,
      pump_id: Number(pumpForm.pump_id),
      opening_meter: Number(pumpForm.opening_meter),
      closing_meter: Number(pumpForm.closing_meter),
      unit_price: Number(pumpForm.unit_price),
    });
    setMessage("Pump reading saved successfully!");
    setPumpForm({ ...pumpForm, opening_meter: "", closing_meter: "" });
  }

  async function saveDip(e) {
    e.preventDefault();
    await createDip({
      ...dipForm,
      dip_date: date,
      tank_id: Number(dipForm.tank_id),
      opening_litres: Number(dipForm.opening_litres),
      closing_litres: Number(dipForm.closing_litres),
    });
    setMessage("Tank dip saved successfully!");
    setDipForm({ ...dipForm, opening_litres: "", closing_litres: "" });
  }

  async function saveDelivery(e) {
    e.preventDefault();
    await createDelivery({
      ...delForm,
      delivery_date: date,
      tank_id: Number(delForm.tank_id),
      supplier_id: Number(delForm.supplier_id),
      litres_received: Number(delForm.litres_received),
    });
    setMessage("Delivery saved successfully!");
    setDelForm({ ...delForm, litres_received: "", delivery_note_no: "" });
  }

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daily Data Entry</h1>
        <div>
          <label className="text-sm font-semibold mr-2">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded px-3 py-1.5"
          />
        </div>
      </div>

      {message && <Alert type="success">{message}</Alert>}

      <div className="space-y-6">
        {/* 1. PUMP METERS */}
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
          <h2 className="text-lg font-bold mb-4">1. Pump Meters (Sales)</h2>
          <form onSubmit={savePump} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Select Pump</label>
              <select
                value={pumpForm.pump_id}
                onChange={(e) => setPumpForm({ ...pumpForm, pump_id: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                {pumps.map((p) => <option key={p.pump_id} value={p.pump_id}>{p.pump_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Opening Meter</label>
              <input
                type="number" step="0.01" required
                value={pumpForm.opening_meter}
                onChange={(e) => setPumpForm({ ...pumpForm, opening_meter: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. 50000"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Closing Meter</label>
              <input
                type="number" step="0.01" required
                value={pumpForm.closing_meter}
                onChange={(e) => setPumpForm({ ...pumpForm, closing_meter: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. 50450"
              />
            </div>
            <div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded py-2">
                Save Meter
              </button>
            </div>
          </form>
        </div>

        {/* 2. TANK DIPS */}
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
          <h2 className="text-lg font-bold mb-4">2. Tank Dips (Physical Stock)</h2>
          <form onSubmit={saveDip} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Select Tank</label>
              <select
                value={dipForm.tank_id}
                onChange={(e) => setDipForm({ ...dipForm, tank_id: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                {tanks.map((t) => <option key={t.tank_id} value={t.tank_id}>{t.tank_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Opening Dip (Litres)</label>
              <input
                type="number" step="0.01" required
                value={dipForm.opening_litres}
                onChange={(e) => setDipForm({ ...dipForm, opening_litres: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. 10000"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Closing Dip (Litres)</label>
              <input
                type="number" step="0.01" required
                value={dipForm.closing_litres}
                onChange={(e) => setDipForm({ ...dipForm, closing_litres: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. 14550"
              />
            </div>
            <div>
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded py-2">
                Save Dip
              </button>
            </div>
          </form>
        </div>

        {/* 3. DELIVERIES */}
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-amber-500">
          <h2 className="text-lg font-bold mb-4">3. Fuel Deliveries</h2>
          <form onSubmit={saveDelivery} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Tank</label>
              <select
                value={delForm.tank_id}
                onChange={(e) => setDelForm({ ...delForm, tank_id: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                {tanks.map((t) => <option key={t.tank_id} value={t.tank_id}>{t.tank_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Supplier</label>
              <select
                value={delForm.supplier_id}
                onChange={(e) => setDelForm({ ...delForm, supplier_id: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                {suppliers.map((s) => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Litres Received</label>
              <input
                type="number" step="0.01" required
                value={delForm.litres_received}
                onChange={(e) => setDelForm({ ...delForm, litres_received: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. 5000"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Delivery Note</label>
              <input
                type="text" required
                value={delForm.delivery_note_no}
                onChange={(e) => setDelForm({ ...delForm, delivery_note_no: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. DN-1001"
              />
            </div>
            <div>
              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded py-2">
                Save Delivery
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}