import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const renderer = await fs.readFile(path.join(root, "assets", "renderer-inject.js"), "utf8");

for (const attribute of [
  "data-dream-ui-profile",
  "data-dream-home-surface",
  "data-dream-task-surface",
  "data-dream-decoration-profile",
]) {
  assert.match(renderer, new RegExp(attribute), `renderer should map ${attribute}`);
}

for (const property of [
  "--ds-ui-density",
  "--ds-ui-radius",
  "--ds-home-opacity",
  "--ds-task-opacity",
]) {
  assert.match(renderer, new RegExp(property), `renderer should map ${property}`);
}

assert.match(
  renderer,
  /ART_ATTRS[\s\S]*data-dream-ui-profile/,
  "UI attributes should be part of root cleanup state.",
);
assert.match(
  renderer,
  /THEME_VARIABLES[\s\S]*--ds-ui-density/,
  "UI properties should be part of root cleanup state.",
);

console.log("PASS: renderer maps and cleans complete UI profile state.");
