# dsh-skin-avemujika

An Ave Mujika dark skin for [DeepSeek Harness](https://github.com/deepseek-ai) (DSH) web, packaged so it can also be installed as a Codex skill.

The skin replaces DSH's opaque chrome with the artwork itself: a full-bleed background, a frosted rail whose surface is nearly transparent, a translucent composer, and a dark palette that stays consistent no matter which theme the app thinks it is in.

## Screenshots

All screenshots are the running UI at 1920px on Windows. The artwork is the bundled background; every panel over it is translucent rather than painted on.

| Home (empty state) | Conversation |
| --- | --- |
| ![Home](https://gcore.jsdelivr.net/gh/19074523894/-@main/assets/screenshots/hero.webp) | ![Conversation](https://gcore.jsdelivr.net/gh/19074523894/-@main/assets/screenshots/conversation.webp) |

| Trajectory view | Settings |
| --- | --- |
| ![Trajectory](https://gcore.jsdelivr.net/gh/19074523894/-@main/assets/screenshots/trajectory.webp) | ![Settings](https://gcore.jsdelivr.net/gh/19074523894/-@main/assets/screenshots/settings.webp) |

The palette is applied through DSH theme tokens, so other client plugins rendered in the same page inherit it. The customer-service panel below is a separate plugin, included only to show that it picks up the same surfaces:

![Customer service panel](https://gcore.jsdelivr.net/gh/19074523894/-@main/assets/screenshots/customer-panel.webp)

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

This repository is licensed under **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International** (CC BY-NC-SA 4.0). The full legal text is in [LICENSE](LICENSE).

What that means in practice:

- **Non-commercial only.** Personal, educational and other non-commercial use, modification and sharing are allowed. Selling it, shipping it inside a paid product, or monetising it through advertising is not.
- **Attribution.** Credit the author and link back to this repository, and state whether you changed anything.
- **Share-alike.** A modified version you publish must carry the same license. It cannot be relicensed more permissively.
- **Commercial use needs written permission** from the author.

The license covers the code and the bundled artwork together. `assets/bg-avemujika.png` is fan art of Ave Mujica / BanG Dream! - character and franchise rights remain with their respective owners, and nothing here grants rights to those characters.
