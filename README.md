# udun-website-new

Udun 官网项目，基于本地 [EverGreen Design System (Website)](../evergreen-design-system-website) 构建。

## 前置要求

- Node.js 20+
- pnpm 9+
- 同级目录需存在 `evergreen-design-system-website`

```
Projects/
  udun-website-new/                  ← 本项目
  evergreen-design-system-website/   ← 设计系统（tokens / components）
```

## 设计系统依赖

| 包 | 来源 |
|---|---|
| `@evergreen/tokens` | `link:../evergreen-design-system-website/packages/tokens` |
| `@evergreen/components` | `link:../evergreen-design-system-website/packages/components` |

`predev` / `prebuild` 会自动在 website 仓库执行 `pnpm build`。

## 开发

```bash
pnpm install
pnpm dev
```

开发地址：**http://localhost:5177/**

## 脚本

| 命令 | 说明 |
|---|---|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 类型检查 + 生产构建 |
| `pnpm preview` | 预览生产构建 |
| `pnpm typecheck` | 仅 TypeScript 检查 |

## 技术栈

- Vue 3 + TypeScript + Vite
- vue-router（SPA）
- vue-i18n（中 / 英）
- 亮 / 暗双主题（`data-theme` + design tokens）

## 当前状态

已实现首页、产品、优势、开发者、下载和帮助中心页面，以及中英文与亮暗主题切换。
