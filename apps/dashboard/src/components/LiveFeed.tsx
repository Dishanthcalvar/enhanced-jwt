import { attackColor } from './attackColors';
import type { AttackEvent } from '../types';

export function LiveFeed({ events }: { events: AttackEvent[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40">
      <div className="border-b border-slate-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-200">Live attack feed</h2>
      </div>
      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-800/80">
        {events.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No blocked events yet.</p>
        ) : (
          events.map((e, idx) => (
            <div key={`${e.timestamp}-${idx}`} className="flex gap-3 px-4 py-3 text-sm">
              <span
                className="mt-1 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: attackColor(String(e.attack_vector)) }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{e.timestamp}</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-200">
                    {e.attack_vector}
                  </span>
                </div>
                <p className="mt-1 text-slate-300">
                  <span className="text-slate-500">IP</span> {e.source_ip}{' '}
                  <span className="text-slate-600">·</span> {e.detail ?? 'blocked'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
