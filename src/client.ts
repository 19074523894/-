/**
 * dsh-skin-avemujika — client (browser) half
 *
 * Injects the Ave Mujika dark-gothic skin into the DSH Web UI:
 *   1. Full-screen character background (image kept 100% original, no mask/filter)
 *   2. Gothic-lace UI overlay (dark red / gold / deep purple palette)
 *   3. DSH theme token override via ctx.theme.overrideTokens
 *   4. bodyAttr hook `data-dsh-avemujika` for animation / selector scoping
 *   5. Light / dark theme auto-adaptation (dark mask vs. dim mask)
 *
 * Built as CJS by tsdown, then wrapped into __ModuleLoader__.load factory
 * by scripts/wrap-client.mjs. External deps must come from the DSH module
 * seed table (react, react/jsx-runtime) — everything else is bundled.
 */

const SKIN_ID = 'ui-skin-avemujika'
const PACKAGE_ID = 'dsh-skin-avemujika'
const BODY_ATTR = 'data-dsh-avemujika'
const STYLE_ID = 'dsh-avemujika-style'
const BG_LAYER_ID = 'dsh-avemujika-bg'
const DARK_THEME_ATTR = 'data-ds-dark-theme'

// DSH serves only client bundles from /plugins. Bundling the source image as a
// data URL keeps the pixel source available across all DSH routes.
import BG_URL from '../assets/bg-avemujika.png'

/* ──────────────────────────────────────────────────────────────
   CSS — Gothic dark overlay
   ────────────────────────────────────────────────────────────── */
