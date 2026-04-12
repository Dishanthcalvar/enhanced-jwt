import { useState } from 'react';
import { attackColor } from './attackColors';

export function TokenInspector({ apiBase }: { apiBase: string }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${apiBase}/api/stats/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });
      const json = (await res.json()) as Record<string, unknown>;
      setResult(json);
    } finally {
      setLoading(false);
    }
  };

  const vector = result && typeof result.attackVector === 'string' ? result.attackVector : null;

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <h2 className="text-sm font-semibold text-slate-200">Token inspector</h2>
      <textarea
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Paste JWT"
        rows={4}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-200 outline-none focus:border-cyan-600"
      />
      <button
        type="button"
        disabled={loading || !token.trim()}
        onClick={() => void analyze()}
        className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        {loading ? 'Analyzing…' : 'Analyze'}
      </button>

      {result && (
        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950/80 p-4 text-sm">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: result.valid ? '#22c55e' : attackColor(vector ?? 'malformed'),
              }}
            />
            <span className="font-medium text-slate-200">
              {result.valid ? 'Valid (inspect pipeline)' : String(result.attackVector ?? 'invalid')}
            </span>
          </div>
          {typeof result.message === 'string' && (
            <p className="text-slate-400">{result.message}</p>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs uppercase text-slate-500">Header</p>
              <pre className="max-h-48 overflow-auto rounded bg-slate-900 p-2 text-xs text-slate-300">
                {JSON.stringify(result.header, null, 2)}
              </pre>
            </div>
            <div>
              <p className="mb-1 text-xs uppercase text-slate-500">Payload</p>
              <pre className="max-h-48 overflow-auto rounded bg-slate-900 p-2 text-xs text-slate-300">
                {JSON.stringify(result.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
