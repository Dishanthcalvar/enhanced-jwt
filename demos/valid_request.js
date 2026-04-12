/**
 * Login and call protected route once (single-use jti — second call would be replay).
 */
const API = process.env.API_URL || 'http://localhost:3001';

async function main() {
  const login = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'demo', password: 'demo' }),
  });
  const loginJson = await login.json();
  if (!loginJson.token) {
    console.error('Login failed', loginJson);
    process.exit(1);
  }
  const res = await fetch(`${API}/api/data`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${loginJson.token}` },
  });
  console.log('Protected status:', res.status);
  console.log(await res.text());
}

main().catch(console.error);
