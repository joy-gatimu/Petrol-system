import { useEffect, useState } from "react";
import { listFuelTypes, listPrices, listTanks, listPumps } from "../api";
import { Table } from "../components/ui";

export default function Setup() {
  const [tab, setTab] = useState("prices");
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
              tab === k ? "bg-blue-600 text-white" : "bg-white shadow"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "prices" && <PricesTab />}
      {tab === "tanks" && <TanksTab />}
      {tab === "pumps" && <PumpsTab />}
      {tab === "fuel" && <FuelTab />}
    </div>
  );
}

function PricesTab() {
  const [rows, setRows] = useState([]);
  useEffect(() => { listPrices().then(setRows); }, []);
  return (
    <Table
      columns={[
        { key: "price_id", label: "ID" },
        { key: "fuel_type_id", label: "Fuel", render: (r) => `Fuel ${r.fuel_type_id}` },
        { key: "price_per_litre", label: "Price/L", align: "right", render: (r) => `KES ${Number(r.price_per_litre).toFixed(2)}` },
        { key: "effective_from", label: "Effective from" },
      ]}
      rows={rows}
    />
  );
}

function TanksTab() {
  const [rows, setRows] = useState([]);
  useEffect(() => { listTanks().then(setRows); }, []);
  return (
    <Table
      columns={[
        { key: "tank_id", label: "ID" },
        { key: "tank_name", label: "Name" },
        { key: "fuel_type_id", label: "Fuel", render: (r) => `Fuel ${r.fuel_type_id}` },
        { key: "capacity_litres", label: "Capacity (L)", align: "right", render: (r) => Number(r.capacity_litres).toLocaleString() },
        { key: "is_active", label: "Active", render: (r) => (r.is_active ? "Yes" : "No") },
      ]}
      rows={rows}
    />
  );
}

function PumpsTab() {
  const [rows, setRows] = useState([]);
  useEffect(() => { listPumps().then(setRows); }, []);
  return (
    <Table
      columns={[
        { key: "pump_id", label: "ID" },
        { key: "pump_name", label: "Name" },
        { key: "tank_id", label: "Tank", render: (r) => `Tank ${r.tank_id}` },
        { key: "is_active", label: "Active", render: (r) => (r.is_active ? "Yes" : "No") },
      ]}
      rows={rows}
    />
  );
}

function FuelTab() {
  const [rows, setRows] = useState([]);
  useEffect(() => { listFuelTypes().then(setRows); }, []);
  return (
    <Table
      columns={[
        { key: "fuel_type_id", label: "ID" },
        { key: "name", label: "Name" },
      ]}
      rows={rows}
    />
  );
}