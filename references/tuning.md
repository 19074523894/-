# Tuning reference

Current values, what each one controls, and the failure mode that made it necessary. Colours are written as CSS alpha on the stated base so you can adjust the alpha alone without touching hue.

## Background

| Item | Current | Controls |
| --- | --- | --- |
| Asset | `assets/bg-avemujika.png` | The full-bleed artwork. Also inlined into `lib/client.js` at build time. |
| Darkening | Baked into the PNG | Not a CSS filter. Three luminance zones (89% / 92% / 88%) blended with a smootherstep ramp, plus a right-weighted veil, all composited in Node. |
| CSS veil | none | A former `linear-gradient` overlay is gone. It used 5 stops, and linear interpolation between stops leaves a slope discontinuity that reads as a visible seam — three stops produced three seams. |

To regenerate the asset, composite in Node with `sharp` rather than in PowerShell: a 1666x933 pixel loop in PowerShell takes tens of seconds per pass, and each tuning round needs several.

The zone blend and the veil are both second-order continuous. Measured second difference of the effective gain curve: `5.4e-6` against `7.4e-4` for the old piecewise-linear version.

## Sidebar rail

| Rule | Current | Controls |
| --- | --- | --- |
| `[class*="_sidebarCol"]` fill | `rgba(7,18,29,0.04)` | Nearly nothing. At 0.04 the rail is indistinguishable from the artwork by brightness; measured region mean 53.8 against 55.4 for the bare artwork. |
| Blur | `blur(3px) saturate(0.85)`, on `[class*="_sidebarCol"]::before` | The only thing still separating rail from artwork. Raise toward 10px to restore a frosted read; 0px removes it entirely. |
| `border-right` | `1px solid rgba(214,231,242,0.62)` | The vertical hairline. Lower the alpha or remove to blend the rail fully. |
| `_newSession` | fill `0.22`, border `1px rgba(224,236,244,0.72)`, radius 14px | The outlined new-session button. |

### Why the rail blur sits on a pseudo-element

Never put `backdrop-filter` (or `filter`, or `transform`) on an element whose subtree contains app content. Any of those properties makes the element the containing block for its `position: fixed` *and* `position: absolute` descendants.

DSH renders its settings overlay as a sibling of the rail's own footer button, inline in the React tree rather than through a portal. With the blur on the rail, that overlay's `position: fixed; inset: 0` resolved against the rail instead of the viewport: the 800px panel was clamped to the rail width and its content column collapsed to about one character wide, so every label wrapped vertically.

Moving the blur to `::before` fixes it for every fixed or absolute descendant at once, because a pseudo-element has no descendants. Two details matter:

- Do **not** add `isolation: isolate` to the rail while doing this. It would turn the rail into a backdrop root and the pseudo would have nothing left to sample, silently killing the blur.
- The blur region is the padding box; add `border-radius: inherit` when applying the same technique to a rounded surface.

This trade-off is why the composer's blur was left alone. Composer blur has to sample the message list painted *behind* it; a `z-index: -1` pseudo paints before that content, so the messages would no longer be blurred and text would show through the input. The hazard is accepted there because the readability benefit is real and no fixed-position UI is mounted inside the composer.

### The session-list fade

DSH paints a 24px scroll fade at the bottom of the session list:

```css
.bhn1Oq_fade{ height:24px; position:absolute; bottom:0;
  background:linear-gradient(to bottom, transparent, var(--dsw-specific-sidebar-fill)); }
```

With a transparent rail that gradient still painted the original opaque rail colour, producing a hard dark band 63px above the settings row. Two independent guards now prevent it: `--dsw-specific-sidebar-fill` is set to `transparent`, and `[class*="_sidebarCol"] [class*="_fade"]` has `background:none`. Only three rules read that token — the rail, its inner root, and this fade — so clearing it is safe.

## Composer

Two states, and they must stay separate. DSH marks the empty state with `composerHero` on the same element.

| State | Rule | Current |
| --- | --- | --- |
| Hero seat | `[class*="composerSeat"]` | transparent, no border |
| Hero stack | `[class*="composerStack"]` | fill `rgba(10,22,33,0.16)`, dashed `1px rgba(214,230,240,0.42)`, radius 16px |
| Active seat | `[data-phase="active"] [class*="composerSeat"]` | `linear-gradient(180deg, rgba(24,34,45,0) 0px, rgba(24,34,45,0.40) 36px, rgba(26,36,47,0.54) 100%)` |
| Active stack | `[data-phase="active"] [class*="composerStack"]` | fill `rgba(26,38,52,0.58)`, `blur(5px) saturate(1.08)` |
| Input card | `[class*="_card"]` | fill `rgba(12,18,26,0.10)`, no blur |

