const downloadCount = document.querySelector("#downloadCount");

async function loadReleaseDownloads() {
  try {
    const response = await fetch("https://api.github.com/repos/swording-k/codex-theme-creator/releases?per_page=50", {
      headers: { accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const releases = await response.json();
    const total = releases
      .flatMap((release) => release.assets || [])
      .filter((asset) => /\.(?:dmg|exe|msi|zip)$/i.test(asset.name || ""))
      .reduce((sum, asset) => sum + Number(asset.download_count || 0), 0);
    downloadCount.textContent = `${total.toLocaleString("zh-CN")} 次`;
  } catch {
    downloadCount.textContent = "持续增长中";
  }
}

loadReleaseDownloads();
