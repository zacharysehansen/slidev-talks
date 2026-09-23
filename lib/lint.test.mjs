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

w0 w1 w2 w3 w4 w5 w6 w7 w8 w9 w10 w11 w12 w13 w14 w15 w16 w17 w18 w19 w20 w21 w22 w23 w24 w25 w26 w27 w28 w29 w30 w31 w32 w33 w34 w35 w36 w37 w38 w39 w40 w41 w42 w43 w44 w45 w46 w47 w48 w49 w50 w51 w52 w53 w54

---

w0 w1 w2 w3 w4 w5 w6 w7 w8 w9 w10 w11 w12 w13 w14 w15 w16 w17 w18 w19 w20 w21 w22 w23 w24 w25 w26 w27 w28 w29 w30 w31 w32 w33 w34 w35 w36 w37 w38 w39 w40 w41 w42 w43 w44 w45 w46 w47 w48 w49 w50 w51 w52 w53 w54 **but this part stands out**

---

**w0 w1 w2 w3 w4 w5 w6 w7 w8 w9 w10 w11 w12 w13 w14 w15 w16 w17 w18 w19 w20 w21 w22 w23 w24 w25 w26 w27 w28 w29 w30 w31 w32 w33 w34 w35 w36 w37 w38 w39 w40 w41 w42 w43 w44 w45 w46 w47 w48 w49 w50 w51 w52 w53 w54**

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

w0 w1 w2 w3 w4 w5 w6 w7 w8 w9 w10 w11 w12 w13 w14 w15 w16 w17 w18 w19 w20 w21 w22 w23 w24 w25 w26 w27 w28 w29 w30 w31 w32 w33 w34 w35 w36 w37 w38 w39 w40 w41 w42 w43 w44 w45 w46 w47 w48 w49 w50 w51 w52 w53 w54

---

<v-clicks>

x

</v-clicks>
`)

const { fails, warns } = lint(path.join(dir, 'slides.md'))
const got = [...fails, ...warns].map(x => x.rule)
const count = r => got.filter(g => g === r).length
const expect = { missing: 1, stale: 1, html: 2, component: 1, words: 2, bullets: 1, takeaway: 1, motion: 1 }

let ok = true
for (const [rule, n] of Object.entries(expect)) {
  const c = count(rule)
  console.log(`${c === n ? ' ok ' : 'FAIL'}  ${rule}: ${c} (expected ${n})`)
  if (c !== n) ok = false
}
fs.rmSync(dir, { recursive: true, force: true })
process.exit(ok ? 0 : 1)
