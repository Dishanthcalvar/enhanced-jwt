/**
 * Sends a JWT whose header uses alg "none" (blocked at algorithm / header stage).
 * Run from repo root after API is up: node demos/attack_none.js
 */
const API = process.env.API_URL || 'http://localhost:3001';

const parts = [
  Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url'),
  Buffer.from(JSON.stringify({ sub: 'x', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url'),
  'bm9w',
];
const token = parts.join('.');

async function main() {
  console.log('Simulating: none / unsigned header exploit');
  const res = await fetch(`${API}/api/data`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', body);
}

main().catch(console.error);
