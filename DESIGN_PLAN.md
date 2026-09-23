# Design plan: plug-and-play decks

Goal: Zachary hands over one markdown file, Claude converts it into Slidev
markdown using a fixed set of layouts, and the deck compiles with no new CSS.
Every plotted figure follows `plot_styles.py`.

Decisions below were settled in a grilling session on 2026-09-22. The numbers
(Q1 to Q20) refer to that session.

---

## 1. Why this exists

`slides.md` (the AI Training Temporal Dataset deck) builds almost every slide
from one-off HTML: about 60 slide-specific class names (`spec-row`,
`gate-box`, `lora-tag`, `hyp-side`...) backed by per-slide blocks in
`style.css` (lines 552 to 811 are all "slide N" rules). The rules in
`presentation-style.md` already describe a small, repeatable set of slide
shapes. They were never turned into reusable layouts, so every new slide
needed new CSS.

Charts are Vue components with hand-picked colours, while
`plot_styles.py` defines a different visual language (bold Arial, ColorBrewer
cycle, semantic affirm/reject). Nothing ties the two together.

The current `README.md` describes the 32-slide seminar deck, which now lives in
`slides.original.md`. It will be rewritten as part of this work.

---

## 2. Settled decisions

| # | Decision |
|---|---|
| Q1 | Zachary writes a source markdown file. Claude converts it into Slidev markdown. That output compiles cleanly with no hand-written CSS |
| Q2 | Stay on Slidev |
| Q3 | The visual system becomes a local theme shared by every future talk |
| Q4 | Raw HTML and inline styles stay allowed as an escape hatch, and `check` warns on every use |
| Q5 | "Figure" means plotted data only. Diagrams are layouts in the deck's own style |
| Q6 | Figures are matplotlib by default. Vue charts only for moments in the motion budget |
| Q7 | Add a `"slide"` tier to `plot_styles.py`: its palette, a transparent background, projection-sized type. Paper output is unchanged |
| Q8 | Source format is the existing spec format (§4) |
| Q9 | The conversion rules live in a project skill, `.claude/skills/build-deck/` |
| Q10 | The layout vocabulary in §5 |
| Q11 | `theme/` plus `talks/<name>/` repo structure (§3) |
| Q12 | `plot_styles.py` is copied into `theme/`, additions only, verified to still work for paper figures |
| Q13 | Figure scripts run automatically before dev/export when stale. SVG with text as paths for charts, PNG at 200 dpi for dense rasters like heatmaps |
| Q14 | Chart data lives in `talks/<name>/data/` as CSV or JSON, read by both Python and Vue. Provenance in `data/README.md` |
| Q15 | `plot_styles.py` is the source of truth for chart tokens. A step exports them to `theme/plot-tokens.css` for Vue charts |
| Q16 | Animation kept only for `Reverb` and `ModelBars` (seminar), and the `timeline` draw-in. Everything else is static or a repeated-slide build |
| Q17 | Talk-specific components live in the talk. Unused components and assets move to `_unused/` |
| Q18 | Existing PNGs and photos belong to their talk and move with it. They are not scaffolding and are not replotted. Future talks drop their own images into `talks/<name>/public/` |
| Q19 | `check` fails and warns on the list in §8 |
| Q20 | Build order: theme, demo, temporal deck, seminar deck |

---

## 3. Repository layout

```
theme/
  package.json          Slidev theme manifest (slidev.defaults: canvas, fonts off, etc.)
  layouts/*.vue         the vocabulary in §5
  components/*.vue      general components only (Thinker, PerformanceVideo, Reverb, ModelBars)
  styles/index.css      today's style.css minus every slide-specific block
  plot-tokens.css       generated from plot_styles.py. Never edited by hand
  setup/shortcuts.ts    keymap (d unbound, F fullscreen, etc.)
  global-bottom.vue     progress rail and click-anywhere handler
  assets/brand/         arcs, lockups, thinker.png, served at /brand/ by setup/vite-plugins.ts
  plot_styles.py        copied in, with the slide tier added
  export_tokens.py      writes plot-tokens.css from plot_styles.py

talks/<name>/
  source.md             what Zachary hands over
  slides.md             what Claude generates. Editable by hand
  data/*.csv|json       numbers behind every chart
  data/README.md        provenance for each file
  figures/*.py          one script per plot, each writes into public/figures/
  components/*.vue      talk-specific components (escape hatch, warned by check)
  public/               talk images and video, plus generated figures/
  _unused/              parked components and assets

talks/_demo/            one slide per layout. The theme's test deck
deck.mjs                CLI: node deck.mjs <dev|build|export|check|figures> <talk>
check.mjs               the linter, extended (§8)
requirements.txt        pinned matplotlib, numpy
.claude/skills/build-deck/SKILL.md
```

