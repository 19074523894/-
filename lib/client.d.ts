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
declare const SKIN_ID = "ui-skin-avemujika";
declare const BODY_ATTR = "data-dsh-avemujika";
export declare const name = "dsh-skin-avemujika";
export declare const inject: string[];
/**
 * DSH client entry. The theme layer and DOM assets are owned by this Cordis
 * fiber, so HMR, route changes, and plugin disposal restore them together.
 */
export declare function apply(ctx: any): void;
export { SKIN_ID, BODY_ATTR };
//# sourceMappingURL=client.d.ts.map