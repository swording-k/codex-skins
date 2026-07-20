const state = {
  themes: [],
  selectedId: null,
  platform: null,
  previewTimer: null,
  previewRequest: 0,
};

const grid = document.querySelector("#themeGrid");
const statusEl = document.querySelector("#status");
const platformStatusEl = document.querySelector("#platformStatus");
const controls = document.querySelector("#controls");
const themeLibraryPathEl = document.querySelector("#themeLibraryPath");
const themePreview = document.querySelector("#themePreview");
const previewArt = document.querySelector("#previewArt");
const previewTitle = document.querySelector("#previewTitle");

function settingsFromForm() {
  const data = new FormData(controls);
  return {
    accent: data.get("accent"),
    backgroundBlur: Number(data.get("backgroundBlur")),
    backgroundDim: Number(data.get("backgroundDim")) / 100,
    homeOpacity: Number(data.get("homeOpacity")) / 100,
    taskOpacity: Number(data.get("taskOpacity")) / 100,
    motionEffect: "none",
    motionIntensity: 0,
    rain: false,
    telemetry: false,
    signalLights: false,
  };
}

function setStatus(message) {
  statusEl.textContent = message;
}

function controlsDisabled() {
  return !state.platform?.canSwitch;
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

function percent(value, fallback) {
  const number = Number(value);
  return Math.round(Number.isFinite(number) ? number * 100 : fallback);
}

function syncControls(theme) {
  if (!theme) return;
  const settings = theme.settings || {};
  controls.themeName.value = theme.source === "preset" ? `${theme.name} Remix` : theme.name;
  controls.accent.value = settings.accent || theme.accent || "#e05a2a";
  controls.backgroundBlur.value = Math.round(Number(settings.backgroundBlur ?? 0));
  controls.backgroundDim.value = percent(settings.backgroundDim, 18);
  controls.homeOpacity.value = percent(settings.homeOpacity, 54);
  controls.taskOpacity.value = percent(settings.taskOpacity, 86);
  applyLocalPreview(theme);
}

function applyLocalPreview(theme = selectedTheme()) {
  if (!theme) return;
  const settings = settingsFromForm();
  const backgroundUrl = `/api/asset?id=${encodeURIComponent(theme.id)}&kind=background`;
  previewArt.style.backgroundImage = `url("${backgroundUrl}")`;
  previewTitle.textContent = theme.name;
  themePreview.style.setProperty("--preview-accent", settings.accent || theme.accent || "#e05a2a");
  themePreview.style.setProperty("--preview-bg-blur", `${settings.backgroundBlur}px`);
  themePreview.style.setProperty("--preview-bg-brightness", String(Math.max(0.45, 1 - settings.backgroundDim * 0.55)));
  themePreview.style.setProperty("--preview-bg-scale", String(settings.backgroundBlur > 0 ? 1.015 + settings.backgroundBlur / 360 : 1));
  themePreview.style.setProperty("--preview-dim", String(settings.backgroundDim));
  themePreview.style.setProperty("--preview-home-opacity", String(settings.homeOpacity));
  themePreview.style.setProperty("--preview-task-opacity", String(settings.taskOpacity));
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
      syncControls(theme);
      renderThemes();
      setStatus(`已选择 ${theme.name}。调整后点击“保存并启用”才会作用到 Codex。`);
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
  themeLibraryPathEl.textContent = state.platform.themesRoot;
  document.querySelector("#switchTheme").disabled = !state.platform.canSwitch;
  document.querySelector("#applyTheme").disabled = !state.platform.canSwitch;
  renderThemes();
  syncControls(selectedTheme());
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

async function applyTheme() {
  const base = selectedTheme();
  if (!base) return;
  if (!state.platform?.canSwitch) {
    setStatus(state.platform?.switchUnavailableReason || "当前平台暂不支持一键切换。");
    return;
  }
  setStatus("正在保存设置并切换 Codex 主题...");
  const body = await requestJson("/api/apply", {
    method: "POST",
    body: JSON.stringify({
      baseId: base.id,
      name: controls.themeName.value,
      settings: settingsFromForm(),
    }),
  });
  state.selectedId = body.id;
  await loadThemes();
  setStatus(`已保存并切换到 ${body.theme.name}。`);
}

function scheduleLivePreview() {
  applyLocalPreview();
  if (controlsDisabled()) return;
  const base = selectedTheme();
  if (!base) return;
  clearTimeout(state.previewTimer);
  state.previewTimer = setTimeout(async () => {
    const requestId = ++state.previewRequest;
    try {
      setStatus("正在实时预览...");
      await requestJson("/api/preview", {
        method: "POST",
        body: JSON.stringify({
          baseId: base.id,
          name: controls.themeName.value,
          settings: settingsFromForm(),
        }),
      });
      if (requestId === state.previewRequest) {
        setStatus("已实时预览。满意后点“保存为我的主题”。");
      }
    } catch (error) {
      if (requestId === state.previewRequest) setStatus(`实时预览失败：${error.message}`);
    }
  }, 500);
}

function createPromptText() {
  return `请使用 Codex Theme Creator 为我创作一套完整 Codex Desktop 主题。

要求：
1. 不要只换背景图，要统一侧栏、选中态、New Chat 卡片、输入框、按钮、任务页和预览面板外壳。
2. 先生成或整理背景图，再根据背景明暗选择文字颜色、面板透明度、遮罩和强调色。
3. 保证新聊天和已有任务里的文字都清楚可读。
4. 完成后把主题安装到本机主题库，并切换到 Codex 让我验证。

我的主题想法：`;
}

async function copyCreatePrompt() {
  const prompt = createPromptText();
  try {
    await navigator.clipboard.writeText(prompt);
    setStatus("已复制创作提示词。回到 Codex，把你的主题想法接在最后一句后面。");
  } catch {
    window.prompt("复制这段提示词给 Codex：", prompt);
    setStatus("请复制弹窗里的提示词给 Codex。");
  }
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
document.querySelector("#createWithCodex").addEventListener("click", copyCreatePrompt);
document.querySelector("#copyPrompt").addEventListener("click", copyCreatePrompt);
document.querySelector("#saveTheme").addEventListener("click", saveTheme);
document.querySelector("#applyTheme").addEventListener("click", applyTheme);
document.querySelector("#switchTheme").addEventListener("click", switchTheme);
controls.addEventListener("input", scheduleLivePreview);
controls.addEventListener("change", scheduleLivePreview);

loadThemes().catch((error) => setStatus(error.message));
