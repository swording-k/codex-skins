import assert from "node:assert/strict";

const serverModule = await import("../server.mjs");

assert.equal(typeof serverModule.createThemeStudioServer, "function", "server exposes a reusable factory");
assert.equal(typeof serverModule.startThemeStudioServer, "function", "server exposes a reusable starter");

const server = serverModule.createThemeStudioServer();
assert.equal(typeof server.listen, "function", "factory returns an HTTP server");

const started = await serverModule.startThemeStudioServer({ port: 0 });
assert.ok(started.url.startsWith("http://127.0.0.1:"), "starter returns a loopback app URL");
await new Promise((resolve, reject) => started.server.close((error) => (error ? reject(error) : resolve())));

console.log("PASS: theme studio server can be embedded by the desktop app.");
