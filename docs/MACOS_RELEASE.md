# macOS Beta 发布

当前官网：<https://swording-k.github.io/codex-theme-creator/>

## 第一次配置

1. 加入 Apple Developer Program，并在 Developer Account 创建并安装 `Developer ID Application` 证书。
   `Apple Development` 证书只能用于开发测试，不能替代它。
2. 在 App Store Connect 创建 API Key，或创建 Apple ID app-specific password。
3. 在本机保存公证凭据：

```bash
xcrun notarytool store-credentials codex-theme-creator-notary \
  --apple-id "YOUR_APPLE_ID" \
  --team-id "YOUR_TEAM_ID" \
  --password "APP_SPECIFIC_PASSWORD"
```

## 发布

```bash
./scripts/publish-macos-beta.sh 0.1.0
```

脚本会构建、使用 Developer ID 签名、公证、staple、Gatekeeper 校验，并上传 GitHub prerelease 的 DMG。

不要上传尚未通过 `spctl` 校验的 DMG。官网按钮已经指向 GitHub Releases；首次 Release 发布后即可下载。
