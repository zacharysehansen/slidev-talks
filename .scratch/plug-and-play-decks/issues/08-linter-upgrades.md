# 08 — Linter upgrades

**What to build:** `check` enforces "compiles cleanly". Fails on overflow (existing), missing image/video/figure output, stale figure. Warns on raw HTML or inline `style=`, talk-level components, more than ~12 words on screen outside a quote, bullet lists, a figure slide with no takeaway, more than 3 animated moments. See DESIGN_PLAN.md §8.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] A deliberately broken demo copy triggers each failure and each warning once
- [ ] Output names the slide number and the rule for each hit
- [ ] Exit code is non-zero only on failures
