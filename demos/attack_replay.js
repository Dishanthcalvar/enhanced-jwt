/**
 * Reuses the same legitimate JWT multiple times — second+ hits replay_attack (single-use jti).
 * Set TOKEN via env: TOKEN="eyJ..." node demos/attack_replay.js
 */
const API = process.env.API_URL || 'http://localhost:3001';
const TOKEN = process.env.TOKEN;

async function main() {
  if (!TOKEN) {
    console.error('Set TOKEN env to a valid access JWT from POST /auth/login');
    process.exit(1);
  }
  console.log('Simulating: replay — sending same token 5 times');
  for (let i = 1; i <= 5; i++) {
    const res = await fetch(`${API}/api/data`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const body = await res.text();
    console.log(`#${i} status`, res.status, body.slice(0, 120));
  }
}

main().catch(console.error);
