import { useCallback, useEffect, useState } from 'react';
import { useShieldStore } from './store/useShieldStore';
import { useShieldSocket } from './hooks/useSocket';
import { StatsCards } from './components/StatsCards';
import { LiveFeed } from './components/LiveFeed';
import { AttackBreakdown } from './components/AttackBreakdown';
import { IPBlocklist } from './components/IPBlocklist';
import { TokenInspector } from './components/TokenInspector';
import { EventLog } from './components/EventLog';
import type { AttackEvent, BlockedIpRow, StatsSummary } from './types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type View = 'overview' | 'ip' | 'inspector' | 'events';

export default function App() {
  const [view, setView] = useState<View>('overview');
  const summary = useShieldStore((s) => s.summary);
  const events = useShieldStore((s) => s.events);
  const blockedIps = useShieldStore((s) => s.blockedIps);
  const socketConnected = useShieldStore((s) => s.socketConnected);
  const setSummary = useShieldStore((s) => s.setSummary);
  const setEvents = useShieldStore((s) => s.setEvents);
  const setBlockedIps = useShieldStore((s) => s.setBlockedIps);

  useShieldSocket(API_BASE);

  const refreshStatic = useCallback(async () => {
    const [sRes, eRes, bRes] = await Promise.all([
      fetch(`${API_BASE}/api/stats/summary`),
      fetch(`${API_BASE}/api/stats/events?limit=100`),
      fetch(`${API_BASE}/api/stats/blocked-ips`),
    ]);
    const s = (await sRes.json()) as StatsSummary;
    const e = (await eRes.json()) as AttackEvent[];
    const b = (await bRes.json()) as BlockedIpRow[];
    setSummary(s);
    setEvents(e);
    setBlockedIps(b);
  }, [setSummary, setEvents, setBlockedIps]);

  useEffect(() => {
    void refreshStatic();
  }, [refreshStatic]);

  const navBtn = (id: View, label: string) => (
    <button
      type="button"
      key={id}
      onClick={() => setView(id)}
      className={`rounded-lg px-3 py-2 text-sm ${
        view === id ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">JWT Shield</h1>
            <p className="text-xs text-slate-500">Live threat dashboard</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {navBtn('overview', 'Overview')}
            {navBtn('ip', 'IP monitor')}
            {navBtn('inspector', 'Token inspector')}
            {navBtn('events', 'Event log')}
            <span
              className={`ml-2 rounded-full px-2 py-1 text-xs ${
                socketConnected ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
              }`}
            >
              {socketConnected ? 'Socket live' : 'Socket offline'}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        {view === 'overview' && (
          <>
            <StatsCards summary={summary} />
            <div className="grid gap-6 lg:grid-cols-2">
              <LiveFeed events={events} />
              <AttackBreakdown summary={summary} />
            </div>
          </>
        )}
        {view === 'ip' && (
          <IPBlocklist rows={blockedIps} apiBase={API_BASE} onUnblock={() => void refreshStatic()} />
        )}
        {view === 'inspector' && <TokenInspector apiBase={API_BASE} />}
        {view === 'events' && <EventLog events={events} />}
      </main>
    </div>
  );
}
