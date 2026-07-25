# eds-website 设计系统同步说明

Udun 通过 `link:../eds-website/packages/*` 消费 EverGreen Website 包。本地 `pnpm dev` 的 `predev` 会构建 tokens 与 components；拉取或切换 `eds-website` 分支后请先在该仓库执行 `pnpm build:tokens && pnpm build:components`，再在本项目验证。

**Showcase 对照**：`eds-website` → `pnpm dev:showcase`（默认 http://localhost:5175），组件页 `/components/*`，Token 页 `/tokens`（Color Semantic 已按 Box / Event / Stroke … 分组锚点）。

---

## 2026-07-25 — 颜色语义色 / Button Event 交互

### 破坏性变更（Udun 需自查 CSS）

| 旧变量 | 新变量 / 说明 |
|--------|----------------|
| `--event-disable-base` / `--event-disable-base-waken`（拼写错误） | 已迁移为 **`--status-disable-base`**、**`--status-disable-base-weaken`** 等 **Status/** 系列（见 `/tokens` → Event / 文档内 Status 段） |
| `--event-hover-secondary` | **不存在**；DS 内已改为 **`--event-hover`**（IconButton / PaginationItem 等）。Udun 自定义样式勿再引用 `hover-secondary` |
| Danger 实心/描边 Button 填色 | 组件内改用 **`--status-danger`**（原 `--material-danger-primary` 等等价语义以 spec 为准） |

Udun 当前代码未引用上表旧名；**`var(--box-page)`、`var(--event-hover)` 可继续用**，重建 token 后语义会自动对齐 Figma。

### 颜色语义（`@eds/website-tokens`，仅 color spec 变更）

- **`--box-page`**：绑定 **`--eds-page`**（不再误用 `--eds-face`）→ **暗色主题页面背景**与 showcase 一致。
- **`--box-flotation`**：绑定 **`--eds-popup`**（与 Desktop / Figma 对齐）。
- 新增 **`--event-hover-light`**、**`--event-active-dark`**（实心控件 overlay 用）。
- 新增 **`--text-hide`**（透明字色，与 `stroke-hide` / `material-hide` 同类）。
- 文案/状态色部分迁入 **`text-*` / `status-*`**（如 `status-success`、`status-danger-weaken`）；详情以 `eds-website/packages/tokens/spec/color/semantic.json` 与 showcase **`/tokens`** 为准。

### 行为与样式（自动随 link + rebuild 生效）

- **`EgButton`（solid / outline 填色后）**：hover / active 的 `::before` overlay 改为 **`var(--event-hover-light)`** / **`var(--event-active-dark)`**；transition 仍为 **`--eds-motion-control-duration`** + **`--eds-motion-ease-in-out`**（动效未删）。
- **`EgButton`（text）**：overlay 为 **`--event-hover`** + **`--event-active-dark`**。
- 列表/导航等 **Udun 自写 hover** 继续用 **`--event-hover`** 即可（与 DS 浅底交互一致）；**不要**给实心 Button 手写 overlay，交给 `EgButton`。

### Udun 无需改业务组件时

拉取最新 `eds-website` 后：

```bash
cd ../eds-website && pnpm build:tokens && pnpm build:components
cd ../udun-website-new && pnpm dev   # predev 也会 build；建议先显式 build 一次
```

### 验证清单（Udun）

- [ ] 暗色主题：页面底 `--box-page` 与 header/footer 无「发灰错位」
- [ ] 邀请注册 / 全站 **`EgButton` brand solid**：hover 略提亮、按下略压暗（Event light/dark）
- [ ] 自研 hover 区块仍符合 `docs` 与 `.cursor/rules/hover-motion.mdc`（若存在）

---

## 2026-07-24 — Toggle / Button / 动效

### 破坏性变更（Udun 需改代码）

| 旧 API | 新 API |
|--------|--------|
| `EgToggle`（`type="checkbox" \| "radio" \| "switch" \| "decide"`） | 拆分为 **`EgSwitch`**、**`EgCheckbox`**、**`EgRadio`**、**`EgDecide`** |
| `EgToggle` 的 `size`、`label-variant` | 四类控件均支持 **`size="lg\|md\|sm"`**（box 20 / 18 / 16px）；文案用 default slot + typography class |
| `EgToggle` 根节点 variant 类 | Figma variant 在 **可视方框/轨道**（如 `toggle_checkbox_lg_unchecked`）+ module `surface`；**`<label>`** 仅 `root` + `data-size` / `data-disabled` |

**Udun 已改**：`InviteRegister.vue` 协议勾选 → `EgDecide`，联系方式 → `EgRadio`。

### 行为与样式（自动随 link 依赖生效）

- **Button**：实心/描边 hover、active 见 **2026-07-25**（`event-hover-light` / `event-active-dark`）；`::before` + `--eds-motion-ease-in-out`；solid/text `border-width: 0`。
- **Switch**：圆点 **translateX 滑动**，时长 **`0.2s`**（`--eds-switch-motion-duration`）；轨道背景同色缓动。
- **Checkbox**：未选 hover 浅底 + 预览勾；选中 hover 白色 mix 提亮；`forceHover` 仅文档/showcase 固定悬浮态。
- **动效变量**（`@eds/website-components` → `motion.css`）：`--eds-motion-hover-duration`（0.35s）、`--eds-motion-control-duration`（0.5s）、`--eds-motion-ease-in-out`。

### 组件根命名（集成 / E2E）

Variant 字符串规则：`toggle_{switch|checkbox|radio|decide}_{lg|md|sm}_{state…}` 等（见 eds-website `.cursor/rules/component-naming.mdc`）。示例：`button_brand_solid_lg`、`toggle_checkbox_lg_unchecked`、`toggle_switch_md_on`。

### 默认排版

Website 控件默认 **Body/Small（16px）**，见 eds-website `typography-default.mdc`。Udun 页面文案若未指定样式，优先 body-small / body-small-strong。

### 可选：`EgCheckbox` props

- `modelValue`、`disabled`、`indeterminate`
- `forceHover`：仅展示用，生产页勿用

### 验证清单（Udun）

```bash
cd ../eds-website && pnpm build:tokens && pnpm build:components
cd ../udun-website-new && pnpm typecheck && pnpm build
```

- [ ] 邀请注册页：协议 Checkbox、联系方式 Radio 交互与样式
- [ ] 全站 hover 仍符合 `.cursor/rules/hover-motion.mdc`（与 DS 控件 transition 叠加无闪烁）

---

后续 eds-website 大变更请在本文件顶部追加 dated 小节，并在 PR 中 @ 官网维护人。
