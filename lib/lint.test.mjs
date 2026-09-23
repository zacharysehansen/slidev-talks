/**
 * Self-test for lib/lint.mjs: builds a deliberately broken talk in a temp
 * directory and checks that every rule fires exactly once.
 *
 *   node lib/lint.test.mjs
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { lint } from './lint.mjs'

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lint-'))
fs.mkdirSync(path.join(dir, 'components'))
fs.mkdirSync(path.join(dir, 'figures'))
fs.mkdirSync(path.join(dir, 'public'))
fs.writeFileSync(path.join(dir, 'components', 'Local.vue'), '<template><div /></template>')
fs.writeFileSync(path.join(dir, 'figures', 'never_run.py'), 'print(1)')
fs.writeFileSync(path.join(dir, 'slides.md'), `---
theme: none
layout: statement
---

# Fine

---
layout: plate
---

![](/assets/not-here.png)

---

<div style="color:red">html</div>

---

<Local />

---

## One two three four five six seven eight nine ten eleven twelve thirteen

---

- a bullet

---
layout: figure
---

A title only

---
layout: figure
takeaway: click
---

Title

::takeaway::
Claim

---
thinker: click
---

x

---
layout: timeline
mark: 1980
---

- 1970 a
- 1990 b

---
allow: [words]
---

One two three four five six seven eight nine ten eleven twelve thirteen

---

<v-clicks>

x

</v-clicks>
`)

const { fails, warns } = lint(path.join(dir, 'slides.md'))
const got = [...fails, ...warns].map(x => x.rule)
const count = r => got.filter(g => g === r).length
const expect = { missing: 1, stale: 1, html: 2, component: 1, words: 1, bullets: 1, takeaway: 1, motion: 1 }

let ok = true
for (const [rule, n] of Object.entries(expect)) {
  const c = count(rule)
  console.log(`${c === n ? ' ok ' : 'FAIL'}  ${rule}: ${c} (expected ${n})`)
  if (c !== n) ok = false
}
fs.rmSync(dir, { recursive: true, force: true })
process.exit(ok ? 0 : 1)
