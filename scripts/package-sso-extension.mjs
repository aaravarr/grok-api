/**
 * Package tools/sso-extension into a load-unpacked zip at repo root.
 * Usage: node scripts/package-sso-extension.mjs
 */
import { readFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "tools", "sso-extension");
const stageDir = join(root, "dist", "sso-extension");
const manifest = JSON.parse(readFileSync(join(src, "manifest.json"), "utf8"));
const ver = manifest.version || "0.0.0";
const zipName = `grok-api-sso-extension-v${ver}.zip`;
const zipPath = join(root, zipName);

rmSync(join(root, "dist"), { recursive: true, force: true });
mkdirSync(stageDir, { recursive: true });
cpSync(src, stageDir, {
  recursive: true,
  filter: (p) => !p.endsWith(".DS_Store") && !p.endsWith(".map"),
});

// Prefer PowerShell Compress-Archive on Windows; zip on Unix
if (process.platform === "win32") {
  const ps = `
    $ErrorActionPreference = 'Stop'
    if (Test-Path -LiteralPath '${zipPath.replace(/'/g, "''")}') { Remove-Item -LiteralPath '${zipPath.replace(/'/g, "''")}' -Force }
    Compress-Archive -Path '${stageDir.replace(/'/g, "''")}' -DestinationPath '${zipPath.replace(/'/g, "''")}' -CompressionLevel Optimal
  `;
  execFileSync("powershell", ["-NoProfile", "-Command", ps], { stdio: "inherit" });
} else {
  execFileSync("zip", ["-r", "-9", zipPath, "sso-extension"], {
    cwd: join(root, "dist"),
    stdio: "inherit",
  });
}

if (!existsSync(zipPath)) {
  console.error("zip not created:", zipPath);
  process.exit(1);
}
console.log("OK", zipName);
console.log("Load unpacked from extracted folder: dist/sso-extension  OR unzip", zipName);
