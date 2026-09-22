/**
 * Overflow linter for the deck.
 *
 * Slidev renders a slide whose content runs off the bottom edge without a
 * warning. This loads every slide at the real canvas size in headless
 * Chromium, measures each element against the slide box, and exits non-zero
 * if anything sits outside it. Run it before you present.
 *
 *   node check.mjs talks/<talk>/slides.md               # lint one talk
 *   node check.mjs talks/<talk>/slides.md --shots out/  # also write a PNG per slide
 *
 * Usually run as `npm run check <talk>`, which passes the entry for you.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { chromium } from 'playwright-chromium'

const PORT = 3199
const TOL = 1                 // px of slack; sub-pixel rounding is not an error
const shotsAt = process.argv.indexOf('--shots')
const SHOTS = shotsAt > -1 ? process.argv[shotsAt + 1] : null
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true })

// any bare `*.md` argument is the entry; without one Slidev picks up slides.md
const ENTRY = process.argv.slice(2).find((a, i, all) => a.endsWith('.md') && all[i - 1] !== '--shots')

const server = spawn('npx', ['slidev', ...(ENTRY ? [ENTRY] : []), '--port', String(PORT)], { stdio: 'ignore' })
const stop = () => { try { server.kill() } catch {} }
process.on('exit', stop)

const base = `http://localhost:${PORT}`
for (let i = 0; i < 60; i++) {
  try { await fetch(base); break } catch { await new Promise(r => setTimeout(r, 500)) }
}

// `--disable-accelerated-video-decode`: capturing a playing <video> otherwise
// crashes the headless renderer on the EarthScape slide.
const browser = await chromium.launch({ args: ['--disable-accelerated-video-decode'] })
let page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
let visits = 0

async function fresh() {
  try { await page.close() } catch {}
  page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
}

async function open(path) {
  if (++visits % 6 === 0) await fresh()          // keep the renderer from bloating
  try { await page.goto(base + path, { waitUntil: 'networkidle' }) }
  catch { await fresh(); await page.goto(base + path, { waitUntil: 'networkidle' }) }
}

// The overview route renders every slide at once, which is the one place the
// deck's length is readable without importing Slidev's parser.
await open('/overview')
await page.waitForTimeout(1200)
const total = await page.evaluate(() => document.querySelectorAll('.slidev-slide-container').length)
if (!total) { console.error('could not read the slide count from /overview'); stop(); process.exit(2) }

const problems = []
for (let n = 1; n <= total; n++) {
  // clicks=0 is the bare slide, clicks=99 is every build-up revealed, which is
  // the state that actually overflows.
  for (const clicks of [0, 99]) {
    await open(`/${n}?clicks=${clicks}`)
    await page.waitForTimeout(clicks ? 1400 : 900)
    await page.evaluate(() => document.querySelectorAll('video').forEach(v => v.pause())).catch(() => {})

    const found = await page.evaluate(({ n, TOL }) => {
      const root = document.querySelector(`.slidev-page-${n}`)
      if (!root) return { error: 'slide did not render' }
      const r = root.getBoundingClientRect()
      const bad = []
      for (const el of root.querySelectorAll('*')) {
        const b = el.getBoundingClientRect()
        if (b.width < 1 || b.height < 1) continue
        const cs = getComputedStyle(el)
        if (cs.visibility === 'hidden' || cs.opacity === '0') continue
        const over = Object.entries({
          top: r.top - b.top, left: r.left - b.left,
          right: b.right - r.right, bottom: b.bottom - r.bottom,
        }).filter(([, v]) => v > TOL)
        if (over.length) {
          bad.push({
            sel: el.tagName.toLowerCase() + (el.className ? `.${String(el.className.baseVal ?? el.className).trim().split(/\s+/).join('.')}` : ''),
            text: (el.textContent || '').trim().slice(0, 50),
            over: Object.fromEntries(over.map(([k, v]) => [k, Math.round(v)])),
          })
        }
      }
      return {
        title: (root.querySelector('h1,h2')?.textContent || '').trim().slice(0, 46),
        scroll: { x: root.scrollWidth - root.clientWidth, y: root.scrollHeight - root.clientHeight },
        // report the outermost offender, not every nested child of it
        bad: bad.filter(x => !bad.some(y => y !== x && x.text && y.text.includes(x.text) && y.text.length > x.text.length)).slice(0, 5),
      }
    }, { n, TOL })

    if (SHOTS) {
      const tag = `${String(n).padStart(2, '0')}${clicks ? 'x' : ''}`
      await page.screenshot({ path: `${SHOTS}/${tag}.png` }).catch(() => {})
    }

    const overflowed = found.error || found.bad?.length || found.scroll?.y > TOL || found.scroll?.x > TOL
    if (overflowed) problems.push({ n, clicks, ...found })
    if (clicks === 0) console.log(`${overflowed ? 'FAIL' : ' ok '}  ${String(n).padStart(2)}  ${found.title || ''}`)
  }
}

await browser.close()
stop()

if (!problems.length) {
  console.log(`\n${total} slides, no overflow.`)
  process.exit(0)
}
console.log(`\n${problems.length} problem(s):`)
for (const p of problems) {
  console.log(`  slide ${p.n}${p.clicks ? ' (built up)' : ''}: ${p.error ?? ''}`)
  if (p.scroll?.y > TOL || p.scroll?.x > TOL) console.log(`    content scrolls: ${JSON.stringify(p.scroll)}`)
  for (const b of p.bad ?? []) console.log(`    ${b.sel} outside by ${JSON.stringify(b.over)}  "${b.text}"`)
}
process.exit(1)
