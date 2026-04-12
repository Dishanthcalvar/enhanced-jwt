import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useShieldStore } from '../store/useShieldStore';
import type { AttackEvent, BlockedIpRow, StatsSummary } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? '';

export function useShieldSocket(apiBase: string): void {
  const prependEvent = useShieldStore((s) => s.prependEvent);
  const setSummary = useShieldStore((s) => s.setSummary);
  const setSocketConnected = useShieldStore((s) => s.setSocketConnected);

  useEffect(() => {
    const url = SOCKET_URL || new URL(apiBase).origin;
    const socket: Socket = io(url, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('subscribe_stats');
    });
    socket.on('disconnect', () => setSocketConnected(false));

    socket.on('attack_event', (payload: AttackEvent) => {
      prependEvent(payload);
    });

    socket.on('stats_update', (payload: StatsSummary) => {
      setSummary(payload);
    });

    socket.on('ip_blocked', () => {
      void fetch(`${apiBase}/api/stats/blocked-ips`)
        .then((r) => r.json())
        .then((rows: unknown) => {
          if (Array.isArray(rows)) {
            useShieldStore.getState().setBlockedIps(rows as BlockedIpRow[]);
          }
        })
        .catch(() => {});
    });

    return () => {
      socket.disconnect();
    };
  }, [apiBase, prependEvent, setSummary, setSocketConnected]);
}