The active-state fill is the only thing keeping scrolled messages from showing through, so it trades off against the blur: lowering the blur means raising the fill, and the other way round. The seat gradient exists because DSH's own version fades in `--dsw-alias-bg-base`, which this skin makes translucent; the fade is restated with an opaque colour.

**Do not put a `backdrop-filter` on a panel that meets unblurred content.** A blur paints inside the element box only, so its edge becomes a step where the local mean changes — that is what produced a visible 1px line under the conversation header. Measured: the offending row was 28 levels brighter than its neighbours, a hard edge rather than a gradient.

## Send button

`[class*="composerStack"] [class*="_primary"]`

| State | Current |
| --- | --- |
| Default | fill `rgba(158,173,185,0.55)`, icon `rgba(255,255,255,0.92)`, inset ring `rgba(214,231,242,0.34)` |
| Hover | fill `rgba(186,200,211,0.74)` |
| Disabled | fill `rgba(140,154,165,0.32)` |

The ring is drawn with `box-shadow: inset` rather than `border` because DSH does not set `box-sizing` on this button; a real border would grow the 34px hit area. The element doubles as the stop button while a run is active, so both states share this colour.

## Typography

| Rule | Current |
| --- | --- |
| `html:root` | `--dsw-font-family: "Segoe UI Variable Text", "Segoe UI", -apple-system, BlinkMacSystemFont, "DengXian", "Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif` |
| Body text | `#dae6ef` with `text-shadow: 0 1px 2px rgba(3,8,14,0.45)` |
| Headings | `#e9f2f8`, `letter-spacing: 0.03em`, `text-shadow: 0 2px 10px rgba(3,8,14,0.62)` |
| Placeholder | `rgba(206,221,231,0.62)` |

Override the token, not `font-family` on each element. Forcing the family per element bypasses DSH's own size and weight tokens, and mixing a Latin face with a CJK fallback produces exactly the mismatched look this token swap avoids. DengXian (等线) reads lighter than Microsoft YaHei and suits the artwork better; it ships with Windows 10+.

## Tokens

`TOKEN_OVERRIDES` in `src/client.ts`. Both `light` and `dark` entries carry the same value: the skin has one appearance, and the dark-theme pin below guarantees which branch is active.

**The key is the CSS variable.** DSH applies the map with `body.style.setProperty(name, value)`, so an unprefixed key like `alias-bg-layer-1` is an invalid property name and `setProperty` drops it without a word. An entire earlier revision of this file used unprefixed keys and therefore changed nothing. Every key must start with `--dsw-`.

| Token | Value | Consumed by |
| --- | --- | --- |
| `--dsw-alias-bg-base` | `rgba(8,16,26,0.30)` | App background |
| `--dsw-alias-bg-layer-1` | `rgba(10,20,31,0.42)` | **The trajectory row list**, panels, tool views. DSH's dark value is `#232324`, opaque neutral grey — this single token was the black slab. |
| `--dsw-alias-bg-layer-2` | `rgba(14,25,37,0.55)` | Deeper panels, timeline plot |
| `--dsw-alias-bg-layer-3` | `rgba(16,28,41,0.62)` | Backs `--dsw-specific-menu` |
| `--dsw-alias-bg-module-platform` | `rgba(14,24,36,0.50)` | Trajectory turn labels, compacted rows |
| `--dsw-alias-markdown-code-block` | `rgba(8,14,22,0.55)` | Tool payload blocks, Shiki background |
| `--dsw-alias-label-primary` | `#dce8f1` | Body text |
| `--dsw-alias-label-primary-bluish` | `#dbeaf5` | Bluish emphasis |
| `--dsw-alias-label-secondary` | `#b9cbd8` | Secondary text |
| `--dsw-alias-label-tertiary` | `#8fa3b2` | Tertiary text |
| `--dsw-alias-label-caption` | `#8296a5` | Captions |
| `--dsw-alias-label-dimmed` | `#6f8391` | Disabled and dimmed |
| `--dsw-specific-menu` | `rgba(12,22,33,0.86)` | Popup menus — kept near-opaque for legibility |
| `--dsw-specific-tip` | `rgba(12,22,33,0.88)` | Tooltips |
| `--dsw-specific-bubble` | `rgba(12,25,37,0.56)` | Chat bubbles |
| `--dsw-specific-input-major` | `rgba(26,38,52,0.58)` | Composer card |
| `--dsw-specific-selector` | `rgba(18,30,42,0.55)` | Selector chips |
| `--dsw-specific-sidebar-fill` | `transparent` | Rail; also neutralises the session-list scroll fade |

