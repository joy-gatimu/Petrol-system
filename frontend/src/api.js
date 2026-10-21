export const saveToken = (t) => localStorage.setItem("ps_token", t);
export const getToken = () => localStorage.getItem("ps_token");
export const clearToken = () => localStorage.removeItem("ps_token");

export const money = (n) => "KES " + Number(n || 0).toLocaleString("en-KE", { maximumFractionDigits: 0 });
export const litres = (n) => Number(n || 0).toLocaleString("en-KE") + " L";
export const dateFmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

async function request(path, options = {}) {
  const res = await fetch("/api" + path, {
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: "Bearer " + getToken() } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Request failed");
  }
  return res.json();
}

export async function login(username, password) {
  return request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
}

export async function listFuelTypes() { return request("/master/fuel-types"); }
export async function listPrices() { return request("/master/prices"); }
export async function listTanks() { return request("/master/tanks"); }
export async function listPumps() { return request("/master/pumps"); }
export async function listSuppliers() { return request("/master/suppliers"); }
export async function listUsers() { return request("/master/users"); }
export async function listAuditLogs() { return request("/master/audit"); }

export async function listReadings({ date } = {}) {
  return request("/readings" + (date ? `?date=${date}` : ""));
}
export async function createReading(payload) {
  return request("/readings/pumps", { method: "POST", body: JSON.stringify(payload) });
}
export async function deleteReading(id) {
  return request(`/readings/pumps/${id}`, { method: "DELETE" });
}

export async function listDips({ date } = {}) {
  return request("/readings/dips" + (date ? `?date=${date}` : ""));
}
export async function createDip(payload) {
  return request("/readings/dips", { method: "POST", body: JSON.stringify(payload) });
}
export async function deleteDip(id) {
  return request(`/readings/dips/${id}`, { method: "DELETE" });
}

export async function listDeliveries({ date } = {}) {
  return request("/readings/deliveries" + (date ? `?date=${date}` : ""));
}
export async function createDelivery(payload) {
  return request("/readings/deliveries", { method: "POST", body: JSON.stringify(payload) });
}
export async function deleteDelivery(id) {
  return request(`/readings/deliveries/${id}`, { method: "DELETE" });
}

export async function runStockReconciliation(date) {
  return request("/reconciliation/stock?date=" + date);
}

export async function dashboardData(date) {
  const [dash, recon] = await Promise.all([
    request("/reconciliation/dashboard?date=" + date),
    request("/reconciliation/stock?date=" + date)
  ]);
  return { ...dash, recon }; 
}

export async function dailyReport(date) {
  return runStockReconciliation(date);
}

export async function monthlyReport(year, month) {
  return []; 
}

// Dummy function so Dashboard doesn't crash if it imports this
export async function getSalesTrend() {
  return [];
}