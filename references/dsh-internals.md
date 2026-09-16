# DSH internals this skin depends on

Verified against DSH `0.1.2-rc.1` on Windows. Everything here was read out of the installed packages under
`<npm global>/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/` or measured on a running instance.

## Class naming

Components are CSS modules compiled as `<hash>_<semanticName>`, for example `pI_x6G_frame`, `wSkVaW_composerStack`, `hHd-Xa_newSession`. The hash changes between builds; the semantic suffix comes from the source class name and is stable. Select on the suffix (`[class*="_sidebarCol"]`) and scope with an ancestor when the suffix alone is ambiguous.

Watch for the suffix being a prefix of another class. `[class*="_newSession"]` matches the button **and** its inner label, which produced a stray inner outline until the selector was narrowed to `button[class*="_newSession"]`.

Substring selectors are not a substitute for reading the source: `[class*="_root"]` matches dozens of unrelated components. Use it for shell-level transparency where that breadth is exactly what you want, and never for anything that paints.

## Shell layout

```
#root
└─ pI_x6G_frame              background rgb(21,21,23) — hardcoded, not a token
   ├─ pI_x6G_sidebarCol      background var(--dsw-specific-sidebar-fill), overflow hidden
   │  └─ (wrapper) └─ hHd-Xa_root    background var(--dsw-specific-sidebar-fill), height 100%
   │        ├─ hHd-Xa_logoRow        height 60px, margin-bottom 8px
   │        ├─ hHd-Xa_newSession     border .5px var(--dsw-alias-border-l3), fill button-elevated-fill
   │        ├─ hHd-Xa_regionArea     flex 1, the session list
   │        └─ hHd-Xa_footArea       the settings row
   └─ wSkVaW_root             background var(--dsw-alias-bg-base) — hardcoded in effect
      └─ wSkVaW_scrollBody → wSkVaW_viewArea → wSkVaW_composerSeat → wSkVaW_composerStack
```

`pI_x6G_frame`, `wSkVaW_root` and the composer card all paint opaque colours that no theme token reaches. The skin clears them rather than trying to retint them.

## Conversation header and view tabs

`wSkVaW_header` has `border-bottom:1px solid #0000` — fully transparent by design. The 对话 / 轨迹 tabs are `wSkVaW_tabs` / `wSkVaW_tab` / `wSkVaW_tabActive`; the active tab is only recoloured, its underline is not a border. Trajectory registers itself into the `conversation.view` slot with `id: "trajectory"`, which is why the tabs belong to the conversation package while the view body belongs to the trajectory package.

`pXSMma_previewBadge` is the "预览版" pill next to the hero headline, rendered from the `hero.preview` key as a sibling `<span>` of the headline text. The headline itself is `font-size:26px; font-weight:500` in the inherited stack — not a serif.

## Composer states

`className: clsx(composerStack, hero && composerHero)`

`composerHero` is present only in the empty state, which is what makes `[data-phase="active"]` and `:not([class*="composerHero"])` usable as state switches. In the active phase DSH positions the seat absolutely at the bottom of the scroll body and fades `--dsw-alias-bg-base` in from 36px.

The send button is `uV2eYG_primary`, 34px round, background `var(--dsw-alias-button-info-fill)`, lifted with `translateY(-2px)`, and it becomes the stop button while a run is active. Its label comes from `input.send` / `input.stop`, so the aria-label changes but the element does not.

## Trajectory view

```
qBU-ya_root                  view root, background var(--dsw-alias-bg-layer-1)
└─ fV0t5q_root              toolbar, height var(--dsh-trajectory-toolbar-height), border-bottom
_1p9O6q_root                 timeline, border-bottom, contains _1p9O6q_plot
Y0dWHa_*                     rows, details, overview — most paint bg-layer-1
```

Almost every surface here uses `--dsw-alias-bg-layer-1`, which is why the tray read as one flat slab until that token was lightened and `--dsw-alias-bg-module-platform` was given a tint.

## Theme mechanism

The palette is defined twice:

```css
:root { --dsw-static-*: <light>; --dsw-alias-*: <light>; --dsw-specific-*: <light> }
body[data-ds-dark-theme] { --dsw-static-*: <dark>; … }
```

The switch is the attribute, not a media query. `body[data-ds-dark-theme]` outranks `:root` on specificity, so pinning the attribute makes the dark branch authoritative everywhere at once.

Real token families confirmed in the theme package:

