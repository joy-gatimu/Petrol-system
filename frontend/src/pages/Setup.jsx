import { useEffect, useState } from "react";
import { listFuelTypes, listPrices, listTanks, listPumps, updatePrice } from "../api";
import { Table, Alert } from "../components/ui";

export default function Setup() {
  const [tab, setTab] = useState("prices");
  const [fuels, setFuels] = useState([]);

  useEffect(() => {
    listFuelTypes().then(setFuels);
  }, []);

  function getFuelName(id) {
    const fuel = fuels.find((f) => f.fuel_type_id === id);
    return fuel ? fuel.name : `Fuel ${id}`;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pumps, Tanks & Prices</h1>
      <div className="flex gap-2 mb-6">
        {[
          ["prices", "Prices"],
          ["tanks", "Tanks"],
          ["pumps", "Pumps"],
          ["fuel", "Fuel types"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              tab === k ? "bg-blue-600 text-white" : "bg-white shadow text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      
      {tab === "prices" && <PricesTab getFuelName={getFuelName} fuels={fuels} />}
      {tab === "tanks" && <TanksTab getFuelName={getFuelName} />}
      {tab === "pumps" && <PumpsTab getFuelName={getFuelName} />}
      {tab === "fuel" && <FuelTab fuels={fuels} />}
    </div>
  );
}

function PricesTab({ getFuelName, fuels }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ fuel_type_id: 1, price_per_litre: "", effective_from: new Date().toISOString().slice(0, 10) });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPrices = () => listPrices().then(setRows);

  useEffect(() => { loadPrices(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      await updatePrice(form);
      setMessage("Price updated successfully!");
      setForm({ ...form, price_per_litre: "" });
      loadPrices(); // Refresh list
    } catch (err) {
      setError("Error updating price: " + err.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* UPDATE PRICE FORM */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold mb-4 text-slate-800">Update Fuel Price</h2>
        
        {message && <Alert type="success">{message}</Alert>}
        {error && <Alert type="error">{error}</Alert>}
        
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Fuel Type</label>
            <select value={form.fuel_type_id} onChange={(e) => setForm({ ...form, fuel_type_id: Number(e.target.value) })} className="border border-slate-300 rounded-lg px-3 py-2" required>
              {fuels.map((f) => <option key={f.fuel_type_id} value={f.fuel_type_id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">New Price (KES/L)</label>
            <input type="number" step="0.01" required value={form.price_per_litre} onChange={(e) => setForm({ ...form, price_per_litre: e.target.value })} className="border border-slate-300 rounded-lg px-3 py-2" placeholder="e.g. 210" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Effective Date</label>
            <input type="date" required value={form.effective_from} onChange={(e) => setForm({ ...form, effective_from: e.target.value })} className="border border-slate-300 rounded-lg px-3 py-2" />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2.5 px-6">Update Price</button>
        </form>
      </div>

      {/* PRICE HISTORY TABLE */}
      <Table
        columns={[
          { key: "price_id", label: "ID" },
          { key: "fuel_type_id", label: "Fuel Type", render: (r) => getFuelName(r.fuel_type_id) },
          { key: "price_per_litre", label: "Price/L", align: "right", render: (r) => `KES ${Number(r.price_per_litre).toFixed(2)}` },
          { key: "effective_from", label: "Effective from" },
        ]}
        rows={rows}
      />
    </div>
  );
}

function TanksTab({ getFuelName }) {
  const [rows, setRows] = useState([]);
  useEffect(() => { listTanks().then(setRows); }, []);
  return (
    <Table
      columns={[
        { key: "tank_id", label: "ID" },
        { key: "tank_name", label: "Tank Name" },
        { key: "fuel_type_id", label: "Holds", render: (r) => getFuelName(r.fuel_type_id) },
        { key: "capacity_litres", label: "Capacity (L)", align: "right", render: (r) => Number(r.capacity_litres).toLocaleString() },
        { key: "is_active", label: "Active", render: (r) => (r.is_active ? "Yes" : "No") },
      ]}
      rows={rows}
    />
  );
}

function PumpsTab({ getFuelName }) {
  const [rows, setRows] = useState([]);
  const [tanks, setTanks] = useState([]);
  useEffect(() => { 
    listPumps().then(setRows); 
    listTanks().then(setTanks);
  }, []);

  function getTankName(id) {
    const t = tanks.find((x) => x.tank_id === id);
    return t ? t.tank_name : `Tank ${id}`;
  }

  return (
    <Table
      columns={[
        { key: "pump_id", label: "ID" },
        { key: "pump_name", label: "Pump Name" },
        { key: "tank_id", label: "Connected To", render: (r) => getTankName(r.tank_id) },
        { key: "is_active", label: "Active", render: (r) => (r.is_active ? "Yes" : "No") },
      ]}
      rows={rows}
    />
  );
}

function FuelTab({ fuels }) {
  return (
    <Table
      columns={[
        { key: "fuel_type_id", label: "ID" },
        { key: "name", label: "Fuel Name" },
      ]}
      rows={fuels}
    />
  );
}