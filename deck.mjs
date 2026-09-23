/**
 * One entry point for every talk in talks/.
 *
 *   node deck.mjs dev <talk> [slidev flags]     dev server, opens a browser
 *   node deck.mjs build <talk>                  static site into dist/<talk>/
 *   node deck.mjs export <talk>                 talks/<talk>/deck.pdf, one page per click state
 *   node deck.mjs check <talk> [--shots dir]    overflow lint, see check.mjs
 *   node deck.mjs figures <talk> [--all]        rerun stale figure scripts
 *
 * Figures: talks/<talk>/figures/foo.py writes public/figures/foo.<ext>, usually
 * foo.svg through plot_styles.save_slide. Any extension counts as the output. A script reruns when it, theme/plot_styles.py
 * or a data file it names is newer than its output. A script that names no
 * data file depends on all of them. dev, build and export run this first.
 *
 * npm scripts wrap these, so `npm run dev temporal-dataset` works.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { runFigures } from './lib/figures.mjs'

const [cmd, talk, ...rest] = process.argv.slice(2)
const talks = fs.readdirSync('talks').filter(d => fs.existsSync(path.join('talks', d, 'slides.md')))

if (!cmd || !talk) {
  console.error(`usage: node deck.mjs <dev|build|export|check|figures> <talk>\ntalks: ${talks.join(', ')}`)
  process.exit(2)
}
if (!talks.includes(talk)) {
  console.error(`no talk named "${talk}". Talks: ${talks.join(', ')}`)
  process.exit(2)
}

const root = path.join('talks', talk)
const entry = path.join(root, 'slides.md')
const run = (bin, args) => process.exit(spawnSync(bin, args, { stdio: 'inherit' }).status ?? 1)

switch (cmd) {
  case 'figures':
    runFigures(root, rest.includes('--all'))
    process.exit(0)
  case 'dev':
    runFigures(root)
    run('npx', ['slidev', entry, '--open', ...rest])
  case 'build':
    runFigures(root)
    run('npx', ['slidev', 'build', entry, '--base', './', '--out', path.resolve('dist', talk), ...rest])
  case 'export':
    runFigures(root)
    run('npx', ['slidev', 'export', entry, '--with-clicks', '--output', path.join('talks', talk, 'deck.pdf'), ...rest])
  case 'check':
    run('node', ['check.mjs', entry, ...rest])
  default:
    console.error(`unknown command "${cmd}"`)
    process.exit(2)
}
