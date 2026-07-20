import { createServer } from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  createStudioTheme,
  discoverThemes,
  themeAssetPath,
} from "./lib/theme-library.mjs";
import { getPlatformConfig } from "./lib/platform.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const publicRoot = path.join(here, "public");
const platformConfig = getPlatformConfig({ repoRoot });

function parsePort(argv) {
  const index = argv.indexOf("--port");
  const port = index >= 0 ? Number(argv[index + 1]) : 56938;
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error(`Invalid port: ${port}`);
  return port;
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (Buffer.concat(chunks).length > 256 * 1024) throw new Error("Request body is too large");
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
}

async function serveStatic(req, res) {
  const url = new URL(req.url, "http://127.0.0.1");
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const target = path.resolve(publicRoot, `.${pathname}`);
  if (!target.startsWith(publicRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  const ext = path.extname(target);
  const type = ext === ".css" ? "text/css; charset=utf-8"
    : ext === ".js" ? "text/javascript; charset=utf-8"
      : "text/html; charset=utf-8";
  try {
    const data = await fs.readFile(target);
    res.writeHead(200, { "content-type": type, "cache-control": "no-store" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

async function findThemeById(id) {
  const themes = await discoverThemes({ repoRoot, themesRoot: platformConfig.themesRoot });
  const theme = themes.find((candidate) => candidate.id === id);
  if (!theme) throw new Error(`Theme not found: ${id}`);
  return theme;
}

function switchTheme(id) {
  if (!platformConfig.canSwitch || !platformConfig.switchScript) {
    throw new Error(platformConfig.switchUnavailableReason);
  }
  return new Promise((resolve, reject) => {
    const child = spawn(platformConfig.switchScript, ["--id", id], { cwd: repoRoot, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr || stdout || `Switch failed with code ${code}`));
    });
  });
}

async function handleApi(req, res) {
  const url = new URL(req.url, "http://127.0.0.1");
  if (req.method === "GET" && url.pathname === "/api/platform") {
    sendJson(res, 200, { platform: platformConfig });
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/themes") {
    sendJson(res, 200, { themes: await discoverThemes({ repoRoot, themesRoot: platformConfig.themesRoot }) });
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/asset") {
    const theme = await findThemeById(url.searchParams.get("id"));
    const file = themeAssetPath(theme, url.searchParams.get("kind") || "background");
    const data = await fs.readFile(file);
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      "content-type": ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png",
      "cache-control": "no-store",
    });
    res.end(data);
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/studio-themes") {
    const body = await readBody(req);
    const base = await findThemeById(body.baseId);
    const created = await createStudioTheme({
      baseThemeDir: base.themeDir,
      themesRoot: platformConfig.themesRoot,
      name: body.name,
      settings: body.settings,
    });
    sendJson(res, 201, { theme: { ...created.theme, themeDir: created.themeDir } });
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/switch") {
    const body = await readBody(req);
    const theme = await findThemeById(body.id);
    if (theme.source === "preset") {
      throw new Error("公开预设请先保存为我的主题，再启用。");
    }
    await switchTheme(theme.id);
    sendJson(res, 200, { ok: true, id: theme.id });
    return;
  }
  sendJson(res, 404, { error: "Not found" });
}

const server = createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/")) await handleApi(req, res);
    else await serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

const port = parsePort(process.argv.slice(2));
server.listen(port, "127.0.0.1", () => {
  console.log(`Codex Theme Studio running at http://127.0.0.1:${port}/`);
});
