import * as M from "./mockData";

const MOCK = true;
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export const saveToken = (t) => localStorage.setItem("ps_token", t);
export const getToken = () => localStorage.getItem("ps_token");
export const clearToken = () => localStorage.removeItem("ps_token");

export const money = (n) =>
  "KES " + Number(n || 0).toLocaleString("en-KE", { maximumFractionDigits: 0 });
export const litres = (n) => Number(n || 0).toLocaleString("en-KE") + " L";
export const dateFmt = (d) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

async function request(path, options = {}) {
  const res = await fetch("/api" + path, {
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: "Bearer " + getToken() } : {}),
    },
    ...options,
  });
  if (!res.ok) throw new Error((await res.json()).message || "Request failed");
  return res.json();
}

export async function login(username, password) {
  if (MOCK) {
    await delay();
    const u = M.users.find(
      (x) => x.username === username && x.password === password && x.is_active
    );
    if (!u) throw new Error("Invalid username or password");
    const { password: _p, ...safe } = u;
    return { token: "mock-token-" + u.user_id, user: safe };
  }
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function forgotPassword(username) {
  if (MOCK) {
    await delay();
    return { message: "Reset link sent (mock)" };
  }
  return request("/auth/forgot", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export async function resetPassword(token, password) {
  if (MOCK) {
    await delay();
    return { message: "Password reset (mock)" };
  }
  return request("/auth/reset", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export async function listFuelTypes() {
  return MOCK ? (await delay(), M.fuelTypes) : request("/master/fuel-types");
}
export async function listPrices() {
  return MOCK ? (await delay(), M.prices) : request("/master/prices");
}
export async function listTanks() {
  return MOCK ? (await delay(), M.tanks) : request("/master/tanks");
}
export async function listPumps() {
  return MOCK ? (await delay(), M.pumps) : request("/master/pumps");
}
export async function listSuppliers() {
  return MOCK ? (await delay(), M.suppliers) : request("/master/suppliers");
}

export async function listReadings({ date } = {}) {
  if (MOCK) {
    await delay();
    return date ? M.readings.filter((r) => r.reading_date === date) : M.readings;
  }
  return request("/readings" + (date ? `?date=${date}` : ""));
}

export async function createReading(payload) {
  if (MOCK) {
    await delay();
    const l = payload.closing_meter - payload.opening_meter;
    const rec = {
      reading_id: Date.now(),
      ...payload,
      litres_dispensed: l,
      sales_value: l * payload.unit_price,
    };
    M.readings.unshift(rec);
    return rec;
  }
  return request("/readings/pumps", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listDips({ date } = {}) {
  if (MOCK) {
    await delay();
    return date ? M.dips.filter((d) => d.dip_date === date) : M.dips;
  }
  return request("/readings/dips" + (date ? `?date=${date}` : ""));
}

export async function createDip(payload) {
  if (MOCK) {
    await delay();
    const rec = { dip_id: Date.now(), ...payload };
    M.dips.unshift(rec);
    return rec;
  }
  return request("/readings/dips", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listDeliveries({ date } = {}) {
  if (MOCK) {
    await delay();
    return date
      ? M.deliveries.filter((d) => d.delivery_date === date)
      : M.deliveries;
  }
  return request("/readings/deliveries" + (date ? `?date=${date}` : ""));
}

export async function createDelivery(payload) {
  if (MOCK) {
    await delay();
    const rec = { delivery_id: Date.now(), ...payload };
    M.deliveries.unshift(rec);
    return rec;
  }
  return request("/readings/deliveries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

function pumpsForTank(tankId) {
  return M.pumps.filter((p) => p.tank_id === tankId).map((p) => p.pump_id);
}

export async function runStockReconciliation(date) {
  if (!MOCK) return request("/reconciliation/stock?date=" + date, { method: "POST" });
  await delay();
  return M.tanks.map((tank) => {
    const dip = M.dips.find(
      (d) => d.tank_id === tank.tank_id && d.dip_date === date
    );
    const delivered = M.deliveries
      .filter((d) => d.tank_id === tank.tank_id && d.delivery_date === date)
      .reduce((s, d) => s + d.litres_received, 0);
    const sold = M.readings
      .filter(
        (r) =>
          pumpsForTank(tank.tank_id).includes(r.pump_id) &&
          r.reading_date === date
      )
      .reduce((s, r) => s + r.litres_dispensed, 0);
    const opening = dip?.opening_litres ?? 0;
    const actual = dip?.closing_litres ?? 0;
    const expected = opening + delivered - sold;
    const variance = actual - expected;
    const status =
      variance < -M.VARIANCE_TOLERANCE
        ? "shortage"
        : variance > M.VARIANCE_TOLERANCE
        ? "surplus"
        : "balanced";
    return {
      recon_date: date,
      tank_id: tank.tank_id,
      tank_name: tank.tank_name,
      opening,
      deliveries: delivered,
      sold,
      expected,
      actual,
      variance,
      status,
      hasDip: !!dip,
    };
  });
}

export async function runCashReconciliation(date) {
  if (!MOCK) return request("/cash/reconciliation?date=" + date, { method: "POST" });
  await delay();
  const sales = M.readings
    .filter((r) => r.reading_date === date)
    .reduce((s, r) => s + r.sales_value, 0);
  const cashIn = Math.round(sales * 0.55);
  const mpesaIn = Math.round(sales * 0.4);
  const cardIn = Math.round(sales * 0.04);
  const actual = cashIn + mpesaIn + cardIn;
  return {
    date,
    cashIn,
    mpesaIn,
    cardIn,
    expected: sales,
    actual,
    variance: actual - sales,
  };
}

export async function dailyReport(date) {
  if (!MOCK) return request("/reports/daily?date=" + date);
  return runStockReconciliation(date);
}

export async function monthlyReport(year, month) {
  if (!MOCK) return request(`/reports/monthly?year=${year}&month=${month}`);
  await delay();
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const rows = M.readings.filter((r) => r.reading_date.startsWith(prefix));
  return M.pumps.map((p) => {
    const rs = rows.filter((r) => r.pump_id === p.pump_id);
    return {
      pump: p.pump_name,
      litres: rs.reduce((s, r) => s + r.litres_dispensed, 0),
      sales: rs.reduce((s, r) => s + r.sales_value, 0),
    };
  });
}

export async function listUsers() {
  return MOCK
    ? (await delay(), M.users.map(({ password, ...u }) => u))
    : request("/users");
}

export async function listAuditLogs() {
  return MOCK ? (await delay(), M.auditLogs) : request("/audit");
}

export async function dashboardData(date) {
  if (!MOCK) return request("/reports/dashboard?date=" + date);
  await delay();
  const todayReadings = M.readings.filter((r) => r.reading_date === date);
  const totalLitres = todayReadings.reduce((s, r) => s + r.litres_dispensed, 0);
  const totalSales = todayReadings.reduce((s, r) => s + r.sales_value, 0);
  const recon = await runStockReconciliation(date);
  const dips = M.dips.filter((d) => d.dip_date === date);
  return { totalLitres, totalSales, recon, dips, tankCapacities: M.tanks };
}