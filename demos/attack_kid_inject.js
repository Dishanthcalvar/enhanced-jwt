/**
 * Unknown kid — requires API keys matching multi-key config (v1,v2).
 * If your token uses a valid signature but wrong kid, kid_injection triggers.
 * This script uses a structurally valid RS256-shaped token with bogus signature;
 * you can replace TOKEN with a real token and patch header kid for a sharper demo.
 */
const API = process.env.API_URL || 'http://localhost:3001';

const now = Math.floor(Date.now() / 1000);
const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'attacker-controlled' })).toString(
  'base64url'
);
const payload = Buffer.from(
  JSON.stringify({
    sub: 'x',
    jti: 'demo-kid',
    exp: now + 3600,
    iat: now,
    iss: 'jwt-shield-demo',
    aud: 'jwt-shield-api',
  })
).toString('base64url');
const token = `${header}.${payload}.Ym9ndXMK`;

async function main() {
  console.log('Simulating: kid injection / unknown kid');
  const res = await fetch(`${API}/api/data`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}

main().catch(console.error);
