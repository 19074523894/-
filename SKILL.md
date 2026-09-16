---
name: dsh-skin-avemujika
description: Install, rebuild, or tune the Ave Mujika dark skin for a local DeepSeek Harness (DSH) web profile. Use when someone wants this skin applied to their DSH, wants a DSH surface restyled to match it, or is debugging why a DSH skin override has no effect.
metadata:
  short-description: Install or tune the DSH Ave Mujika skin
---

# DSH Ave Mujika Skin

This folder is two things at once: a working DSH web plugin and a Codex skill. The skill exists because installing and tuning this skin has non-obvious failure modes that cost hours to rediscover.

## Install

Build first if `src/` changed, then install with a remove-then-add pair:

```bash
npm install && npm run build
dsh plugin --profile web remove dsh-skin-avemujika
dsh plugin --profile web add file:<absolute path to this folder>
dsh web --no-open --host 127.0.0.1 --port 3088
```

Verify the install actually landed by comparing the built and installed bundle sizes. They must match:

```bash
stat -c%s lib/client.js
stat -c%s "$HOME/.dsh/profiles/web/node_modules/dsh-skin-avemujika/lib/client.js"
```

Two things break this step silently:

- **`add` alone is not enough.** pnpm caches a `file:` dependency by path, so it reports "Already up to date" and keeps the old bundle. Always `remove` first.
- **A stale install looks like a broken CSS edit.** If a change has no visible effect, check the size match before debugging the stylesheet.

Never set `PNPM_CONFIG_STORE_DIR` for `dsh plugin`. If it disagrees with the store the profile was linked from, pnpm aborts with `ERR_PNPM_UNEXPECTED_STORE`. Use pnpm's default store.

Do not delete the profile directory or pass `--force`-style flags to force a reinstall; the remove/add pair is sufficient and reversible.

## After editing the skin

1. `npm run build`
2. remove/add as above
3. Restart `dsh web`  -  it prints a fresh token on every start, and the previous URL stops working
4. `npm run verify` and `npm run test:runtime`

The runtime test stubs a minimal DOM. If you add DOM API usage to `apply()`, extend the stub in `scripts/runtime-smoke.mjs` rather than weakening the assertions.

## Invariants worth knowing before you touch the CSS

- **DSH defines its palette twice**, once on `:root` and once under `body[data-ds-dark-theme]`. Overriding a handful of tokens is not enough  -  anything unlisted falls back to the light palette. The plugin pins the attribute instead of enumerating tokens.
- **Token names carry a suffix.** The real families are `--dsw-alias-label-*`, `--dsw-alias-border-l1..l4`, `--dsw-alias-bg-layer-1/2`, plus `--dsw-specific-*`. Names like `alias-text-primary` or `alias-border` do not exist, and `overrideTokens({...})` accepts unknown keys silently, so a typo is invisible.
- **DSH hardcodes some shell colours** (`rgb(21,21,23)`, `rgb(27,27,28)`) on `_frame`/`_root`/`_card`. No token reaches them; only clearing the background does.
- **A `backdrop-filter` paints a hard-edged box.** Blur on a panel that meets unblurred content produces a visible seam at its edge. Prefer one blurred surface per region, not several nested ones.
- **Check the artwork, not the screenshot.** Several tuning rounds here were settled by sampling pixels from the reference and computing the resulting composite in Node, because the values involved (`0.04` vs `0.09` alpha) are indistinguishable by eye but measurable.

## References

- [references/tuning.md](references/tuning.md)  -  every tunable value, its current setting and what it visually controls.
- [references/dsh-internals.md](references/dsh-internals.md)  -  the DSH class names, tokens and mechanisms this skin depends on, and how each was verified.
