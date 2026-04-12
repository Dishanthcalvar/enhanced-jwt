/**
 * HS256 in header with garbage signature — blocked by algorithm allowlist.
 */
const API = process.env.API_URL || 'http://localhost:3001';

const now = Math.floor(Date.now() / 1000);
const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
const payload = Buffer.from(
  JSON.stringify({
    sub: 'x',
    exp: now + 3600,
    iat: now,
    iss: 'jwt-shield-demo',
    aud: 'jwt-shield-api',
  })
).toString('base64url');
const token = `${header}.${payload}.c2ln`;

async function main() {
  console.log('Simulating: algorithm downgrade (HS256)');
  const res = await fetch(`${API}/api/data`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}

main().catch(console.error);