`package.json` scripts wrap `deck.mjs`: `npm run dev temporal-dataset`,
`npm run export temporal-dataset`, and so on.

Each `slides.md` headmatter points at the theme with a relative path,
`theme: ../../theme`.

Slidev resolves `public/` relative to the entry file. A theme's `public/` is
only copied at build time (under `/theme/`) and is not served by the dev
server, checked in `@slidev/cli` 52.19. So brand art lives in
`theme/assets/brand/`, and `theme/setup/vite-plugins.ts` serves it at
`/brand/<file>` in dev and emits it into builds. Bundling it through Vite
imports was rejected because a missing file would fail the build, and the art
is not in the public repo.

### What is public

The repo is public on GitHub. `.gitignore` keeps every talk except
`talks/_demo/` out of it, along with every image, video, PDF and pptx
anywhere, including the theme's brand art in `theme/assets/brand/`. A fresh
clone therefore renders without the lockups, arcs or thinker; the layouts
already drop missing art silently. The demo talk has to work from a clone, so
its figures are generated and it ships no binary assets.

### Migration of what exists now

| Now | Goes to |
|---|---|
| `slides.md` | `talks/temporal-dataset/slides.md` |
| `AI Training Temporal Dataset — Revised Presentation Markdown.md` | `talks/temporal-dataset/source.md` |
| `slides.original.md` | `talks/seminar-intro/slides.md` |
| `demo.md` | rebuilt as `talks/_demo/slides.md` |
| `data.ts` | split into `talks/seminar-intro/data/*.json` and `talks/temporal-dataset/data/*.json` |
| `presentation-style.md` | folded into the build-deck skill, and kept as the human-readable version |
| `ModesPanel`, `ProtocolDiagram`, `IronsidesLegend` | `talks/seminar-intro/components/` |
| `LoopDiagram`, `SpecificityRamp`, `PipelineDiagram`, `PredictedBars`, `EraTimeline`, `MotionChart` | `_unused/` of their talk, once their replacement layout or figure works |
| talk images and video in `public/assets/` | the owning talk's `public/assets/` |
| brand art (arcs, lockups, thinker) | `theme/assets/brand/` |
| `Hansen.BMES.AI Med Misinfo.FINAL.pptx` | `reference/`, the source of record for the visual system. Not committed |

---

## 4. Source format (what Zachary hands over)

```
## 5                           one slide per heading (number or short name)
### On screen                  what appears. Quoted text is copied verbatim
### Layout                     optional. Free prose, or a layout name from §5
### Spoken                     becomes the speaker notes
### Figure                     optional. The data, what is plotted, and the takeaway
### Animation                  optional. Marks a motion-budget moment
```

Everything outside these sections is context for Claude and never goes on
screen. This matches `AI Training Temporal Dataset — Revised Presentation
Markdown.md`, so the existing habit is the format.

---

## 5. Layout vocabulary

Every layout is filled by plain markdown. No HTML is needed for any of them.

