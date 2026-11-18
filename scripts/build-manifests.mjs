#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = path.join(ROOT_DIR, "extension");
const DIST_DIR = path.join(ROOT_DIR, "dist");

/**
 * Copies `extension/` into target-specific directories under `dist/` and adjusts
 * only the Manifest V3 keys that differ across Firefox, Chrome, and Safari.
 * Source files under `src/` and `icons/` remain 100% identical across browsers.
 */
function buildTargets() {
  const baseManifestPath = path.join(SOURCE_DIR, "manifest.json");
  const baseManifest = JSON.parse(fs.readFileSync(baseManifestPath, "utf8"));

  fs.rmSync(DIST_DIR, { recursive: true, force: true });

  const targets = [
    {
      name: "firefox",
      transform(manifest) {
        return manifest;
      },
    },
    {
      name: "chrome",
      transform(manifest) {
        const next = structuredClone(manifest);
        delete next.browser_specific_settings;
        next.minimum_chrome_version = "111";
        next.background = {
          service_worker: "src/background/index.js",
          type: "module",
        };
        return next;
      },
    },
    {
      name: "safari-webext",
      transform(manifest) {
        const next = structuredClone(manifest);
        delete next.browser_specific_settings;
        next.background = {
          service_worker: "src/background/index.js",
          type: "module",
        };
        return next;
      },
    },
  ];

  for (const target of targets) {
    const outDir = path.join(DIST_DIR, target.name);
    fs.cpSync(SOURCE_DIR, outDir, { recursive: true });

    const manifestOut = target.transform(baseManifest);
    fs.writeFileSync(
      path.join(outDir, "manifest.json"),
      JSON.stringify(manifestOut, null, 2) + "\n",
      "utf8"
    );
    console.log(`Built ${path.relative(ROOT_DIR, outDir)}/manifest.json`);
  }
}

buildTargets();
