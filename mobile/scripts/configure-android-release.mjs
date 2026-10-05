import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const versionCode = process.env.ANDROID_VERSION_CODE || '';
const versionName = process.env.ANDROID_VERSION_NAME || '';

if (!/^[1-9][0-9]*$/.test(versionCode) || Number(versionCode) > 2100000000) {
  throw new Error('ANDROID_VERSION_CODE must be an integer from 1 to 2100000000, greater than every code already uploaded to Play Console.');
}
if (versionName.length > 50 || !/^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][A-Za-z0-9.-]+)?$/.test(versionName)) {
  throw new Error('ANDROID_VERSION_NAME must be a version such as 1.0.0 or 1.0.0-rc.1 (at most 50 characters).');
}

const appPath = fileURLToPath(new URL('../android/app/build.gradle', import.meta.url));
const variablesPath = fileURLToPath(new URL('../android/variables.gradle', import.meta.url));
const variables = readFileSync(variablesPath, 'utf8');
let app = readFileSync(appPath, 'utf8');

if (!/applicationId\s*(?:=\s*)?["']pl\.tripownia\.app["']/.test(app)) {
  throw new Error('Unexpected Android applicationId; expected pl.tripownia.app.');
}
for (const name of ['compileSdkVersion', 'targetSdkVersion']) {
  const match = variables.match(new RegExp(`\\b${name}\\s*=\\s*([0-9]+)`));
  if (!match || Number(match[1]) < 36) {
    throw new Error(`${name} must be at least 36 for the current Google Play requirement. Update the pinned Android template first.`);
  }
}

function replaceOne(pattern, value, name) {
  const matches = [...app.matchAll(pattern)];
  if (matches.length !== 1) throw new Error(`Expected one ${name} in the generated Android template; found ${matches.length}.`);
  app = app.replace(pattern, (_, prefix) => `${prefix}${value}`);
}

replaceOne(/(\bversionCode\s+(?:=\s*)?)\d+/g, versionCode, 'versionCode');
replaceOne(/(\bversionName\s+(?:=\s*)?)["'][^"']*["']/g, JSON.stringify(versionName), 'versionName');
writeFileSync(appPath, app);
console.log(`Android release configured: pl.tripownia.app, versionCode=${versionCode}, versionName=${versionName}, targetSdk>=36.`);
