import { useMemo, useState } from 'react';
import { attackColor } from './attackColors';
import type { AttackEvent, AttackVector } from '../types';

const VECTORS: (AttackVector | 'all')[] = [
  'all',
  'none_exploit',
  'algorithm_downgrade',
  'kid_injection',
  'key_confusion',
  'replay_attack',
  'token_theft',
  'malformed',
  'invalid_signature',
  'invalid_claims',
];

export function EventLog({ events }: { events: AttackEvent[] }) {
  const [vector, setVector] = useState<(typeof VECTORS)[number]>('all');
  const [ip, setIp] = useState('');

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (vector !== 'all' && e.attack_vector !== vector) return false;
      if (ip.trim() && !e.source_ip.includes(ip.trim())) return false;
      return true;
    });
  }, [events, vector, ip]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={vector}
          onChange={(e) => setVector(e.target.value as (typeof VECTORS)[number])}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
        >
          {VECTORS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <input
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="Filter IP"
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Vector</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.map((e, i) => (
              <tr key={`${e.timestamp}-${i}`}>
                <td className="px-4 py-2 font-mono text-xs text-slate-400">{e.timestamp}</td>
                <td className="px-4 py-2">
                  <span
                    className="inline-flex items-center gap-2 rounded bg-slate-800 px-2 py-0.5 text-xs"
                    style={{ borderLeft: `3px solid ${attackColor(String(e.attack_vector))}` }}
                  >
                    {e.attack_vector}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono text-slate-300">{e.source_ip}</td>
                <td className="px-4 py-2 text-slate-500">{e.detail ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