const GOTHIC_CSS = `
/* ===== DSH shell: the artwork must remain visible through every layout layer ===== */
html, body { background: transparent !important; }

/* DSH exposes its type stack as --dsw-font-family. Overriding the token adapts
   every component at once, instead of forcing font-family on each element and
   fighting DSH's own size/weight tokens. Latin resolves to Segoe UI, CJK to
   DengXian (a lighter humanist face than Microsoft YaHei). */
html:root {
  --dsw-font-family: "Segoe UI Variable Text", "Segoe UI", -apple-system, BlinkMacSystemFont, "DengXian", "Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif;
  /* The session list lays a 24px scroll fade over its bottom edge:
     linear-gradient(to bottom, transparent, var(--dsw-specific-sidebar-fill)).
     The rail is translucent here, so an opaque fill painted a hard band above
     the settings row. Only three rules read this token - the rail, its inner
     root, and that fade - and the first two are already transparent, so
     clearing it removes the band without touching anything else. */
  --dsw-specific-sidebar-fill: transparent;
}
body[${BODY_ATTR}] { color-scheme: dark; }

/* ===== Background artwork ===== */
#${BG_LAYER_ID} {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: url("${BG_URL}");
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  opacity: 1;
  filter: none;
}

/* App content sits above the fixed artwork layer. */
body[${BODY_ATTR}] > #root {
  position: relative;
  z-index: 1;
}

/* DSH paints its shell layers with hard-coded opaque colors (rgb(21,21,23)
   and rgb(27,27,28)) that never consult theme tokens. Clearing them is what
   lets the artwork show through; class names follow DSH CSS-module suffixes. */
body[${BODY_ATTR}] [class*="_frame"],
body[${BODY_ATTR}] [class*="_page"],
body[${BODY_ATTR}] [class*="_shell"],
body[${BODY_ATTR}] [class*="_mainCol"],
body[${BODY_ATTR}] [class*="_root"] {
  background: transparent !important;
}

/* ===== Sidebar: frosted rail, tuned so the artwork keeps its contrast ===== */
/* The blur must NOT live on the rail itself. An element with backdrop-filter
   becomes the containing block for its fixed-position descendants, and DSH
   renders the settings overlay as a sibling of the rail footer button rather
   than through a portal. With the filter on the rail, "position: fixed;
   inset: 0" resolved against the rail instead of the viewport, collapsing the
   800px settings panel to the rail width and squeezing its content to one
   character per line.

   A pseudo-element has no descendants, so it can carry the blur without
   becoming anyone's containing block; position: relative anchors its inset: 0.
   isolation: isolate is deliberately NOT used here: it would turn the rail into
   a backdrop root and the pseudo would have nothing left to sample. */
body[${BODY_ATTR}] [class*="_sidebarCol"] {
  position: relative !important;
  background: rgba(7, 18, 29, 0.04) !important;
  border-right: 1px solid rgba(214, 231, 242, 0.62) !important;
}

body[${BODY_ATTR}] [class*="_sidebarCol"]::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  backdrop-filter: blur(3px) saturate(0.85);
  -webkit-backdrop-filter: blur(3px) saturate(0.85);
}

/* Only the button itself carries the outline. DSH names the inner label with a
   class that also contains "_newSession", so the selector must stay on button. */
body[${BODY_ATTR}] button[class*="_newSession"] {
  background: rgba(9, 20, 31, 0.22) !important;
  border: 1px solid rgba(224, 236, 244, 0.72) !important;
  border-radius: 14px !important;
  color: #e8f1f7 !important;
  box-shadow: none !important;
}

body[${BODY_ATTR}] button[class*="_newSession"] * {
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

/* Belt and braces for the same fade: if a future DSH build keeps painting it
   from another source, the strip itself still resolves to nothing. */
body[${BODY_ATTR}] [class*="_sidebarCol"] [class*="_fade"] {
  background: none !important;
}

body[${BODY_ATTR}] button[class*="_newSession"]:hover {
  background: rgba(143, 174, 194, 0.18) !important;
}

body[${BODY_ATTR}] [class*="_sidebarCol"] button:hover,
body[${BODY_ATTR}] [class*="_sidebarCol"] [class*="_row"]:hover {
  background: rgba(143, 174, 194, 0.16) !important;
}

/* ===== Composer ===== */
body[${BODY_ATTR}] [class*="composerSeat"] {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}

body[${BODY_ATTR}] [class*="composerStack"] {
  position: relative !important;
  background: rgba(10, 22, 33, 0.16) !important;
  border: 1px dashed rgba(214, 230, 240, 0.42) !important;
  border-radius: 16px !important;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.16) !important;
}

body[${BODY_ATTR}] [class*="composerStack"]:focus-within {
  border-color: rgba(230, 241, 248, 0.72) !important;
}

/* Active conversation: the transcript scrolls underneath the composer, so the
   seat and the input surface must mask it. DSH fades --dsw-alias-bg-base in
   from 36px, but that token is translucent here, so the fade is restated with
   an opaque colour instead of leaving the text bleeding through. */
body[${BODY_ATTR}] [data-phase="active"] [class*="composerSeat"] {
  z-index: 7 !important;
  background: linear-gradient(180deg, rgba(24, 34, 45, 0) 0px, rgba(24, 34, 45, 0.40) 36px, rgba(26, 36, 47, 0.54) 100%) !important;
}

body[${BODY_ATTR}] [data-phase="active"] [class*="composerStack"] {
  background: rgba(26, 38, 52, 0.58) !important;
  backdrop-filter: blur(5px) saturate(1.08);
  -webkit-backdrop-filter: blur(5px) saturate(1.08);
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.26) !important;
}

/* The input card stays barely tinted: measured reference contrast in this area
   is p10..p90 = 28..119, so a heavy fill would flatten the artwork.

   Scoped to the composer on purpose. Ten other modules name classes *_card -
   the approval card (whose warning border would vanish), the settings plugin
   cards, the tool card, the agent-preset card - and an unscoped rule restyled
   all of them. */
body[${BODY_ATTR}] [class*="composerStack"] [class*="_card"] {
  background: rgba(12, 18, 26, 0.10) !important;
  border: 0 !important;
  border-radius: 16px !important;
}

/* The send button ships with var(--dsw-alias-button-info-fill), an info-blue
   that belongs to DSH's default palette rather than this skin. Recolour it to
   the same cool grey as the rail without touching the shared info token, so
   other info buttons keep their meaning. box-shadow draws the 1px ring so the
   34px hit area does not grow. */
body[${BODY_ATTR}] [class*="composerStack"] [class*="_primary"] {
  background: rgba(158, 173, 185, 0.55) !important;
  color: rgba(255, 255, 255, 0.92) !important;
  box-shadow: inset 0 0 0 1px rgba(214, 231, 242, 0.34) !important;
}

body[${BODY_ATTR}] [class*="composerStack"] [class*="_primary"]:hover:not(:disabled) {
  background: rgba(186, 200, 211, 0.74) !important;
}

body[${BODY_ATTR}] [class*="composerStack"] [class*="_primary"]:disabled {
  background: rgba(140, 154, 165, 0.32) !important;
}

/* DSH renders a preview badge (i18n key "hero.preview") beside the hero
   title as <span class="..._previewBadge">. Hiding the element removes both
   the pill and its text. */
body[${BODY_ATTR}] [class*="_previewBadge"] {
  display: none !important;
}

/* ===== Trajectory view =====
   DSH stacks several near-opaque surfaces here (view root, toolbar, split pane,
   overview). Measured against the artwork the result was rgb(50,50,51) with no
   colour cast - darker and greyer than the rail next to it - which is what made
   it read as a slab pasted onto the picture. Collapse it into one frosted pane
   tinted like the rail and let the inner containers stop painting. */
body[${BODY_ATTR}] [class*="_root"]:has([class*="_plot"]) [class*="_split"],
body[${BODY_ATTR}] [class*="_root"]:has([class*="_plot"]) [class*="_overviewPreview"],
body[${BODY_ATTR}] [class*="_root"]:has([class*="_plot"]) [class*="_historyLoadingBar"] {
  background: transparent !important;
}

/* ===== Typography ===== */
body[${BODY_ATTR}],
body[${BODY_ATTR}] button,
body[${BODY_ATTR}] input,
body[${BODY_ATTR}] textarea {
  letter-spacing: 0.01em;
}

/* DSH styles the hero title at 26px/500 in the inherited stack; the skin keeps
   that scale and only softens the tone so it settles into the artwork. */
body[${BODY_ATTR}] h1,
body[${BODY_ATTR}] h2,
body[${BODY_ATTR}] h3 {
  letter-spacing: 0.03em;
  color: #e9f2f8 !important;
  text-shadow: 0 2px 10px rgba(3, 8, 14, 0.62);
}

/* The hero title only. Other *_headline elements exist - the approval card
   headline and the model menu section label - and an unscoped rule turned the
   muted menu label bright white. */
body[${BODY_ATTR}] [class*="composerHero"] [class*="headline"] {
  letter-spacing: 0.03em;
  color: #e9f2f8 !important;
  text-shadow: 0 2px 10px rgba(3, 8, 14, 0.62);
}

body[${BODY_ATTR}] {
  color: #dae6ef !important;
  text-shadow: 0 1px 2px rgba(3, 8, 14, 0.45);
}

body[${BODY_ATTR}] textarea::placeholder,
body[${BODY_ATTR}] input::placeholder {
  color: rgba(206, 221, 231, 0.62) !important;
}

/* ===== Message surfaces (chat view) ===== */
body[${BODY_ATTR}] [class*="message"][class*="user"],
body[${BODY_ATTR}] [class*="bubble"][class*="user"] {
  background: rgba(12, 25, 37, 0.56) !important;
  border: 1px solid rgba(185, 214, 230, 0.28) !important;
  border-radius: 14px 14px 4px 14px !important;
  color: #edf7fc !important;
}

body[${BODY_ATTR}] pre,
body[${BODY_ATTR}] [class*="code-block"] {
  background: rgba(7, 16, 26, 0.78) !important;
  border: 1px solid rgba(179, 210, 228, 0.22) !important;
  border-radius: 10px !important;
}

/* ===== Dialogs keep an opaque readable surface =====
   Only real dialog panels are listed. Two earlier selectors were wrong:
   [class*="modal"] matches nothing but _modalAction buttons and _modalError
   text, and a bare [role="dialog"] also matches the full-screen image lightbox
   backdrop (ImageLightbox .backdrop), the message-feedback note popover and the
   context meter, painting an opaque 800px-style slab over the whole viewport.
   The settings panel is the one role="dialog" element worth keeping opaque, and
   it is identifiable as the direct child of a modal overlay. */
body[${BODY_ATTR}] [class*="dialog"],
body[${BODY_ATTR}] [class*="_overlay"] > [class*="_panel"][role="dialog"] {
  background: linear-gradient(180deg, rgba(13, 27, 39, 0.96) 0%, rgba(8, 18, 29, 0.97) 100%) !important;
  border: 1px solid rgba(194, 221, 236, 0.38) !important;
  border-radius: 16px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6) !important;
}

/* ===== Scrollbar and selection ===== */
body[${BODY_ATTR}] ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

body[${BODY_ATTR}] ::-webkit-scrollbar-track {
  background: rgba(6, 14, 23, 0.34);
}

body[${BODY_ATTR}] ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(198, 219, 234, 0.58) 0%, rgba(96, 136, 160, 0.48) 100%);
  border-radius: 4px;
}

body[${BODY_ATTR}] ::selection {
  background: rgba(143, 174, 194, 0.42);
  color: #fff;
}
`

