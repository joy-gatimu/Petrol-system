export default function Help() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Help</h1>
      <p className="text-slate-700">Welcome to the Petrol Station Sales and Stock System.</p>
      <ul className="list-disc pl-6 mt-4 text-slate-700 space-y-1">
        <li>Use <b>Record Readings</b> to enter pump meters, tank dips and fuel deliveries.</li>
        <li>Use <b>Reconciliation</b> to compare expected versus actual stock (and cash).</li>
        <li>Use <b>Reports</b> to view daily and monthly summaries, export CSV, or print.</li>
        <li>Administrators can manage pumps, tanks, prices, users, and audit logs.</li>
      </ul>
    </div>
  );
}