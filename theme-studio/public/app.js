const state = {
  themes: [],
  selectedId: null,
  platform: null,
};

const grid = document.querySelector("#themeGrid");
const statusEl = document.querySelector("#status");
const platformStatusEl = document.querySelector("#platformStatus");
const controls = document.querySelector("#controls");

function settingsFromForm() {
  const data = new FormData(controls);
  return {
    accent: data.get("accent"),
    backgroundBlur: Number(data.get("backgroundBlur")),
    backgroundDim: Number(data.get("backgroundDim")) / 100,
    homeOpacity: Number(data.get("homeOpacity")) / 100,
    taskOpacity: Number(data.get("taskOpacity")) / 100,
    motionEffect: data.get("motionEffect"),
    motionIntensity: Number(data.get("motionIntensity")) / 100,
    rain: data.get("rain") === "on",
    telemetry: data.get("telemetry") === "on",
    signalLights: data.get("signalLights") === "on",
  };
}

function setStatus(message) {
  statusEl.textContent = message;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function selectedTheme() {
  return state.themes.find((theme) => theme.id === state.selectedId) || state.themes[0] || null;
}

function renderThemes() {
  grid.innerHTML = "";
  for (const theme of state.themes) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "theme-card";
    card.setAttribute("aria-selected", theme.id === state.selectedId ? "true" : "false");
    card.innerHTML = `
      <img alt="" src="/api/asset?id=${encodeURIComponent(theme.id)}&kind=background">
      <div>
        <h3>${escapeHtml(theme.name)}</h3>
        <p>${theme.source === "preset" ? "公开预设" : "我的主题"} · ${escapeHtml(theme.profile)}</p>
      </div>
    `;
    card.addEventListener("click", () => {
      state.selectedId = theme.id;
      controls.themeName.value = theme.source === "preset" ? `${theme.name} Remix` : theme.name;
      controls.accent.value = theme.accent || "#e05a2a";
      renderThemes();
    });
    grid.appendChild(card);
  }
}

async function requestJson(url, options) {
  const response = await fetch(url, {
    headers: { "content-type": "application/json" },
    ...options,
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
  return body;
}

async function loadThemes() {
  setStatus("正在读取本机主题库...");
  const [platformBody, body] = await Promise.all([
    requestJson("/api/platform"),
    requestJson("/api/themes"),
  ]);
  state.platform = platformBody.platform;
  state.themes = body.themes;
  state.selectedId ||= state.themes[0]?.id || null;
  platformStatusEl.textContent = state.platform.canSwitch
    ? `${state.platform.label}：支持保存和一键切换`
    : `${state.platform.label}：支持保存主题，暂不支持一键切换`;
  document.querySelector("#switchTheme").disabled = !state.platform.canSwitch;
  renderThemes();
  setStatus(`已读取 ${state.themes.length} 套主题。`);
}

async function saveTheme() {
  const base = selectedTheme();
  if (!base) return;
  setStatus("正在保存为我的主题...");
  const body = await requestJson("/api/studio-themes", {
    method: "POST",
    body: JSON.stringify({
      baseId: base.id,
      name: controls.themeName.value,
      settings: settingsFromForm(),
    }),
  });
  state.selectedId = body.theme.id;
  await loadThemes();
  setStatus("已保存到本机主题列表。");
}

async function switchTheme() {
  const theme = selectedTheme();
  if (!theme) return;
  if (theme.source === "preset") {
    setStatus("公开预设需要先保存成我的主题，再启用。");
    return;
  }
  setStatus("正在切换 Codex 主题...");
  await requestJson("/api/switch", {
    method: "POST",
    body: JSON.stringify({ id: theme.id }),
  });
  setStatus(`已切换到 ${theme.name}。`);
}

document.querySelector("#refresh").addEventListener("click", loadThemes);
document.querySelector("#saveTheme").addEventListener("click", saveTheme);
document.querySelector("#switchTheme").addEventListener("click", switchTheme);

loadThemes().catch((error) => setStatus(error.message));
