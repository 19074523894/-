# dsh-skin-avemujika

An Ave Mujika dark skin for [DeepSeek Harness](https://github.com/deepseek-ai) (DSH) web, packaged so it can also be installed as a Codex skill.

The skin replaces DSH's opaque chrome with the artwork itself: a full-bleed background, a frosted rail whose surface is nearly transparent, a translucent composer, and a dark palette that stays consistent no matter which theme the app thinks it is in.

## What it changes

| Surface | Effect |
| --- | --- |
| App shell | `_frame` / `_root` / `_page` layers cleared so the artwork shows through |
| Sidebar rail | 4% fill with a 3px backdrop blur and a 1px right border |
| Composer | 58% fill with a 5px backdrop blur; opaque mask only while a conversation is active |
| Hero title | DSH's own 26px/500 scale, softened tone, "preview" badge removed |
| Typography | `--dsw-font-family` overridden (Segoe UI + DengXian on Windows) |
| Palette | 80+ tokens pinned to one dark branch, fonts included, via `data-ds-dark-theme` |
| Trajectory view | Inner surfaces cleared and re-tinted so the view stops reading as a grey slab |

## Install

```bash
# 1. build (only needed if you edit src/)
npm install
npm run build

# 2. install into the DSH web profile
dsh plugin --profile web remove dsh-skin-avemujika
dsh plugin --profile web add file:/absolute/path/to/dsh-skin-avemujika

# 3. start DSH and open the printed URL
dsh web --no-open --host 127.0.0.1 --port 3088
```

The `remove` step matters. pnpm keeps a snapshot of a `file:` dependency keyed by path, so a plain `add` after changing the source reports "Already up to date" and keeps serving the previous bundle.

Do **not** set `PNPM_CONFIG_STORE_DIR` for these commands. If the profile's `node_modules` were linked from a different store, pnpm refuses with `ERR_PNPM_UNEXPECTED_STORE`; let pnpm use its default store.

## Uninstall

```bash
dsh plugin --profile web remove dsh-skin-avemujika
```

The plugin owns its DOM through a Cordis effect, so removal deletes the style tag, the background layer and the dark-theme attribute it pinned.

## Build

```bash
npm run build       # host half, types, client bundle, module wrapper
npm run verify      # file and invariant checks
npm run test:runtime # headless runtime smoke test of apply()/dispose()
```

`lib/` is committed on purpose: DSH loads `lib/client.js` directly, so a clone is installable without a build step.

## Tuning

Every value the skin exposes is documented in [references/tuning.md](references/tuning.md) — the three backdrop blurs, the composer and rail alphas, the veil baked into the background, and which token families are safe to override.

## Compatibility

Verified against DSH `0.1.2-rc.1` on Windows. DSH compiles its component classes as `<hash>_<semanticName>`, so the skin selects on the semantic suffix (`_sidebarCol`, `_previewBadge`, `_composerStack`…) rather than the hash. A DSH release that renames those source classes would need the matching selectors updated; [references/dsh-internals.md](references/dsh-internals.md) records what was verified and how.

## Licensing

Two different things live in this repository and they are licensed separately.

**Code** - MIT, see [LICENSE](LICENSE). Use it, fork it, ship it, including commercially.

**Artwork** - `assets/bg-avemujika.png` is fan art of Ave Mujica / BanG Dream! and is **not** covered by the MIT license. It is distributed as non-commercial fan work: use it personally, share it, retheme the rest of the skin around it. Do not sell it, bundle it into a paid product, or use it in advertising. Character, franchise and original artwork rights remain with their respective owners.

If you want to use this skin commercially, replace the background asset with artwork you own or have licensed and keep everything else.
