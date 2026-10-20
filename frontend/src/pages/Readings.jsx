import { useEffect, useState } from "react";
import { listPumps, listTanks, listSuppliers, listFuelTypes, listReadings, listDips, createReading, createDip, createDelivery, listPrices } from "../api";
import { Alert } from "../components/ui";

export default function Readings() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [pumps, setPumps] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [fuels, setFuels] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [prices, setPrices] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Forms state
  const [pumpForm, setPumpForm] = useState({ pump_id: "", opening_meter: "", closing_meter: "", unit_price: "" });
  const [dipForm, setDipForm] = useState({ tank_id: "", opening_litres: "", closing_litres: "" });
  const [delForm, setDelForm] = useState({ tank_id: "", supplier_id: "", litres_received: "", delivery_note_no: "" });

  // Load master data
  useEffect(() => {
    listPumps().then(setPumps);
    listTanks().then(setTanks);
    listFuelTypes().then(setFuels);
    listSuppliers().then(setSuppliers);
    listPrices().then(setPrices);
  }, []);

  // Smart Auto-Fill: When a pump or date changes, fetch the latest reading to auto-fill opening
  useEffect(() => {
    if (pumpForm.pump_id && date) {
      // 1. Auto-fill Price
      const pumpObj = pumps.find(p => p.pump_id === Number(pumpForm.pump_id));
      if (pumpObj) {
        const tankObj = tanks.find(t => t.tank_id === pumpObj.tank_id);
        const priceObj = prices.find(p => p.fuel_type_id === tankObj?.fuel_type_id);
        if (priceObj) setPumpForm(prev => ({ ...prev, unit_price: priceObj.price_per_litre }));
      }

      // 2. Auto-fill Opening Meter from most recent past reading
      listReadings().then(readings => {
        // Find readings for this pump before the selected date
        const past = readings.filter(r => r.pump_id === Number(pumpForm.pump_id) && r.reading_date < date)
                             .sort((a, b) => new Date(b.reading_date) - new Date(a.reading_date));
        if (past.length > 0) {
          setPumpForm(prev => ({ ...prev, opening_meter: past[0].closing_meter }));
        }
      });
    }
  }, [pumpForm.pump_id, date, pumps, tanks, prices]);

  // Smart Auto-Fill for Tank Dips
  useEffect(() => {
    if (dipForm.tank_id && date) {
      listDips().then(dips => {
        const past = dips.filter(d => d.tank_id === Number(dipForm.tank_id) && d.dip_date < date)
                         .sort((a, b) => new Date(b.dip_date) - new Date(a.dip_date));
        if (past.length > 0) {
          setDipForm(prev => ({ ...prev, opening_litres: past[0].closing_litres }));
        }
      });
    }
  }, [dipForm.tank_id, date]);

  function getTankLabel(tank) {
    const fuel = fuels.find((f) => f.fuel_type_id === tank.fuel_type_id);
    return `${tank.tank_name} (${fuel ? fuel.name : "Unknown"})`;
  }

  // --- Handlers ---
  async function savePump(e) {
    e.preventDefault();
    setError(""); setMessage("");
    const litres = Number(pumpForm.closing_meter) - Number(pumpForm.opening_meter);
    if (litres < 0) return setError("Validation Error: Closing meter cannot be less than opening meter.");
    
    await createReading({
      ...pumpForm, reading_date: date,
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
    setError(""); setMessage("");
    if (Number(dipForm.closing_litres) < 0) return setError("Validation Error: Closing dip cannot be negative.");
    
    await createDip({
      ...dipForm, dip_date: date,
      tank_id: Number(dipForm.tank_id),
      opening_litres: Number(dipForm.opening_litres),
      closing_litres: Number(dipForm.closing_litres),
    });
    setMessage("Tank dip saved successfully!");
    setDipForm({ ...dipForm, opening_litres: "", closing_litres: "" });
  }

  async function saveDelivery(e) {
    e.preventDefault();
    setError(""); setMessage("");
    await createDelivery({
      ...delForm, delivery_date: date,
      tank_id: Number(delForm.tank_id),
      supplier_id: Number(delForm.supplier_id),
      litres_received: Number(delForm.litres_received),
    });
    setMessage("Delivery saved successfully!");
    setDelForm({ ...delForm, litres_received: "", delivery_note_no: "" });
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daily Data Entry</h1>
          <p className="text-slate-500 text-sm mt-1">Record meter readings, physical dips, and fuel deliveries.</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mr-2">Business Date:</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border-slate-300 border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <div className="space-y-8">
        {/* PUMP METERS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-blue-600 rounded"></div>
            <h2 className="text-lg font-bold text-slate-800">1. Pump Meters (Sales)</h2>
          </div>
          <form onSubmit={savePump} className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Select Pump</label>
              <select value={pumpForm.pump_id} onChange={(e) => setPumpForm({ ...pumpForm, pump_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" required>
                <option value="">-- Choose Pump --</option>
                {pumps.map((p) => <option key={p.pump_id} value={p.pump_id}>{p.pump_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Opening Meter</label>
              <input type="number" step="0.01" required value={pumpForm.opening_meter} onChange={(e) => setPumpForm({ ...pumpForm, opening_meter: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Closing Meter</label>
              <input type="number" step="0.01" required value={pumpForm.closing_meter} onChange={(e) => setPumpForm({ ...pumpForm, closing_meter: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" placeholder="0.00" />
            </div>
            <div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2.5 shadow-sm transition">Save Reading</button>
            </div>
          </form>
        </div>

        {/* TANK DIPS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-emerald-500 rounded"></div>
            <h2 className="text-lg font-bold text-slate-800">2. Tank Dips (Physical Stock)</h2>
          </div>
          <form onSubmit={saveDip} className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Select Tank</label>
              <select value={dipForm.tank_id} onChange={(e) => setDipForm({ ...dipForm, tank_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" required>
                <option value="">-- Choose Tank --</option>
                {tanks.map((t) => <option key={t.tank_id} value={t.tank_id}>{getTankLabel(t)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Opening Dip (L)</label>
              <input type="number" step="0.01" required value={dipForm.opening_litres} onChange={(e) => setDipForm({ ...dipForm, opening_litres: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Closing Dip (L)</label>
              <input type="number" step="0.01" required value={dipForm.closing_litres} onChange={(e) => setDipForm({ ...dipForm, closing_litres: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" placeholder="0.00" />
            </div>
            <div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg py-2.5 shadow-sm transition">Save Dip</button>
            </div>
          </form>
        </div>

        {/* DELIVERIES */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-amber-500 rounded"></div>
            <h2 className="text-lg font-bold text-slate-800">3. Fuel Deliveries</h2>
          </div>
          <form onSubmit={saveDelivery} className="grid grid-cols-1 md:grid-cols-5 gap-5 items-end">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Tank</label>
              <select value={delForm.tank_id} onChange={(e) => setDelForm({ ...delForm, tank_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" required>
                <option value="">-- Choose --</option>
                {tanks.map((t) => <option key={t.tank_id} value={t.tank_id}>{getTankLabel(t)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Supplier</label>
              <select value={delForm.supplier_id} onChange={(e) => setDelForm({ ...delForm, supplier_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" required>
                <option value="">-- Choose --</option>
                {suppliers.map((s) => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Litres (L)</label>
              <input type="number" step="0.01" required value={delForm.litres_received} onChange={(e) => setDelForm({ ...delForm, litres_received: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Delivery Note</label>
              <input type="text" required value={delForm.delivery_note_no} onChange={(e) => setDelForm({ ...delForm, delivery_note_no: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" placeholder="DN-1024" />
            </div>
            <div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg py-2.5 shadow-sm transition">Save Delivery</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}