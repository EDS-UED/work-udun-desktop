# udun-website-new

Udun 官网项目，基于 EverGreen Design System (Website) 构建。

## 线上地址

GitHub Pages：https://theyangsong.github.io/udun-website-new/

## 前置要求

- Node.js 20+
- pnpm 9+

## 设计系统依赖

| 包 | 来源 |
|---|---|
| `@evergreen/tokens` | `file:./vendor/evergreen-tokens` |
| `@evergreen/components` | `file:./vendor/evergreen-components` |

## 开发

```bash
pnpm install
pnpm dev
```

浏览器打开 http://localhost:5177/

## 构建

```bash
pnpm build
# 或静态站点
pnpm generate
```

GitHub Pages 会在推送到 `main` 后自动构建并发布。
