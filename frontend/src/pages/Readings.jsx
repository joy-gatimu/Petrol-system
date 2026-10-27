import { useEffect, useState } from "react";
import {
  listPumps, listTanks, listSuppliers, listFuelTypes, listPrices,
  listReadings, createReading, listDips, createDip,
  listDeliveries, createDelivery, deleteReading, deleteDip, deleteDelivery,
  getLastPumpReading
} from "../api";
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

  const [pumpForm, setPumpForm] = useState({ pump_id: "", opening_meter: "", closing_meter: "", unit_price: "" });
  const [dipForm, setDipForm] = useState({ tank_id: "", opening_litres: "", closing_litres: "" });
  const [delForm, setDelForm] = useState({ tank_id: "", supplier_id: "", litres_received: "", delivery_note_no: "" });

  const [todaysReadings, setTodaysReadings] = useState([]);
  const [todaysDips, setTodaysDips] = useState([]);
  const [todaysDeliveries, setTodaysDeliveries] = useState([]);

  useEffect(() => {
    listPumps().then(setPumps);
    listTanks().then(setTanks);
    listFuelTypes().then(setFuels);
    listSuppliers().then(setSuppliers);
    listPrices().then(setPrices);
  }, []);

  const loadLogs = () => {
    listReadings({ date }).then(setTodaysReadings);
    listDips({ date }).then(setTodaysDips);
    listDeliveries({ date }).then(setTodaysDeliveries);
  };

  useEffect(() => {
    loadLogs();
  }, [date]);

  // SMART AUTO-FILL FOR PUMP METERS
  useEffect(() => {
    if (pumpForm.pump_id) {
      const pumpIdNum = Number(pumpForm.pump_id);
      const pumpObj = pumps.find(p => p.pump_id === pumpIdNum);
      
      if (pumpObj) {
        const tankObj = tanks.find(t => t.tank_id === pumpObj.tank_id);
        const priceObj = prices.find(p => p.fuel_type_id === tankObj?.fuel_type_id);
        if (priceObj) setPumpForm(prev => ({ ...prev, unit_price: priceObj.price_per_litre }));
      }

      getLastPumpReading(pumpIdNum, date).then(res => {
        setPumpForm(prev => ({ ...prev, opening_meter: res.closing_meter }));
      });
    }
  }, [pumpForm.pump_id, date, pumps, tanks, prices]);

  // SMART AUTO-FILL FOR TANK DIPS
  useEffect(() => {
    if (dipForm.tank_id && date) {
      const tankIdNum = Number(dipForm.tank_id);
      const tankObj = tanks.find(t => t.tank_id === tankIdNum);
      
      listDips().then(dips => {
        const past = dips.filter(d => d.tank_id === tankIdNum && d.dip_date < date)
                         .sort((a, b) => new Date(b.dip_date) - new Date(a.dip_date));
        
        let openingVal = 0;
        if (past.length > 0) {
          openingVal = Number(past[0].closing_litres);
        } else if (tankObj) {
          openingVal = Number(tankObj.capacity_litres);
        }

        listReadings({ date }).then(readings => {
          if (tankObj) {
            const pumpIds = pumps.filter(p => p.tank_id === tankObj.tank_id).map(p => p.pump_id);
            const totalSold = readings.filter(r => pumpIds.includes(r.pump_id))
                                      .reduce((sum, r) => sum + Number(r.litres_dispensed), 0);
            
            const expectedClosing = openingVal - totalSold;

            setDipForm(prev => ({ 
              ...prev, 
              opening_litres: openingVal, 
              closing_litres: expectedClosing > 0 ? expectedClosing : 0 
            }));
          }
        });
      });
    }
  }, [dipForm.tank_id, date, pumps, tanks, todaysReadings]);

  function getTankLabel(tank) {
    const fuel = fuels.find((f) => f.fuel_type_id === tank.fuel_type_id);
    return `${tank.tank_name} (${fuel ? fuel.name : "Unknown"})`;
  }

  // Helper to get the right placeholder for the pump
  function getPumpPlaceholder(pumpId) {
    if (pumpId === "1") return "e.g. 15500";
    if (pumpId === "2") return "e.g. 10400";
    if (pumpId === "3") return "e.g. 5150";
    return "Enter closing meter";
  }

  // Helper to get the right placeholder for the tank
  function getTankPlaceholder(tankId) {
    if (tankId === "1") return "e.g. 14490";
    if (tankId === "2") return "e.g. 24500";
    if (tankId === "3") return "e.g. 9850";
    return "Enter closing dip";
  }

  async function savePump(e) {
    e.preventDefault(); setError(""); setMessage("");
    const litres = Number(pumpForm.closing_meter) - Number(pumpForm.opening_meter);
    if (litres < 0) return setError("Closing meter cannot be less than opening meter.");
    
    await createReading({
      ...pumpForm, reading_date: date, pump_id: Number(pumpForm.pump_id),
      opening_meter: Number(pumpForm.opening_meter), closing_meter: Number(pumpForm.closing_meter), unit_price: Number(pumpForm.unit_price),
    });
    setMessage("Pump reading saved successfully!");
    setPumpForm({ ...pumpForm, opening_meter: "", closing_meter: "" });
    loadLogs();
  }

  async function saveDip(e) {
    e.preventDefault(); setError(""); setMessage("");
    const openNum = Number(dipForm.opening_litres);
    const closeNum = Number(dipForm.closing_litres);
    if (closeNum < 0) return setError("Closing dip cannot be negative.");
    
    await createDip({
      tank_id: Number(dipForm.tank_id), dip_date: date,
      opening_litres: openNum, closing_litres: closeNum,
    });
    setMessage("Tank dip saved successfully!");
    setDipForm({ ...dipForm, opening_litres: "", closing_litres: "" });
    loadLogs();
  }

  async function saveDelivery(e) {
    e.preventDefault(); setError(""); setMessage("");
    await createDelivery({
      ...delForm, delivery_date: date, tank_id: Number(delForm.tank_id),
      supplier_id: Number(delForm.supplier_id), litres_received: Number(delForm.litres_received),
    });
    setMessage("Delivery saved successfully!");
    setDelForm({ ...delForm, litres_received: "", delivery_note_no: "" });
    loadLogs();
  }

  async function handleDeletePump(id) {
    if (!window.confirm("Are you sure you want to delete this reading?")) return;
    await deleteReading(id);
    setMessage("Reading deleted.");
    loadLogs();
  }
  async function handleDeleteDip(id) {
    if (!window.confirm("Are you sure you want to delete this dip?")) return;
    await deleteDip(id);
    setMessage("Dip deleted.");
    loadLogs();
  }
  async function handleDeleteDelivery(id) {
    if (!window.confirm("Are you sure you want to delete this delivery?")) return;
    await deleteDelivery(id);
    setMessage("Delivery deleted.");
    loadLogs();
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daily Data Entry</h1>
          <p className="text-slate-500 text-sm mt-1">Record today's meters, dips, and deliveries.</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mr-2">Date:</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border-slate-300 border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <div className="space-y-8">
        {/* 1. PUMP METERS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-blue-600 rounded"></div>
            <h2 className="text-lg font-bold text-slate-800">1. Meter Readings (Fuel Out)</h2>
          </div>
          <form onSubmit={savePump} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Pump</label>
              <select value={pumpForm.pump_id} onChange={(e) => setPumpForm({ ...pumpForm, pump_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" required>
                <option value="">-- Choose Pump --</option>
                {pumps.map((p) => <option key={p.pump_id} value={p.pump_id}>{p.pump_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Opening Meter (Read-only)</label>
              <div className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-100 text-slate-500 font-medium cursor-not-allowed">
                {pumpForm.opening_meter || "Select a pump first"}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Closing Meter</label>
              <input type="number" step="0.01" required value={pumpForm.closing_meter} onChange={(e) => setPumpForm({ ...pumpForm, closing_meter: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" placeholder={getPumpPlaceholder(pumpForm.pump_id)} />
            </div>
            <div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2.5">Save Reading</button>
            </div>
          </form>

          {todaysReadings.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-bold text-slate-600 mb-2">Today's Logged Readings</h3>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Pump</th>
                    <th className="px-3 py-2">Opening</th>
                    <th className="px-3 py-2">Closing</th>
                    <th className="px-3 py-2">Litres</th>
                    <th className="px-3 py-2">Sales (KES)</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todaysReadings.map((r) => (
                    <tr key={r.reading_id} className="border-b">
                      <td className="px-3 py-2">Pump {r.pump_id}</td>
                      <td className="px-3 py-2">{Number(r.opening_meter).toFixed(2)}</td>
                      <td className="px-3 py-2">{Number(r.closing_meter).toFixed(2)}</td>
                      <td className="px-3 py-2">{Number(r.litres_dispensed).toFixed(2)}</td>
                      <td className="px-3 py-2">{Number(r.sales_value).toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => handleDeletePump(r.reading_id)} className="text-red-500 hover:text-red-700 font-semibold text-xs">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 2. TANK DIPS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-emerald-500 rounded"></div>
            <h2 className="text-lg font-bold text-slate-800">2. Tank Dips (Physical Stock)</h2>
          </div>
          <form onSubmit={saveDip} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Tank</label>
              <select value={dipForm.tank_id} onChange={(e) => setDipForm({ ...dipForm, tank_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" required>
                <option value="">-- Choose Tank --</option>
                {tanks.map((t) => <option key={t.tank_id} value={t.tank_id}>{getTankLabel(t)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Opening Dip (Read-only)</label>
              <div className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-100 text-slate-500 font-medium cursor-not-allowed">
                {dipForm.opening_litres || "Select a tank first"}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Closing Dip (L)</label>
              <input type="number" step="0.01" required value={dipForm.closing_litres} onChange={(e) => setDipForm({ ...dipForm, closing_litres: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" placeholder={getTankPlaceholder(dipForm.tank_id)} />
            </div>
            <div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg py-2.5">Save Dip</button>
            </div>
          </form>

          {todaysDips.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-bold text-slate-600 mb-2">Today's Logged Dips</h3>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Tank</th>
                    <th className="px-3 py-2">Opening</th>
                    <th className="px-3 py-2">Closing</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todaysDips.map((d) => (
                    <tr key={d.dip_id} className="border-b">
                      <td className="px-3 py-2">Tank {d.tank_id}</td>
                      <td className="px-3 py-2">{Number(d.opening_litres).toFixed(2)}</td>
                      <td className="px-3 py-2">{Number(d.closing_litres).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => handleDeleteDip(d.dip_id)} className="text-red-500 hover:text-red-700 font-semibold text-xs">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. DELIVERIES */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-amber-500 rounded"></div>
            <h2 className="text-lg font-bold text-slate-800">3. Fuel Deliveries (Fuel In)</h2>
          </div>
          <form onSubmit={saveDelivery} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Tank</label>
              <select value={delForm.tank_id} onChange={(e) => setDelForm({ ...delForm, tank_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" required>
                <option value="">-- Choose --</option>
                {tanks.map((t) => <option key={t.tank_id} value={t.tank_id}>{getTankLabel(t)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Supplier</label>
              <select value={delForm.supplier_id} onChange={(e) => setDelForm({ ...delForm, supplier_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" required>
                <option value="">-- Choose --</option>
                {suppliers.map((s) => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Litres</label>
              <input type="number" step="0.01" required value={delForm.litres_received} onChange={(e) => setDelForm({ ...delForm, litres_received: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50" placeholder="e.g. 2000" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Note/Receipt</label>
              <input type="text" required value={delForm.delivery_note_no} onChange={(e) => setDelForm({ ...delForm, delivery_note_no: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50" placeholder="e.g. DN-001" />
            </div>
            <div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg py-2.5">Save Delivery</button>
            </div>
          </form>

          {todaysDeliveries.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-bold text-slate-600 mb-2">Today's Logged Deliveries</h3>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Tank</th>
                    <th className="px-3 py-2">Supplier</th>
                    <th className="px-3 py-2">Litres</th>
                    <th className="px-3 py-2">Note</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todaysDeliveries.map((d) => (
                    <tr key={d.delivery_id} className="border-b">
                      <td className="px-3 py-2">Tank {d.tank_id}</td>
                      <td className="px-3 py-2">Supplier {d.supplier_id}</td>
                      <td className="px-3 py-2">{Number(d.litres_received).toFixed(2)}</td>
                      <td className="px-3 py-2">{d.delivery_note_no}</td>
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => handleDeleteDelivery(d.delivery_id)} className="text-red-500 hover:text-red-700 font-semibold text-xs">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}