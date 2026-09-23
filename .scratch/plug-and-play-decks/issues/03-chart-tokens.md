# 03 — Chart tokens for animated charts

**What to build:** `plot_styles.py` is the one source for chart colours and type. An export step writes those constants to a generated CSS token file, regenerated when `plot_styles.py` changes. The two motion-budget charts (Reverb, ModelBars) move into the theme and read only those tokens, their data from the talk's data folder.

**Blocked by:** 02

**Status:** done

- [x] Changing a colour in `plot_styles.py` changes it in both matplotlib figures and the Vue charts after one rebuild
- [x] Reverb and ModelBars animate in dev and render finished in PDF export
- [x] No hex colour literal remains inside either component
