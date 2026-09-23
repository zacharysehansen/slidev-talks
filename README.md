# Talks on Slidev

A local [Slidev](https://sli.dev) theme and the tooling around it. A talk is a
markdown file; the theme supplies every layout, so a talk carries no CSS of its
own. Figures are matplotlib scripts styled by `theme/plot_styles.py`.

Talks are private. `.gitignore` keeps every talk except `talks/_demo/` out of
the repo, along with every image, video, PDF and slide file, including the
theme's brand art. A fresh clone runs the demo without the lockups.

## Start a new talk

1. Write a source file: one `## <n>` per slide, with `### On screen`,
   `### Layout`, `### Spoken`, and optionally `### Figure` and
   `### Animation`. Anything else is context.
2. Hand it to Claude Code in this repo ("build this deck"). The `build-deck`
   skill creates `talks/<name>/`, writes `slides.md`, data and figure scripts,
   and runs the checks until they pass.
3. Drop images and video into `talks/<name>/public/assets/`.
4. `npm run dev <name>` to present, `npm run export <name>` for the PDF backup.

To write slides by hand instead, copy a slide from `talks/_demo/slides.md`;
every layout is there once. The syntax for each layout is the comment at the
top of its file in `theme/layouts/`. The style rules are in
`presentation-style.md`.

## Commands

```bash
npm install                  # once. Node 18+, Python 3 with requirements.txt
npm run dev <talk>           # dev server; reruns stale figures first
npm run build <talk>         # static site into dist/<talk>/
npm run export <talk>        # talks/<talk>/deck.pdf, every click state a page
npm run check <talk>         # lint, then render every slide and fail on overflow
npm run figures <talk>       # rerun stale figure scripts (--all for every one)
npm test                     # self-test for the linter
```

`<talk>` is a folder name under `talks/`. Run a command without one to list them.
`node check.mjs talks/<talk>/slides.md --static` lints without a browser.
`--shots <dir>` also writes a PNG per slide.

## Layout

```
theme/          layouts, components, styles, keymap, brand art, plot_styles.py
talks/<name>/   source.md, slides.md, data/, figures/, public/, components/
lib/            figure runner and linter, shared by deck.mjs and check.mjs
deck.mjs        the CLI behind the npm scripts
check.mjs       static lint, then a headless render of every slide
reference/      the BMES pptx the visual system was ported from (not committed)
```

`DESIGN_PLAN.md` records the design decisions and
`.scratch/plug-and-play-decks/issues/` the tickets that built it.
