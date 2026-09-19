import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const androidRoot = path.join(root, "android");
const manifestPath = path.join(androidRoot, "app", "src", "main", "AndroidManifest.xml");
const sourceIcon = path.join(root, "public", "tripownia-app-icon-v2.png");
const drawableDir = path.join(androidRoot, "app", "src", "main", "res", "drawable-nodpi");
const targetIcon = path.join(drawableDir, "tripownia_launcher.png");

if (!fs.existsSync(manifestPath)) {
  throw new Error("AndroidManifest.xml not found. Run npx cap add android first.");
}
if (!fs.existsSync(sourceIcon)) {
  throw new Error("Tripownia launcher icon not found.");
}

fs.mkdirSync(drawableDir, { recursive: true });
fs.copyFileSync(sourceIcon, targetIcon);

let manifest = fs.readFileSync(manifestPath, "utf8");
manifest = manifest
  .replace(/android:icon="@mipmap\/ic_launcher"/g, 'android:icon="@drawable/tripownia_launcher"')
  .replace(/android:roundIcon="@mipmap\/ic_launcher_round"/g, 'android:roundIcon="@drawable/tripownia_launcher"');

if (!/android:windowSoftInputMode=/.test(manifest)) {
  manifest = manifest.replace(
    /(<activity\b[^>]*?)(\sandroid:exported="true")/,
    '$1 android:windowSoftInputMode="adjustResize"$2',
  );
}

fs.writeFileSync(manifestPath, manifest, "utf8");

const verified = fs.readFileSync(manifestPath, "utf8");
if (!verified.includes('android:icon="@drawable/tripownia_launcher"')) {
  throw new Error("Tripownia launcher icon was not applied to AndroidManifest.xml");
}
if (!verified.includes('android:windowSoftInputMode="adjustResize"')) {
  throw new Error("Android keyboard resize behavior was not applied to AndroidManifest.xml");
}
if (!fs.existsSync(targetIcon) || fs.statSync(targetIcon).size < 1000) {
  throw new Error("Tripownia launcher asset is missing or unexpectedly small.");
}

console.log("Verified Tripownia Android branding and keyboard behavior.");