| Layout | Markdown inside | Covers |
|---|---|---|
| `title` / `close` | `#` + one line. Light field, centred | title and closing slides |
| `statement` | `#` + optional line | questions, thread statements, thesis question |
| `default` | `##` + a short line or paragraph | hypothesis, plain statements with a heading |
| `compare` | two columns split by `::right::`. `###` = column head, `>` = quote, a trailing line after `::foot::` spans both | era comparison, combined vs single era |
| `flow` | a list, one item per step, a nested item as its detail line. `direction: down \| across` in frontmatter. A bold-only item (`- **Proceed**`) is the outcome. A numbered list prints the numbers | stage flow, training flow, pipeline, validation gates, LoRA |
| `steps` | a numbered list. `hero: 4` highlights one item | four questions |
| `grid` | `###` column heads, each followed by a short list or a count | specialty grid, specialty timelines |
| `timeline` | a list of `year label` items, a nested item as the detail. `mark: 1980 DSM-III` draws in on one click, placed in proportion to the years | Cecil's editions |
| `number` | one or two big numerals, each with a caption line | dissociation-style slides |
| `figure` | a title line, an image, a takeaway line. Light field automatically. `takeaway: click` holds the takeaway back one click | every plot |
| `plate` | one image, nothing else | logged exchanges, image-only slides |
| `bleed` | one video, full bleed, plays on enter and pauses on leave | performance and tracking videos |
| `link` | one link, centred, clickable | the LinkedIn post |
| `photo` | background image + text placed in the clear area. `place: bottom-left` etc. | ACABI, StellarScape, Cecil's hero |
| `divider` | eyebrow + `#`, thinker bottom right | project dividers |
| `quote` | a `>` block, unattributed | quotation slides |

Conventions shared by all layouts:
- `*emphasis*` renders in Bloom, `**strong**` in Arroyo.
- The HTML comment at the end of a slide is the speaker notes.
- `field: light` in frontmatter flips any layout onto the light field.
- Build-ups are repeated near-identical slides, never animation.

Adding a layout later is one Vue file plus one CSS block in the theme. A new
layout has to be general. One named after a single slide's content (a `lora`
layout, say) is rejected; reshape the slide or use the escape hatch.

### How the current temporal deck maps

| Slide | Layout |
|---|---|
| 1 title | `title` |
| 2 1986 vs 2012 | `compare` |
| 3 which helps you recognise | `statement` |
| 4 observation gave way to criteria | `flow down` |
| 5 a model learns from its corpus | `flow down` |
| 6 hypothesis | `compare` (combined vs single era) under a `default` heading |
| 7 four questions | `steps hero: 4` |
| 8 Cecil's | `photo` once `cecils.jpg` exists, `statement` until then |
| 9 editions | `timeline` |
| 10 specialty textbooks | `grid` |
| 11 four specialties, ten diseases | `grid` |
| 12 pipeline | `flow across` |
| 13 validation gates | `flow across` with a `statement` heading |
| 14 five conditions | `figure`, stacked-bar plot, built across five slides |
| 15 LoRA | `flow across` |
| 16 predicted result | `figure`, static matplotlib |
| 17 close | `close` |

---

## 6. Figures

### plot_styles.py, slide tier

Copied into `theme/plot_styles.py`. Changes are additions only, so the file
still works when copied back to the paper project:

