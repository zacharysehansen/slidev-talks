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

const mtime = f => fs.statSync(f).mtimeMs
const python = process.env.PYTHON || (fs.existsSync('.venv/bin/python') ? '.venv/bin/python' : 'python3')

// plot_styles.py is the source for chart colour and type; the Vue charts read
// the CSS copy of it, regenerated here when the Python is newer.
function tokens() {
  const css = path.join('theme', 'styles', 'plot-tokens.css')
  if (fs.existsSync(css) && mtime(path.join('theme', 'plot_styles.py')) <= mtime(css)) return
  const r = spawnSync(python, ['export_tokens.py'], { cwd: 'theme', stdio: 'inherit', env: { ...process.env, MPLBACKEND: 'Agg' } })
  if (r.status !== 0) process.exit(1)
}

function figures(all = false) {
  tokens()
  const dir = path.join(root, 'figures')
  if (!fs.existsSync(dir)) return
  const out = path.join(root, 'public', 'figures')
  const dataDir = path.join(root, 'data')
  const data = fs.existsSync(dataDir) ? fs.readdirSync(dataDir).filter(f => f !== 'README.md') : []
  const styles = path.resolve('theme', 'plot_styles.py')

  for (const script of fs.readdirSync(dir).filter(f => f.endsWith('.py')).sort()) {
    const src = path.join(dir, script)
    const stem = script.slice(0, -3)
    const text = fs.readFileSync(src, 'utf8')
    const named = data.filter(f => text.includes(f))
    const inputs = [src, styles, ...(named.length ? named : data).map(f => path.join(dataDir, f))]
    const output = fs.existsSync(out)
      ? fs.readdirSync(out).filter(f => path.parse(f).name === stem).map(f => path.join(out, f))[0]
      : undefined

    if (!all && output && Math.max(...inputs.map(mtime)) <= mtime(output)) continue
    console.log(`figure  ${stem}`)
    const r = spawnSync(python, [path.join('figures', script)], {
      cwd: root,
      stdio: 'inherit',
      env: {
        ...process.env,
        PYTHONPATH: [path.resolve('theme'), process.env.PYTHONPATH].filter(Boolean).join(path.delimiter),
        DECK_FIGURES: path.resolve(out),
        MPLBACKEND: 'Agg',
      },
    })
    if (r.status !== 0) {
      console.error(`figure script failed: ${src}`)
      process.exit(1)
    }
  }
}

switch (cmd) {
  case 'figures':
    figures(rest.includes('--all'))
    process.exit(0)
  case 'dev':
    figures()
    run('npx', ['slidev', entry, '--open', ...rest])
  case 'build':
    figures()
    run('npx', ['slidev', 'build', entry, '--base', './', '--out', path.resolve('dist', talk), ...rest])
  case 'export':
    figures()
    run('npx', ['slidev', 'export', entry, '--with-clicks', '--output', path.join('talks', talk, 'deck.pdf'), ...rest])
  case 'check':
    run('node', ['check.mjs', entry, ...rest])
  default:
    console.error(`unknown command "${cmd}"`)
    process.exit(2)
}
