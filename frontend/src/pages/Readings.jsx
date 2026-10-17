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
  dateFmt,
} from "../api";
import { Table } from "../components/ui";

export default function Readings() {
  const [tab, setTab] = useState("pump");
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Record Readings</h1>
      <div className="flex gap-2 mb-6">
        {[
          ["pump", "Pump meters"],
          ["dip", "Tank dips"],
          ["del", "Fuel deliveries"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              tab === k ? "bg-blue-600 text-white" : "bg-white shadow"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "pump" && <PumpTab />}
      {tab === "dip" && <DipTab />}
      {tab === "del" && <DeliveryTab />}
    </div>
  );
}

function PumpTab() {
  const [rows, setRows] = useState([]);
  const [pumps, setPumps] = useState([]);
  const [form, setForm] = useState({
    pump_id: 1,
    reading_date: new Date().toISOString().slice(0, 10),
    opening_meter: "",
    closing_meter: "",
    unit_price: 205,
  });

  const litres =
    Number(form.closing_meter) - Number(form.opening_meter);
  const sales = litres > 0 ? litres * Number(form.unit_price) : 0;

  const load = () => listReadings().then(setRows);
  useEffect(() => {
    load();
    listPumps().then(setPumps);
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (litres < 0) return alert("Closing meter must be >= opening meter");
    await createReading({
      ...form,
      pump_id: Number(form.pump_id),
      opening_meter: Number(form.opening_meter),
      closing_meter: Number(form.closing_meter),
      unit_price: Number(form.unit_price),
    });
    setForm({ ...form, opening_meter: "", closing_meter: "" });
    load();
  }

  return (
    <>
      <form onSubmit={submit} className="bg-white rounded-lg shadow p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-slate-600">Pump</label>
            <select
              value={form.pump_id}
              onChange={(e) => setForm({ ...form, pump_id: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              {pumps.map((p) => (
                <option key={p.pump_id} value={p.pump_id}>
                  {p.pump_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600">Date</label>
            <input
              type="date"
              value={form.reading_date}
              onChange={(e) => setForm({ ...form, reading_date: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Opening meter</label>
            <input
              type="number"
              step="0.01"
              value={form.opening_meter}
              onChange={(e) => setForm({ ...form, opening_meter: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Closing meter</label>
            <input
              type="number"
              step="0.01"
              value={form.closing_meter}
              onChange={(e) => setForm({ ...form, closing_meter: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">
              Litres dispensed: {litres > 0 ? litres.toFixed(2) : 0}
            </span>
            <span className="mx-2">•</span>
            Price: KES {Number(form.unit_price).toFixed(2)}/L
            <span className="mx-2">•</span>
            <span className="text-blue-700 font-semibold">
              Sales: KES {sales.toLocaleString()}
            </span>
          </p>
          <button className="bg-blue-600 text-white px-5 py-2 rounded font-semibold">
            Save reading
          </button>
        </div>
      </form>

      <h2 className="font-semibold text-slate-800 mb-2">Recent readings</h2>
      <Table
        columns={[
          { key: "reading_date", label: "Date", render: (r) => dateFmt(r.reading_date) },
          { key: "pump_id", label: "Pump", render: (r) => `Pump ${r.pump_id}` },
          { key: "opening_meter", label: "Opening", align: "right", render: (r) => Number(r.opening_meter).toFixed(2) },
          { key: "closing_meter", label: "Closing", align: "right", render: (r) => Number(r.closing_meter).toFixed(2) },
          { key: "litres_dispensed", label: "Litres", align: "right", render: (r) => Number(r.litres_dispensed).toFixed(2) },
          { key: "sales_value", label: "Sales (KES)", align: "right", render: (r) => Number(r.sales_value).toLocaleString() },
        ]}
        rows={rows}
      />
    </>
  );
}

function DipTab() {
  const [rows, setRows] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [form, setForm] = useState({
    tank_id: 1,
    dip_date: new Date().toISOString().slice(0, 10),
    opening_litres: "",
    closing_litres: "",
  });

  const load = () => listDips().then(setRows);
  useEffect(() => {
    load();
    listTanks().then(setTanks);
  }, []);

  async function submit(e) {
    e.preventDefault();
    await createDip({
      ...form,
      tank_id: Number(form.tank_id),
      opening_litres: Number(form.opening_litres),
      closing_litres: Number(form.closing_litres),
    });
    setForm({ ...form, opening_litres: "", closing_litres: "" });
    load();
  }

  return (
    <>
      <form onSubmit={submit} className="bg-white rounded-lg shadow p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-slate-600">Tank</label>
            <select
              value={form.tank_id}
              onChange={(e) => setForm({ ...form, tank_id: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              {tanks.map((t) => (
                <option key={t.tank_id} value={t.tank_id}>
                  {t.tank_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600">Date</label>
            <input
              type="date"
              value={form.dip_date}
              onChange={(e) => setForm({ ...form, dip_date: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Opening litres</label>
            <input
              type="number"
              step="0.01"
              value={form.opening_litres}
              onChange={(e) => setForm({ ...form, opening_litres: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Closing litres</label>
            <input
              type="number"
              step="0.01"
              value={form.closing_litres}
              onChange={(e) => setForm({ ...form, closing_litres: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button className="bg-blue-600 text-white px-5 py-2 rounded font-semibold">
            Save dip
          </button>
        </div>
      </form>

      <h2 className="font-semibold text-slate-800 mb-2">Recent dips</h2>
      <Table
        columns={[
          { key: "dip_date", label: "Date", render: (r) => dateFmt(r.dip_date) },
          { key: "tank_id", label: "Tank", render: (r) => `Tank ${r.tank_id}` },
          { key: "opening_litres", label: "Opening (L)", align: "right", render: (r) => Number(r.opening_litres).toFixed(2) },
          { key: "closing_litres", label: "Closing (L)", align: "right", render: (r) => Number(r.closing_litres).toFixed(2) },
        ]}
        rows={rows}
      />
    </>
  );
}

function DeliveryTab() {
  const [rows, setRows] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    tank_id: 1,
    supplier_id: 1,
    delivery_date: new Date().toISOString().slice(0, 10),
    litres_received: "",
    delivery_note_no: "",
  });

  const load = () => listDeliveries().then(setRows);
  useEffect(() => {
    load();
    listTanks().then(setTanks);
    listSuppliers().then(setSuppliers);
  }, []);

  async function submit(e) {
    e.preventDefault();
    await createDelivery({
      ...form,
      tank_id: Number(form.tank_id),
      supplier_id: Number(form.supplier_id),
      litres_received: Number(form.litres_received),
    });
    setForm({ ...form, litres_received: "", delivery_note_no: "" });
    load();
  }

  return (
    <>
      <form onSubmit={submit} className="bg-white rounded-lg shadow p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-sm text-slate-600">Tank</label>
            <select
              value={form.tank_id}
              onChange={(e) => setForm({ ...form, tank_id: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              {tanks.map((t) => (
                <option key={t.tank_id} value={t.tank_id}>
                  {t.tank_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600">Supplier</label>
            <select
              value={form.supplier_id}
              onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              {suppliers.map((s) => (
                <option key={s.supplier_id} value={s.supplier_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600">Date</label>
            <input
              type="date"
              value={form.delivery_date}
              onChange={(e) => setForm({ ...form, delivery_date: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Litres received</label>
            <input
              type="number"
              step="0.01"
              value={form.litres_received}
              onChange={(e) => setForm({ ...form, litres_received: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Delivery note</label>
            <input
              value={form.delivery_note_no}
              onChange={(e) => setForm({ ...form, delivery_note_no: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button className="bg-blue-600 text-white px-5 py-2 rounded font-semibold">
            Save delivery
          </button>
        </div>
      </form>

      <h2 className="font-semibold text-slate-800 mb-2">Recent deliveries</h2>
      <Table
        columns={[
          { key: "delivery_date", label: "Date", render: (r) => dateFmt(r.delivery_date) },
          { key: "tank_id", label: "Tank", render: (r) => `Tank ${r.tank_id}` },
          { key: "supplier_id", label: "Supplier", render: (r) => `Supplier ${r.supplier_id}` },
          { key: "litres_received", label: "Litres", align: "right", render: (r) => Number(r.litres_received).toFixed(2) },
          { key: "delivery_note_no", label: "Note" },
        ]}
        rows={rows}
      />
    </>
  );
}