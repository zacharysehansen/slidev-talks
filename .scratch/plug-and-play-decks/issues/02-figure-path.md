# 02 — Figure path, end to end

**What to build:** A talk can hold a Python figure script and a data file; the figure is regenerated automatically before dev/build/export when stale, and a `figure` layout places it on the light field with a grey title and a bold takeaway. `plot_styles.py` is copied into the theme with an additive `slide` tier (projection type sizes, transparent background, text as paths) and a `save_slide` helper (SVG default, PNG 200 dpi for dense rasters). See DESIGN_PLAN.md §6.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] The demo talk has a figure slide built from a data file and a script using `apply("slide")`, with no white box on the light field
- [ ] Editing the data file and restarting dev regenerates only that figure; untouched figures are not rebuilt
- [ ] `takeaway: click` holds the takeaway back one click
- [ ] The `standard`, `compact` and `poster` tiers produce identical output before and after the copy (verified by rendering a sample figure with both versions)
- [ ] `requirements.txt` pins matplotlib and numpy
