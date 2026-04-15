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
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-lg">⬡</span>
        <h2 className="text-lg font-bold text-white">Token Inspector</h2>
      </div>

      <div className="glass-card space-y-5 p-6">
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            Paste JWT Token
          </label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
            rows={4}
            className="input-cyber w-full resize-none"
          />
        </div>
        <button
          type="button"
          disabled={loading || !token.trim()}
          onClick={() => void analyze()}
          className="btn-primary text-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Analyzing…
            </span>
          ) : (
            '⚡ Analyze Token'
          )}
        </button>

        {result && (
          <div className="space-y-4 fade-in">
            {/* Verdict */}
            <div className="flex items-center gap-3 rounded-xl p-4" style={{
              background: result.valid ? 'rgba(34, 255, 136, 0.05)' : 'rgba(255, 51, 102, 0.05)',
              border: `1px solid ${result.valid ? 'rgba(34, 255, 136, 0.15)' : 'rgba(255, 51, 102, 0.15)'}`,
            }}>
              <span className="text-2xl">{result.valid ? '✅' : '🚨'}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: result.valid ? '#44ffaa' : '#ff6b8a' }}>
                  {result.valid ? 'Token is Valid' : String(result.attackVector ?? 'Invalid Token')}
                </p>
                {typeof result.message === 'string' && (
                  <p className="mt-0.5 text-xs text-slate-500">{result.message}</p>
                )}
              </div>
            </div>

            {/* Header & Payload */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                  🔑 Header
                </p>
                <pre className="max-h-48 overflow-auto rounded-xl p-4 text-xs text-slate-300"
                  style={{ background: 'rgba(6, 9, 24, 0.8)', border: '1px solid rgba(100, 180, 255, 0.06)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {JSON.stringify(result.header, null, 2)}
                </pre>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                  📦 Payload
                </p>
                <pre className="max-h-48 overflow-auto rounded-xl p-4 text-xs text-slate-300"
                  style={{ background: 'rgba(6, 9, 24, 0.8)', border: '1px solid rgba(100, 180, 255, 0.06)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {JSON.stringify(result.payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
