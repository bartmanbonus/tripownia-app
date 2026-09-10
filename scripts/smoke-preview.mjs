// Read-only functional checks against a local build, never the production site.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { partners } from '../lib/partners.ts';
const base = 'http://127.0.0.1:3147';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3147', '-H', '127.0.0.1'], {
  env: { ...process.env, TRIPOWNIA_ADMIN_USER: 'local-smoke', TRIPOWNIA_ADMIN_PASSWORD: 'local-smoke-only-not-a-production-secret' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
server.stdout.on('data', chunk => { output += chunk; });
server.stderr.on('data', chunk => { output += chunk; });
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null) throw new Error('Local server exited before startup');
    try { const r = await fetch(base + '/api/catalog?pageSize=1'); if (r.ok) { ready = true; break; } } catch {}
    await delay(500);
  }
  assert.ok(ready, 'local build starts');
  const first = await (await fetch(base + '/api/catalog?page=1&pageSize=1')).json();
  const second = await (await fetch(base + '/api/catalog?page=2&pageSize=1')).json();
  assert.equal(first.ok, true);
  assert.equal(first.totalMatches, second.totalMatches);
  assert.equal(first.broadened, false);
  assert.ok(first.offers.length <= 1 && second.offers.length <= 1);
  if (first.offers.length && second.offers.length) assert.notEqual(first.offers[0].id, second.offers[0].id);
  console.log('PASS: catalog pagination and totalMatches');
  for (const path of ['/api/catalog', '/api/today-offers?mode=search']) {
    const url = new URL(base + path);
    url.searchParams.set('q', 'tripownia-no-such-direction-regression-check');
    const r = await fetch(url), data = await r.json();
    assert.equal(r.status, 200); assert.equal(data.totalMatches, 0); assert.deepEqual(data.offers, []); assert.equal(data.broadened, false);
  }
  console.log('PASS: no silent broadening on catalog or compatibility endpoint');
  assert.equal((await fetch(base + '/api/catalog?dateFrom=2026-02-31')).status, 400);
  console.log('PASS: invalid filters rejected');
  for (const path of ['/admin', '/admin/social', '/api/admin/publish-overrides', '/api/admin/publish-overrides/click-stats']) {
    const response = await fetch(base + path, { redirect: 'manual' });
    assert.equal(response.status, 401, `unauthenticated ${path}`);
  }
  console.log('PASS: administrative pages and APIs require authentication');
  const header = (await (await fetch(base)).text()).match(/<header\b[\s\S]*?<\/header>/)?.[0] || '';
  assert.ok(header.includes('Atrakcje'));
  assert.ok(!header.includes('Moje konto') && !header.includes('Konto — wkrótce') && !header.includes('Ubezpieczenia'));
  assert.ok(header.includes('Ulubione') && header.includes('Pomoc'));
  const affiliate = partners.getyourguide.buildUrl('https://www.getyourguide.pl/');
  const actualLink = header.match(/href="([^"]*clk\.tradedoubler\.com[^"]*)"/);
  assert.ok(actualLink, 'header contains the configured GetYourGuide tracking link');
  assert.equal(actualLink[1].replace(/&amp;/g, '&'), affiliate);
  const out = await fetch(base + '/out/getyourguide?' + new URLSearchParams({ url: affiliate, source: 'local-smoke' }), { redirect: 'manual' });
  assert.equal(out.status, 307); assert.equal(out.headers.get('location'), affiliate);
  console.log('PASS: header change and internal redirect preserve configured affiliation');
  console.log('5 read-only smoke checks passed. No external partner or Facebook publication was made.');
} catch (error) {
  console.error(output.slice(-5000));
  throw error;
} finally {
  server.kill('SIGTERM');
}
