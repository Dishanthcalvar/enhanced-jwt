import type { StatsSummary } from '../types';

export function StatsCards({ summary }: { summary: StatsSummary | null }) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total requests', value: summary.total_requests },
    { label: 'Blocked', value: summary.total_blocked },
    { label: 'Block rate %', value: summary.block_rate_percent },
    {
      label: 'Uptime',
      value: `${Math.floor(summary.uptime_seconds / 3600)}h ${Math.floor((summary.uptime_seconds % 3600) / 60)}m`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-4 shadow-lg"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500">{c.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
