import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import type { StatsSummary } from '../types';
import { attackColor } from './attackColors';

export function AttackBreakdown({ summary }: { summary: StatsSummary | null }) {
  const data =
    summary?.attacks_by_type &&
    Object.entries(summary.attacks_by_type).map(([name, value]) => ({
      name,
      value,
      fill: attackColor(name),
    }));

  if (!data || data.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center p-10 text-slate-600">
        <span className="mb-2 text-3xl opacity-30">📊</span>
        <p className="text-xs">No attack data yet</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-sm">📊</span>
        <h2 className="text-sm font-semibold text-white">Attack Distribution</h2>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#475569', fontSize: 9, fontFamily: 'Inter' }}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={60}
              axisLine={{ stroke: 'rgba(255,255,255,0.04)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(6, 9, 24, 0.95)',
                border: '1px solid rgba(100, 180, 255, 0.15)',
                borderRadius: 12,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                fontFamily: 'Inter',
                fontSize: 12,
              }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}
              itemStyle={{ color: '#94a3b8' }}
              cursor={{ fill: 'rgba(0, 240, 255, 0.03)' }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
            <span className="text-[10px] text-slate-500">{d.name}</span>
            <span className="text-[10px] font-semibold" style={{ color: d.fill }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
