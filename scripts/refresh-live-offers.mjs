import { readFile, writeFile, rename } from 'node:fs/promises';
import { collectSnapshot } from './refresh-core.ts';
const snapshotPath = 'data/live-offers-snapshot.json', statusPath = 'data/refresh-status.json';
const readJson = async (path, fallback) => { try { return JSON.parse(await readFile(path, 'utf8')); } catch { return fallback; } };
const saveJson = async (path, data) => { await writeFile(`${path}.tmp`, `${JSON.stringify(data, null, 2)}\n`); await rename(`${path}.tmp`, path); };
const previous = await readJson(snapshotPath, { offers: [] });
const oldStatus = await readJson(statusPath, {});
const attempt = new Date().toISOString();
for (let retry = 0; retry < 3; retry++) {
  try {
    const next = await collectSnapshot(process.env.TRIPOWNIA_BASE_URL || 'https://tripownia.pl', previous);
    await saveJson(snapshotPath, next);
    await saveJson(statusPath, { lastAttemptAt: attempt, lastSuccessAt: next.checkedAt, catalogSize: next.offers.length, added: next.added, updated: next.updated, sources: next.sources, error: null });
    console.log(`Saved ${next.offers.length} imported offers; ${next.added} added, ${next.updated} updated.`);
    process.exit(0);
  } catch {
    if (retry < 2) await new Promise(resolve => setTimeout(resolve, 5000));
  }
}
// No raw partner URLs, tokens or untrusted error text in logs or repository data.
await saveJson(statusPath, { ...oldStatus, lastAttemptAt: attempt, lastSuccessAt: oldStatus.lastSuccessAt || previous.checkedAt || null, catalogSize: previous.offers?.length || 0, error: 'Refresh failed; previous snapshot retained. Check workflow run.' });
console.error('Refresh failed after 3 attempts. Previous snapshot retained.');
process.exitCode = 1;