- A `"slide"` entry in `_FONT_TIERS`, sized so ticks and labels read on a
  projector at 1280x720 (starting point: ticks about 20, labels about 26,
  titles off, because the slide's own title line names the plot).
- `apply("slide")` also sets `figure.facecolor` and `savefig.transparent` so
  the figure sits on the light field with no white box. This removes the
  `mix-blend-mode: multiply` rule.
- `svg.fonttype = "path"` for the slide tier, so Arial renders the same on the
  Linux build machine and the Windows presentation PC.
- `save_slide(fig, name, raster=False)`: writes SVG, or PNG at 200 dpi when
  `raster=True` for dense images such as heatmaps.

**Verification:** run one existing paper figure through `apply("standard")`
before and after the copy and compare output, so the paper tiers are shown to
be unchanged.

### Figure scripts

- One script per plot in `talks/<name>/figures/`. It reads from `../data/`,
  calls `apply("slide")`, and writes to `../public/figures/`.
- `deck.mjs figures <talk>` runs every script whose script, data file or
  `plot_styles.py` is newer than its output. `dev`, `build` and `export` run
  this first.
- The slide references the output: a `figure` layout with
  `![](/figures/predicted_bars.svg)`.

### Animated charts

`Reverb` and `ModelBars` (seminar deck) stay Vue components in `theme/`,
because they are the motion budget. `export_tokens.py` writes the constants of
`plot_styles.py` (`COLOR_CYCLE`, `AFFIRM`, `REJECT`, `TREND_LINE`,
`TREND_BAND`, the slide-tier sizes, bold Arial) into `theme/plot-tokens.css`.
Vue charts use only those variables, so they can't drift from the
matplotlib ones. `deck.mjs` regenerates the file when `plot_styles.py` changes.

Animated components still render their finished state in print mode, so the
PDF export is never blank.

### Pre-rendered images

Images a talk arrives with (screenshots, photos, PNGs from a paper) are the
talk's own and go in `talks/<name>/public/`. They are placed with `plate` or
`figure` as they are, and are not replotted.

---

## 7. The build-deck skill

`.claude/skills/build-deck/SKILL.md` loads when Zachary hands over a source
file. It contains:

1. The style rules from `presentation-style.md`: one idea per slide, no bullet
   lists, under ten words on screen, no chrome, show the artifact before the
   aggregate, build by repeating slides, a tiny motion budget, and the writing
   style rules from the README (no " —", no "is not X, it is Y", no corporate
   language).
2. The layout reference from §5, with one markdown example per layout.
3. The conversion steps:
   - scaffold `talks/<name>/` if it is new
   - map each `## slide` to a layout, from `### Layout` when given, otherwise
     by the shape of `### On screen`
   - for each `### Figure`, write the data file and a figure script
   - move `### Spoken` into the speaker-note comment
   - run `check` and fix every failure before reporting back
   - report every warning, and every place the escape hatch was used, with why
4. Rules on numbers: never invent a number on a slide. Any derived number is
   marked in the data README, the speaker notes and the reply.

---

## 8. check

`node deck.mjs check <talk>` extends today's `check.mjs`.

**Fails on:**
- content outside the slide box or a scrolling slide (current behaviour)
- a missing image, video or figure output
- a stale figure (script, data or `plot_styles.py` newer than the output)

**Warns on:**
- raw HTML or inline `style=` in `slides.md`, and use of a talk-level component
- more than about 12 words of on-screen text outside a quote
- a bullet list on screen
- a `figure` slide with no takeaway line
- more than 3 animated moments in a talk

---

## 9. Build order

1. **Theme.** Move layouts, general components, setup and brand art into
   `theme/`. Strip slide-specific CSS from the stylesheet. Build the new
   layouts from §5. Add the slide tier to `plot_styles.py`, `export_tokens.py`
   and `plot-tokens.css`. Verify the paper tiers are unchanged.
2. **Tooling.** `deck.mjs`, the figure staleness runner, the extended
   `check.mjs`, `requirements.txt`. Confirm how Slidev serves a local theme's
   `public/`.
3. **Demo.** `talks/_demo/` with one slide per layout, on both fields, and one
   matplotlib figure. `check` passes with zero warnings.
4. **Temporal deck.** Regenerate `talks/temporal-dataset/slides.md` from its
   source file using the skill. Acceptance: no HTML in `slides.md`, `check`
   passes, and it looks as good as the current version side by side.
5. **Seminar deck.** Move `slides.original.md` into `talks/seminar-intro/`,
   convert what fits the vocabulary, keep `ModesPanel`, `ProtocolDiagram` and
   `IronsidesLegend` as talk components, and rebuild `MotionChart` as
   matplotlib from its data.
6. **Docs.** Rewrite `README.md` for the new structure. The talk-specific
   history in today's README (slide inventory, provenance, open decisions)
   moves to `talks/seminar-intro/README.md`.

---

## 10. Open items

- ~~Whether Slidev serves a local theme's `public/`~~. It does, see §3.
- The exact numbers for the slide font tier, tuned on the projector-sized
  render during step 3.
- Cecil's photograph (`cecils.jpg`) for slide 8 of the temporal deck is still
  to be supplied.
- The open decisions in today's README §12 (first-author framing, Cecil's
  excerpts) belong to the seminar talk and carry over unchanged.
