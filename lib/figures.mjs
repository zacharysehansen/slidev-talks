/**
 * Figure scripts and the chart-token file, shared by deck.mjs and the linter.
 *
 * talks/<talk>/figures/foo.py writes public/figures/foo.<ext>, or several
 * numbered outputs foo-1.<ext>, foo-2.<ext> for a build. A script is
 * stale when it, theme/plot_styles.py, or a data file it names is newer than
 * its output. A script that names no data file depends on all of them.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const mtime = f => fs.statSync(f).mtimeMs
export const python = process.env.PYTHON || (fs.existsSync('.venv/bin/python') ? '.venv/bin/python' : 'python3')

export function figureStatus(root) {
  const dir = path.join(root, 'figures')
  if (!fs.existsSync(dir)) return []
  const out = path.join(root, 'public', 'figures')
  const dataDir = path.join(root, 'data')
  const data = fs.existsSync(dataDir) ? fs.readdirSync(dataDir).filter(f => f !== 'README.md') : []
  const styles = path.resolve('theme', 'plot_styles.py')

  return fs.readdirSync(dir).filter(f => f.endsWith('.py')).sort().map((script) => {
    const src = path.join(dir, script)
    const stem = script.slice(0, -3)
    const text = fs.readFileSync(src, 'utf8')
    const named = data.filter(f => text.includes(f))
    const inputs = [src, styles, ...(named.length ? named : data).map(f => path.join(dataDir, f))]
    const outputs = fs.existsSync(out)
      ? fs.readdirSync(out)
          .filter((f) => { const n = path.parse(f).name; return n === stem || n.startsWith(`${stem}-`) })
          .map(f => path.join(out, f))
      : []
    const output = outputs[0]
    // with several numbered outputs, the oldest one decides
    const stale = !outputs.length || Math.max(...inputs.map(mtime)) > Math.min(...outputs.map(mtime))
    return { script, src, stem, output, stale }
  })
}

// plot_styles.py is the source for chart colour and type; the Vue charts read
// the CSS copy of it, regenerated when the Python is newer.
export function tokens() {
  const css = path.join('theme', 'styles', 'plot-tokens.css')
  if (fs.existsSync(css) && mtime(path.join('theme', 'plot_styles.py')) <= mtime(css)) return
  const r = spawnSync(python, ['export_tokens.py'], { cwd: 'theme', stdio: 'inherit', env: { ...process.env, MPLBACKEND: 'Agg' } })
  if (r.status !== 0) process.exit(1)
}

export function runFigures(root, all = false) {
  tokens()
  const out = path.join(root, 'public', 'figures')
  for (const f of figureStatus(root)) {
    if (!all && !f.stale) continue
    console.log(`figure  ${f.stem}`)
    const r = spawnSync(python, [path.join('figures', f.script)], {
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
      console.error(`figure script failed: ${f.src}`)
      process.exit(1)
    }
  }
}
