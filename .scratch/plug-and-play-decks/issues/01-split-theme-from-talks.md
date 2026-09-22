# 01 — Split the theme from the talks

**What to build:** The shared visual system (layouts, general components, setup, global-bottom, brand art, stylesheet) lives in a local Slidev theme. Today's two decks live in their own talk folders, each with its own assets and components. A single CLI runs `dev`, `build`, `export` and `check` for a named talk. Both decks render exactly as they do today. Slide-specific CSS moves over unchanged for now (removed in 12). See DESIGN_PLAN.md §3.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] `npm run dev temporal-dataset` and `npm run dev seminar-intro` open the decks, visually unchanged
- [x] `npm run export <talk>` writes that talk's PDF
- [x] `npm run check <talk>` runs the existing overflow lint and passes where it passed before
- [x] Brand art (arcs, lockups, thinker) is served from the theme to every talk; answered in DESIGN_PLAN.md §3: dev does not serve a theme public folder, so theme/setup/vite-plugins.ts serves theme/assets/brand at /brand
- [x] Talk images and video live in the owning talk; the root no longer holds deck content
