import type { BlockedIpRow } from '../types';

export function IPBlocklist({
  rows,
  apiBase,
  onUnblock,
}: {
  rows: BlockedIpRow[];
  apiBase: string;
  onUnblock?: () => void;
}) {
  const unblock = async (ip: string) => {
    await fetch(`${apiBase}/api/stats/unblock-ip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip }),
    });
    onUnblock?.();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">IP</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Expires</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-slate-500">
                No blocked IPs.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.ip} className="hover:bg-slate-900/60">
                <td className="px-4 py-3 font-mono text-slate-200">{r.ip}</td>
                <td className="px-4 py-3 text-slate-400">{r.reason}</td>
                <td className="px-4 py-3">
                  {r.permanent ? (
                    <span className="rounded bg-rose-950 px-2 py-0.5 text-xs text-rose-300">Permanent</span>
                  ) : (
                    <span className="rounded bg-amber-950 px-2 py-0.5 text-xs text-amber-200">Temporary</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {r.expiresAt ? new Date(r.expiresAt).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => void unblock(r.ip)}
                    className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800"
                  >
                    Unblock
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
