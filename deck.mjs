/**
 * One entry point for every talk in talks/.
 *
 *   node deck.mjs dev <talk> [slidev flags]     dev server, opens a browser
 *   node deck.mjs build <talk>                  static site into dist/<talk>/
 *   node deck.mjs export <talk>                 talks/<talk>/deck.pdf, one page per click state
 *   node deck.mjs check <talk> [--shots dir]    overflow lint, see check.mjs
 *
 * npm scripts wrap these, so `npm run dev temporal-dataset` works.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const [cmd, talk, ...rest] = process.argv.slice(2)
const talks = fs.readdirSync('talks').filter(d => fs.existsSync(path.join('talks', d, 'slides.md')))

if (!cmd || !talk) {
  console.error(`usage: node deck.mjs <dev|build|export|check> <talk>\ntalks: ${talks.join(', ')}`)
  process.exit(2)
}
if (!talks.includes(talk)) {
  console.error(`no talk named "${talk}". Talks: ${talks.join(', ')}`)
  process.exit(2)
}

const entry = path.join('talks', talk, 'slides.md')
const run = (bin, args) => process.exit(spawnSync(bin, args, { stdio: 'inherit' }).status ?? 1)

switch (cmd) {
  case 'dev':
    run('npx', ['slidev', entry, '--open', ...rest])
  case 'build':
    run('npx', ['slidev', 'build', entry, '--base', './', '--out', path.resolve('dist', talk), ...rest])
  case 'export':
    run('npx', ['slidev', 'export', entry, '--with-clicks', '--output', path.join('talks', talk, 'deck.pdf'), ...rest])
  case 'check':
    run('node', ['check.mjs', entry, ...rest])
  default:
    console.error(`unknown command "${cmd}"`)
    process.exit(2)
}
