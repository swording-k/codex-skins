import assert from "node:assert/strict";

import { gradeProbe, selectCodexTarget } from "../scripts/compatibility-probe.mjs";

assert.deepEqual(
  gradeProbe({ shell: 1, sidebar: 1, composer: 1, cards: 1 }),
  { status: "compatible", missingCritical: [], missingOptional: [] },
);
assert.equal(
  gradeProbe({ shell: 1, sidebar: 0, composer: 1, cards: 1 }).status,
  "incompatible",
);
assert.deepEqual(
  gradeProbe({ shell: 1, sidebar: 1, composer: 1, cards: 0 }),
  { status: "degraded", missingCritical: [], missingOptional: ["cards"] },
);
assert.equal(
  selectCodexTarget([
    { type: "page", url: "app://-/index.html?initialRoute=%2Favatar-overlay", id: "overlay" },
    { type: "page", url: "app://-/avatar-overlay-composition-surface.html", id: "pet" },
    { type: "page", url: "app://-/index.html", id: "main" },
  ]).id,
  "main",
);

console.log("PASS: compatibility probe grades critical and optional capabilities.");
