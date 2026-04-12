/**
 * Floods invalid requests from one IP to trigger auto-block thresholds.
 */
const API = process.env.API_URL || 'http://localhost:3001';

const junkToken = [
  Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
  Buffer.from(JSON.stringify({ exp: 1 })).toString('base64url'),
  'eA',
].join('.');

async function main() {
  console.log('Simulating: rejection flood (expect 403s, then possible IP block)');
  for (let i = 1; i <= 15; i++) {
    const res = await fetch(`${API}/api/data`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${junkToken}` },
    });
    console.log(`#${i}`, res.status);
  }
}

main().catch(console.error);