/* ──────────────────────────────────────────────────────────────
   Theme token override (DSH ThemeRuntime)
   Gives light/dark两套值，走官方 overrideTokens 机制
   ────────────────────────────────────────────────────────────── */
/* DSH applies overrides with body.style.setProperty(name, value), so each key
   IS the CSS variable name. Names must carry the full --dsw- prefix: an
   unprefixed key is an invalid property name and setProperty drops it silently,
   which is why an earlier revision of this map had no effect at all.
   Surfaces below are the real fix for the trajectory black slab: the dark
   palette defines --dsw-alias-bg-layer-1 as #232324, an opaque neutral grey,
   and every trajectory row consumes it. Making the token translucent clears
   every row in every session, not one patched panel. */
const TOKEN_OVERRIDES = {
  '--dsw-alias-bg-base': { light: 'rgba(8, 16, 26, 0.30)', dark: 'rgba(8, 16, 26, 0.30)' },
  '--dsw-alias-bg-layer-1': { light: 'rgba(10, 20, 31, 0.42)', dark: 'rgba(10, 20, 31, 0.42)' },
  '--dsw-alias-bg-layer-2': { light: 'rgba(14, 25, 37, 0.55)', dark: 'rgba(14, 25, 37, 0.55)' },
  '--dsw-alias-bg-layer-3': { light: 'rgba(16, 28, 41, 0.62)', dark: 'rgba(16, 28, 41, 0.62)' },
  '--dsw-alias-bg-module-platform': { light: 'rgba(14, 24, 36, 0.50)', dark: 'rgba(14, 24, 36, 0.50)' },
  '--dsw-alias-markdown-code-block': { light: 'rgba(8, 14, 22, 0.55)', dark: 'rgba(8, 14, 22, 0.55)' },
  '--dsw-alias-label-primary': { light: '#dce8f1', dark: '#dce8f1' },
  '--dsw-alias-label-primary-bluish': { light: '#dbeaf5', dark: '#dbeaf5' },
  '--dsw-alias-label-secondary': { light: '#b9cbd8', dark: '#b9cbd8' },
  '--dsw-alias-label-tertiary': { light: '#8fa3b2', dark: '#8fa3b2' },
  '--dsw-alias-label-caption': { light: '#8296a5', dark: '#8296a5' },
  '--dsw-alias-label-dimmed': { light: '#6f8391', dark: '#6f8391' },
  '--dsw-specific-menu': { light: 'rgba(12, 22, 33, 0.86)', dark: 'rgba(12, 22, 33, 0.86)' },
  '--dsw-specific-tip': { light: 'rgba(12, 22, 33, 0.88)', dark: 'rgba(12, 22, 33, 0.88)' },
  '--dsw-specific-bubble': { light: 'rgba(12, 25, 37, 0.56)', dark: 'rgba(12, 25, 37, 0.56)' },
  '--dsw-specific-input-major': { light: 'rgba(26, 38, 52, 0.58)', dark: 'rgba(26, 38, 52, 0.58)' },
  '--dsw-specific-selector': { light: 'rgba(18, 30, 42, 0.55)', dark: 'rgba(18, 30, 42, 0.55)' },
  '--dsw-specific-sidebar-fill': { light: 'transparent', dark: 'transparent' },
}

