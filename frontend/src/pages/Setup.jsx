import { useEffect, useState } from "react";
import { listFuelTypes, listPrices, listTanks, listPumps } from "../api";
import { Table } from "../components/ui";

export default function Setup() {
  const [tab, setTab] = useState("prices");
  const [fuels, setFuels] = useState([]);

  useEffect(() => {
    // Load fuel types once so we can translate the IDs to names
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
              tab === k ? "bg-blue-600 text-white" : "bg-white shadow"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      
      {tab === "prices" && <PricesTab getFuelName={getFuelName} />}
      {tab === "tanks" && <TanksTab getFuelName={getFuelName} />}
      {tab === "pumps" && <PumpsTab getFuelName={getFuelName} />}
      {tab === "fuel" && <FuelTab fuels={fuels} />}
    </div>
  );
}

function PricesTab({ getFuelName }) {
  const [rows, setRows] = useState([]);
  useEffect(() => { listPrices().then(setRows); }, []);
  return (
    <Table
      columns={[
        { key: "price_id", label: "ID" },
        { key: "fuel_type_id", label: "Fuel Type", render: (r) => getFuelName(r.fuel_type_id) },
        { key: "price_per_litre", label: "Price/L", align: "right", render: (r) => `KES ${Number(r.price_per_litre).toFixed(2)}` },
        { key: "effective_from", label: "Effective from" },
      ]}
      rows={rows}
    />
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