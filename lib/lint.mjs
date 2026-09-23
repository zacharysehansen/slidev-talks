/**
 * Static checks on a talk's slides.md, run by check.mjs before it renders.
 *
 * Failures (the deck does not compile cleanly):
 *   missing   an image, video or figure the slides reference does not exist
 *   stale     a figure script, its data or plot_styles.py is newer than its output
 *
 * Warnings (presentation-style.md, enforced):
 *   html        raw HTML or an inline style= in the slide markdown
 *   component   a component that lives in the talk rather than the theme
 *   words       more than WORDS words on screen with nothing standing out: a
 *               long slide needs some bold or accent text (**x**, *x*,
 *               <strong>, <em>), and that text must be under half the words.
 *               Quotes, notes and a figure's title line are not counted
 *   bullets     a bullet list on a layout where the list is not the structure
 *   takeaway    a figure slide with no ::takeaway::
 *   motion      more than MOTION animated moments in the talk
 *
 * `allow: [words, html]` in a slide's frontmatter silences those warnings on
 * that slide; in the headmatter it silences them for the whole talk. Use it
 * when the rule is being broken on purpose, and say why in the notes.
 */
import fs from 'node:fs'
import path from 'node:path'
import { parseSync } from '@slidev/parser'
import { figureStatus } from './figures.mjs'

const WORDS = 50
const MOTION = 3
const LIST_LAYOUTS = new Set(['flow', 'steps', 'timeline', 'grid'])
const MEDIA = /\.(png|jpe?g|gif|webp|svg|mp4|mov|webm)$/i

const allowList = fm => [].concat(fm?.allow ?? []).map(String)

function onScreen(content) {
  return content
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .split('\n')
    .filter(l => !/^\s*>/.test(l))                  // quotations are exempt
    .join('\n')
    .replace(/^::[\w-]+::\s*$/gm, ' ')              // slot markers
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')          // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')        // links keep their text
    .replace(/<https?:[^>]+>/g, ' ')                // bare links
    .replace(/<[^>]+>/g, ' ')                       // tags
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[#*_`>|~-]/g, ' ')
}

function refs(slide) {
  const found = new Set()
  const text = slide.content.replace(/<!--[\s\S]*?-->/g, ' ')
  for (const m of text.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) found.add(m[1])
  for (const m of text.matchAll(/\bsrc=["']([^"']+)["']/g)) found.add(m[1])
  for (const v of Object.values(slide.frontmatter ?? {}))
    if (typeof v === 'string' && v.startsWith('/') && MEDIA.test(v)) found.add(v)
  return [...found].filter(r => r.startsWith('/') && MEDIA.test(r))
}

export function lint(entry) {
  const root = path.dirname(entry)
  const md = parseSync(fs.readFileSync(entry, 'utf8'), entry)
  const talkComponents = new Set(
    fs.existsSync(path.join(root, 'components'))
      ? fs.readdirSync(path.join(root, 'components')).filter(f => f.endsWith('.vue')).map(f => f.slice(0, -4))
      : [],
  )
  const talkAllow = allowList(md.slides[0]?.frontmatter)
  const fails = []
  const warns = []
  let motion = 0

  md.slides.forEach((slide, i) => {
    const n = i + 1
    const fm = slide.frontmatter ?? {}
    const layout = fm.layout ?? 'default'
    const allow = new Set([...talkAllow, ...allowList(fm)])
    const warn = (rule, msg) => { if (!allow.has(rule)) warns.push({ n, rule, msg }) }
    const body = slide.content.replace(/<!--[\s\S]*?-->/g, ' ')

    for (const r of refs(slide)) {
      if (r.startsWith('/brand/')) continue           // theme art, absent from public clones by design
      if (!fs.existsSync(path.join(root, 'public', r))) fails.push({ n, rule: 'missing', msg: `${r} not found in ${path.join(root, 'public')}` })
    }

    // Slidev's own v-click family is markup the deck is meant to use, not raw HTML
    const html = body.replace(/<https?:[^>]+>/g, '').match(/<\/?(?!v-)[a-z][\w-]*(\s[^>]*)?\/?>/g)
    if (html) warn('html', `raw HTML (${[...new Set(html.map(t => t.match(/<\/?([a-z][\w-]*)/)[1]))].join(', ')})`)
    if (/\bstyle\s*=/.test(body)) warn('html', 'inline style=')

    const comps = [...new Set([...body.matchAll(/<([A-Z][\w]*)/g)].map(m => m[1]))]
    for (const c of comps.filter(c => talkComponents.has(c))) warn('component', `talk component <${c}>`)

    // a figure's title only names what is plotted, like an axis label; the
    // takeaway is the text that counts
    const counted = layout === 'figure'
      ? slide.content.replace(/^(?!\s*(!\[|<|::|$)).+$/m, '')
      : slide.content
    const count = t => onScreen(t).split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length
    const words = count(counted)
    if (words > WORDS) {
      const quoteless = counted.split('\n').filter(l => !/^\s*>/.test(l)).join('\n')
      const marked = [...quoteless.matchAll(/\*\*([^*]+)\*\*|(?<![*\w])\*([^*\s][^*]*)\*(?!\*)|_([^_]+)_|<(strong|em|b)\b[^>]*>([\s\S]*?)<\/\4>/g)]
        .map(m => m[1] ?? m[2] ?? m[3] ?? m[5]).join(' ')
      const emphasis = count(marked)
      if (!emphasis) warn('words', `${words} words on screen and nothing bold or in an accent colour (over ${WORDS} needs a highlight)`)
      else if (emphasis * 2 >= words) warn('words', `${words} words on screen, ${emphasis} of them emphasised; the highlight has to be under half the text`)
    }

    if (!LIST_LAYOUTS.has(layout) && /^\s*([-*+]|\d+\.)\s+\S/m.test(body.replace(/^\s*>.*$/gm, '')))
      warn('bullets', 'bullet list on screen')

    if (layout === 'figure' && !/^::takeaway::/m.test(slide.content)) warn('takeaway', 'figure slide with no ::takeaway::')

    const animated
      = /\bv-clicks?\b/.test(body)
      || /<(Reverb|ModelBars|PerformanceVideo)\b/.test(body)
      || fm.takeaway === 'click' || fm.thinker === 'click'
      || (layout === 'timeline' && fm.mark !== undefined)
      || (layout === 'bleed' && fm.video)
    if (animated) motion++
  })

  if (motion > MOTION && !talkAllow.includes('motion'))
    warns.push({ n: 0, rule: 'motion', msg: `${motion} animated moments in the talk (budget ${MOTION})` })

  for (const f of figureStatus(root)) {
    if (f.stale) fails.push({ n: 0, rule: 'stale', msg: `figures/${f.script} ${f.output ? 'is newer than its output' : 'has no output yet'}. Run: npm run figures ${path.basename(root)}` })
  }

  return { fails, warns, slides: md.slides.length }
}

export function report({ fails, warns }) {
  const where = n => (n ? `slide ${String(n).padStart(2)}` : 'talk    ')
  for (const f of fails) console.log(`FAIL  ${where(f.n)}  ${f.rule}: ${f.msg}`)
  for (const w of warns) console.log(`warn  ${where(w.n)}  ${w.rule}: ${w.msg}`)
}