- `--dsw-static-*` — raw palette
- `--dsw-alias-label-primary`, `-primary-bluish`, `-secondary`, `-tertiary`, `-caption`, `-dimmed`, `-inverted`, `-foreground`
- `--dsw-alias-border-l1` … `-l4` (there is no `--dsw-alias-border`)
- `--dsw-alias-bg-base`, `-layer-1`, `-layer-2`, `-module-platform`, `-mask-1`
- `--dsw-alias-button-info-fill` / `-hover`, `--dsw-alias-button-elevated-fill`, `--dsw-alias-interactive-bg-hover`
- `--dsw-specific-sidebar-fill`, `-input-major`, `-menu`, `-tip`, `-bubble`, `-selector`
- `--dsw-font-family`, `--ds-font-family-code`

`ctx.theme.overrideTokens(source, tokens)` accepts `{ light, dark }` pairs per key, then `dsh-client-ui-layout` applies each entry with `body.style.setProperty(name, value)`. The key is therefore the CSS variable itself and must carry the full `--dsw-` prefix; an unprefixed key is an invalid property name, so `setProperty` drops it silently and the override appears to do nothing. DSH's own guard message for the two-argument form spells the shape out: `overrideTokens('mine', { '--dsw-alias-…': { light: '…', dark: '…' } })`.

## Where DSH mounts its overlays

The settings panel is **not** portalled to `document.body`. `SettingsRoot` returns a fragment containing the rail's footer trigger and, when open, the panel:

```jsx
<Fragment>
  <div className="...triggerRow..."><button ... /></div>
  {open && <SettingsPanel ... />}
</Fragment>
```

`SettingsPanel` renders `VOzbGW_overlay` — `position: fixed; inset: 0` — around an 800px `VOzbGW_panel` carrying `role="dialog"`. Because it is inline rather than portalled, any ancestor that creates a containing block (via `transform`, `filter`, or `backdrop-filter`) traps that overlay at the ancestor's size. The rail is such an ancestor as soon as a skin puts a backdrop blur on it.

Practical consequence for skin authors: treat `backdrop-filter` as unsafe on any container that holds app content, and prefer a `::before` layer when the blur is purely decorative.

Also note that the panel carries `role="dialog"`, so a broad `[role="dialog"]` rule in a skin will restyle it — that is how this panel ends up with an opaque surface while the rest of the UI is translucent.

## Plugin install mechanics

- A bundle plugin installs as a `file:` dependency into `<DSH home>/profiles/web`. The browser half is declared through `package.json` → `dsh.client` and served from `/plugins`.
- Only `/plugins` routes are served for client bundles, so the background image is inlined as a data URL at build time rather than fetched from `assets/`.
- pnpm caches `file:` dependencies by path: `add` after a rebuild reports "Already up to date" and keeps the old bundle. `remove` then `add` is required.
- Setting `PNPM_CONFIG_STORE_DIR` to a store other than the one the profile was linked from fails with `ERR_PNPM_UNEXPECTED_STORE`. Use the default store.
- `dsh web` refuses `--host 0.0.0.0` by design (it would expose remote code execution) and binds loopback only.

## Web auth

`dsh web` prints `http://127.0.0.1:<port>/?token=…`. The token is generated once per process from 32 random bytes and is **not** single-use; a `GET /` carrying it mints an HttpOnly, SameSite=Strict session cookie bound to the request authority and redirects to `/`. Any other request without that cookie gets a 401. Consequences worth remembering:

- Restarting `dsh web` invalidates the previous URL; the token changes.
- A cookie minted for `127.0.0.1:3088` does not authenticate `localhost:3088` — the authority differs, so the token must be presented again.
- The token is stable for the process lifetime, so using it to test a URL does not lock the user out.

## What was verified how

| Fact | Method |
| --- | --- |
| Shell layers paint hardcoded colours | Read the layout/conversation stylesheets; confirmed against computed styles from the running page |
| Palette switches on `data-ds-dark-theme` | Read `dsh-client-ui-theme/lib/client.js` |
| Token names | Regex over the theme package rather than assumption — this is how `alias-text-*` and `alias-border` were caught as non-existent |
| Composer hero/active split | Read the JSX class expression and the module stylesheet |
| Session-list fade drew the band | Read `dsh-client-ui-workspace` stylesheet; the 24px fade gradient matched the measured band |
| Blur boundary drew the header line | Measured a 28-level single-row step against a 14px blur edge; removing the blur removed it |
| Brightness match to the reference | Pixel sampling with `sharp` at nine matched coordinates; converged to a mean ratio of 1.03 |
