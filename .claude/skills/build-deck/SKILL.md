---
name: build-deck
description: Convert a talk's source markdown into Slidev slides on this repo's theme. Use when the user hands over a deck or talk source file to build, or asks to regenerate, update or add slides for a talk in talks/.
---

# Build a deck

The user writes a **source** file; you turn it into `talks/<name>/slides.md`
that compiles with `npm run check <name>` and carries no CSS of its own. The
theme owns every look. Your job is choosing a layout per slide and filling it
with plain markdown.

## Steps

1. **Read the rules.** Read `presentation-style.md` in full, then the header
   comment of every file in `theme/layouts/`. Those comments are the syntax
   reference; the table below only helps you choose. Done when you can name
   each layout's slots and frontmatter keys.

2. **Place the talk.** New talk: create `talks/<name>/` (kebab-case of the
   title) and copy the handed file in as `source.md`. Existing talk: diff the
   handed file against `source.md`, replace it, and rebuild only the slides
   that changed. The talk folder is private (see `.gitignore`); `talks/_demo/`
   is the only public talk.

3. **Map every slide.** The source format is one `## <n>` per slide with
   sections `### On screen`, `### Layout`, `### Spoken`, and optionally
   `### Figure` and `### Animation`. Text outside those sections is context
   for you. For each slide:
   - Pick the layout from `### Layout` when it names one; otherwise from the
     shape of `### On screen`, using the table below.
   - Copy quoted on-screen text verbatim. Everything else is yours to cut to
     the anchor: one idea, a handful of words.
   - Put `### Spoken` into the slide's closing `<!-- -->` comment, which is
     the speaker notes. Anything `### Layout` says that no layout can express
     goes there too, as a note to the presenter.
   - `### Figure`: write the numbers to `data/<name>.csv|json`, their
     provenance to `data/README.md`, and a script to `figures/<name>.py` using
     `plot_styles` (`apply("slide")`, `SLIDE_FIGSIZE`, `save_slide`). Look at
     `talks/_demo/figures/sample_bars.py` for the shape. The slide is a
     `figure` layout: a title naming what is plotted, the image, a
     `::takeaway::` that states the claim.
   - `### Animation`: use what the theme has (`takeaway: click`,
     `thinker: click`, timeline `mark:`, `v-click`, a build across repeated
     slides, the Reverb and ModelBars charts). Three animated moments per talk
     is the budget.
   Done when every `## <n>` in the source maps to a slide in `slides.md`, and
   every merge, split or drop is written down for the report.

4. **Headmatter.** Only what the theme does not default:

   ```yaml
   ---
   theme: ../../theme
   title: <talk title>
   layout: title          # the first slide's own frontmatter lives here too
   ---
   ```

5. **Check until clean.** Run `npm run check <name>`. Fix every `FAIL`. For
   each `warn`, fix the slide, or keep it on purpose with `allow: [<rule>]` in
   that slide's frontmatter and a line in its notes saying why. Done when the
   command exits 0 and every remaining warning is one you chose.

6. **Report.** Tell the user, briefly: slides built, the layout each unusual
   slide got, merges and drops, every `allow:` and why, every escape hatch
   (HTML or a talk component), assets still missing, and every derived number.

## Choosing a layout

| The slide is... | Layout |
|---|---|
| the opening name card / the callback close | `title` / `close` |
| one line, maybe a smaller line under it | `statement` |
| a heading and a short line | `default` |
| this against that, two columns, or X vs. Y | `compare` (`vs:` for X vs. Y) |
| stages joined by arrows | `flow` (`direction: across` for a pipeline) |
| a numbered list of questions or steps | `steps` (`hero:` for the one that matters) |
| like things in columns | `grid` |
| dated points on a line | `timeline` |
| a number that matters, or two to contrast | `number` |
| a plot of data | `figure` |
| one image / one video / one link, alone | `plate` / `bleed` / `link` |
| a photograph as the whole slide | `photo` |
| a named section opener | `divider` |
| a quotation | `quote` |

`field: light` puts any layout on the light field; `figure`, `title` and
`close` are light already. White-background images belong on the light field.

When nothing fits, reshape the slide until one does. The escape hatch (HTML,
or a component in `talks/<name>/components/`) is for what truly cannot be
reshaped; `check` warns on it, and it goes in the report. A layout that would
serve many talks can be added to `theme/layouts/` with a header comment and
one CSS block in `theme/styles/index.css`, and a slide for it in the demo.

## Assets

Images and video live in `talks/<name>/public/assets/` and are referenced as
`/assets/<file>`. When the source asks for an asset that is not there, build
the slide from the nearest text layout, write the missing path and the
intended layout into its notes, and list it in the report. `check` fails on a
reference to a missing file, so the deck stays compiling.

## Numbers

Every number on a slide comes from the source or from data the user gave you.
A number you derive (a sum, a ratio, a percent) is marked in three places: the
`data/README.md` entry, the slide's notes, and your report.

## Writing

Slide text and notes are plain, direct sentences in the user's voice. Use
commas and periods where a spaced em dash would go. State what a thing is
directly rather than by contrast with what it is not. Plain words throughout,
no corporate register.
