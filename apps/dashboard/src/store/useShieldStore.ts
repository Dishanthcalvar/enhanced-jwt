import { create } from 'zustand';
import type { AttackEvent, StatsSummary, BlockedIpRow } from '../types';

interface ShieldState {
  summary: StatsSummary | null;
  events: AttackEvent[];
  blockedIps: BlockedIpRow[];
  socketConnected: boolean;
  setSummary: (s: StatsSummary) => void;
  prependEvent: (e: AttackEvent) => void;
  setEvents: (e: AttackEvent[]) => void;
  setBlockedIps: (rows: BlockedIpRow[]) => void;
  setSocketConnected: (v: boolean) => void;
}

export const useShieldStore = create<ShieldState>((set) => ({
  summary: null,
  events: [],
  blockedIps: [],
  socketConnected: false,
  setSummary: (summary) => set({ summary }),
  prependEvent: (e) => set((s) => ({ events: [e, ...s.events].slice(0, 500) })),
  setEvents: (events) => set({ events }),
  setBlockedIps: (blockedIps) => set({ blockedIps }),
  setSocketConnected: (socketConnected) => set({ socketConnected }),
}));