The dark palette declares 89 `--dsw-alias-*` / `--dsw-specific-*` variables in total, so there is room to go further. Two names from an earlier revision — `--dsw-alias-border` and `--dsw-alias-accent` — do not exist in that palette; the real border family is `--dsw-alias-border-l1` … `-l4`. They were removed rather than left as decoration.

`npm run verify` fails if any override key lacks the `--dsw-` prefix, so this class of mistake cannot ship silently again.

## Dark-theme pin

The plugin sets `data-ds-dark-theme` on `<body>` at startup and re-asserts it through a `MutationObserver` if DSH removes it. On dispose it removes the attribute only if it did not exist beforehand.

Without the pin, only the tokens listed above stay dark. Every other token — including the whole `--dsw-specific-*` family used by the composer, bubbles, menus and tooltips — falls back to DSH's light palette, which is visible as a full colour mismatch in light mode.

## Trajectory view

`[class*="_root"]:has([class*="_plot"]) [class*="_split"]`, plus `_overviewPreview` and `_historyLoadingBar`, are cleared to transparent. `:has([class*="_plot"])` only matches while a trajectory timeline is mounted, so no other view is affected.

An earlier version also put a tint and `blur(14px)` on the view root itself. Both were removed: the root's top edge sits against the conversation header, and the blur boundary drew a hard line there.

## Selector hygiene

DSH compiles classes as `<hash>_<semanticName>`, and the semantic suffix is only unique within its module. Before writing an unscoped `[class*="_suffix"]` rule, count how many modules define that suffix:

```bash
rg -o '[A-Za-z0-9_-]+_card\{' <dsh>/node_modules/@deepseek-ai/*/lib/client.js | sort -u
```

Verified counts in this DSH build:

| Suffix | Modules | Global rule safe? |
| --- | --- | --- |
| `_sidebarCol` | 1 | yes |
| `_composerStack` / `_composerSeat` / `_composerHero` | 1 | yes |
| `_previewBadge` | 1 | yes |
| `_primary` | 2 (InputBar, settings-models) | no — scope it |
| `_headline` | 3 (hero, approval card, model menu label) | no — scope it |
| `_card` | 11 (composer, approval, tool, agent preset, settings plugins, settings inventory, questions, …) | no — scope it |
| `_fade` | workspace session list | no — scope it |
| `role="dialog"` | real dialogs **plus** the full-screen image lightbox backdrop and two popovers | no — scope it |

Four bugs in this skin came from exactly this: an unscoped rule written for one visible element that silently restyled every other module with the same suffix. The visible symptoms were a muted menu label turning bright white, an approval card losing its warning border, and an opaque slab painted across the whole image lightbox. None of them appeared in the screen the rule was written for.

Rules of thumb:

- Scope by an ancestor that is genuinely unique (`[class*="composerStack"] [class*="_card"]`).
- When the target is a floating surface, prefer a structural relationship (`[class*="_overlay"] > [class*="_panel"][role="dialog"]`) over a bare role or suffix.
- Background-only rules on shell selectors (`_root`, `_frame`, `_page`) are low risk because the worst case is a transparent surface; anything that also sets `border`, `border-radius` or size needs scoping.

## Verifying a change

For anything below roughly 0.1 alpha, or any ±5px offset, measurement beats eyeballing:

1. Screenshot the running UI at a fixed viewport.
2. Sample matched patches from the screenshot and the reference with `sharp` and compare means and percentiles.
3. For overlay changes, composite the artwork and the overlay analytically in Node before rebuilding — it is faster than a rebuild/install cycle and removes the browser from the loop.

Sample points used during this project's tuning were nine coordinates spread across left, middle and right, chosen to sit on artwork rather than on any panel.