export const name = PACKAGE_ID
export const inject = ['theme']

/**
 * DSH client entry. The theme layer and DOM assets are owned by this Cordis
 * fiber, so HMR, route changes, and plugin disposal restore them together.
 */
export function apply(ctx: any): void {
  ctx.effect(() => {
    const existingStyle = document.getElementById(STYLE_ID)
    const styleEl = existingStyle instanceof HTMLStyleElement
      ? existingStyle
      : document.createElement('style')

    if (!existingStyle) {
      styleEl.id = STYLE_ID
      styleEl.textContent = GOTHIC_CSS
      document.head.appendChild(styleEl)
    }

    const existingBg = document.getElementById(BG_LAYER_ID)
    const bgLayer = existingBg instanceof HTMLDivElement
      ? existingBg
      : document.createElement('div')

    if (!existingBg) {
      bgLayer.id = BG_LAYER_ID
      document.body.appendChild(bgLayer)
    }

    document.body.setAttribute(BODY_ATTR, 'true')

    /* DSH defines its whole palette twice: once on :root and once under
       body[data-ds-dark-theme]. Only the token keys this skin lists are pinned
       to dark values, so with the attribute absent every unlisted token -
       including the --dsw-specific-* family - falls back to the light palette
       and clashes with the artwork. Pinning the attribute makes the dark branch
       authoritative regardless of the user's theme preference. */
    const hadDarkTheme = document.body.hasAttribute(DARK_THEME_ATTR)
    const pinDarkTheme = (): void => {
      if (!document.body.hasAttribute(DARK_THEME_ATTR)) {
        document.body.setAttribute(DARK_THEME_ATTR, '')
      }
    }
    pinDarkTheme()
    const themeGuard = typeof MutationObserver === 'function'
      ? new MutationObserver(() => pinDarkTheme())
      : void 0
    if (themeGuard !== void 0) {
      themeGuard.observe(document.body, { attributes: true, attributeFilter: [DARK_THEME_ATTR] })
    }

    const removeTokens = ctx.theme.overrideTokens(PACKAGE_ID, TOKEN_OVERRIDES)

    return () => {
      if (themeGuard !== void 0) themeGuard.disconnect()
      if (!hadDarkTheme) document.body.removeAttribute(DARK_THEME_ATTR)
      removeTokens()
      styleEl.remove()
      bgLayer.remove()
      document.body.removeAttribute(BODY_ATTR)
    }
  }, `${PACKAGE_ID}: visual layer`)
}

export { SKIN_ID, BODY_ATTR }
