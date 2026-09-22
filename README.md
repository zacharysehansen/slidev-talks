# Talks on Slidev

A local [Slidev](https://sli.dev) theme and the tooling around it. Each talk is
one markdown file in `talks/<name>/`; the theme supplies every layout, so a
talk needs no CSS of its own. `DESIGN_PLAN.md` is the design and
`.scratch/plug-and-play-decks/issues/` the work still to do.

Talks themselves, and every image, video and PDF, are kept out of the public
repo by `.gitignore`. Only `talks/_demo/` is committed.

```bash
npm install                  # once. Node 18 or newer
npm run dev <talk>           # dev server, opens a browser
npm run build <talk>         # static site into dist/<talk>/
npm run export <talk>        # talks/<talk>/deck.pdf, every click state a page
npm run check <talk>         # overflow linter
```

`<talk>` is a folder name under `talks/`. Run any command without one to list
them.

```
theme/          layouts, components, styles, keymap, brand art, plot_styles.py
talks/<name>/   slides.md, source.md, components/, public/, data
deck.mjs        the CLI behind the npm scripts
check.mjs       renders every slide headless and fails on overflow
reference/      the BMES pptx the visual system was ported from (not committed)
```

This README gets a full rewrite in ticket 12.
