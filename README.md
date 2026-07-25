# udun-website-new

Udun 官网项目，基于 EverGreen Design System (Website) 构建。

## 线上地址

GitHub Pages：https://theyangsong.github.io/udun-website-new/

## 前置要求

- Node.js 20+
- pnpm 9+
- 同级目录存在 `eds-website`：

```
Projects/
  eds-website/       ← 设计系统规范包
  udun-website-new/  ← 本项目
```

## 设计系统依赖

| 包 | 来源 |
|---|---|
| `@eds/website-tokens` | `link:../eds-website/packages/tokens` |
| `@eds/website-components` | `link:../eds-website/packages/components` |

设计系统近期变更与 Udun 迁移说明见 **[docs/EDS-WEBSITE-SYNC.md](./docs/EDS-WEBSITE-SYNC.md)**（含颜色语义、`EgButton` Event overlay、`EgToggle` → `EgCheckbox` / `EgRadio` 等）。

## 开发

```bash
pnpm install
pnpm dev
```

`predev` 会先构建 `eds-website` 的 tokens 与 components。

浏览器打开 http://localhost:5178/

## 构建

```bash
pnpm build
# 或静态站点
pnpm generate
```

GitHub Pages 会在推送到 `main` 后自动检出同账户下的 **`eds-website`** 仓库（见 `.github/workflows/deploy-pages.yml` 中 `EDS_WEBSITE_GITHUB_REPO`，检出目录为 `eds-website/`）、构建设计系统并发布本站。
