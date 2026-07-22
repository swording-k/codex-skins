import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const html = await fs.readFile(path.join(here, "index.html"), "utf8");
const app = await fs.readFile(path.join(here, "site.js"), "utf8");

assert.match(html, /id="downloadCount"/, "website exposes a live release download count");
assert.match(html, /提交反馈/, "website exposes a user feedback entry");
assert.match(html, /issues\/new\?template=feedback\.yml/, "website feedback uses the structured issue form");
assert.match(app, /api\.github\.com\/repos\/swording-k\/codex-theme-creator\/releases/, "website reads public release data");
assert.match(app, /download_count/, "website aggregates release asset downloads");
assert.doesNotMatch(app, /localStorage|cookie|fingerprint|sendBeacon/, "download measurement does not add hidden user tracking");

console.log("PASS: product site exposes feedback and privacy-safe download measurement.");
