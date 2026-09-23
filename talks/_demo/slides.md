---
# The theme's test deck. One slide per layout, invented content only, and no
# binary assets, so it runs from a fresh clone of the public repo.
#
#   npm run dev _demo
#   npm run check _demo
theme: ../../theme
title: Layout demo
layout: title
foot: Theme test deck
thinker: click
---

# Layout demo

Every layout in the theme, once, in plain markdown

<!-- title layout, markdown form. `thinker: click` brings the cutout in. -->

---
layout: statement
---

# Which description helps you *recognize* the patient?

1986 or 2012?

---
layout: statement
field: light
---

# The same statement on the **light field**.

`field: light` works on any layout.

---
layout: default
---

## A heading pinned to the top

One short line under it, with *the phrase that carries it* in bloom and a **second accent** in arroyo.

---
layout: default
field: light
---

## The default layout, light

One short line under it.

---
layout: quote
---

> Everything I work on ends in something you can look at.

---
layout: quote
field: light
---

> A quotation gets the slide to itself, and nothing says who said it.

---
layout: number
---

# 0.1%

of turns affirmed

# 0 of 4

of its own errors corrected

---
layout: number
field: light
---

# 150×

between the best and the worst

---
layout: divider
eyebrow: Project 1
---

# A named section opener

---
layout: figure
---

Sample accuracy, by training condition

![](/figures/sample_bars.svg)

::takeaway::
The *combined* condition leads by fourteen points.

<!--
figure layout. The first line is the grey title and names only what is
plotted. The takeaway is the claim. Numbers are invented, see data/README.md.
-->

---
layout: figure
takeaway: click
---

Sample accuracy, by training condition

![](/figures/sample_bars.svg)

::takeaway::
The same slide, with the takeaway *held back one click*.

---
layout: compare
---

## The same disease, the same textbook series.

::left::

### 1986

> "swallowed material accumulates in the esophagus until the sheer weight of the contents overcomes sphincteric resistance"

> "seems to swallow better when he eats at home"

**Observation**

::right::

### 2012

> "the sphincter loses its ability to relax"

**Mechanism**

::foot::

Same disease. Same textbook series. 26 years apart.

---
layout: compare
vs: vs.
---

## Hypothesis

::left::

### COMBINED

Early + Middle + Late

::right::

### SINGLE ERA

Early *or* Middle *or* Late

---
layout: steps
hero: 4
---

## Four questions, one experiment

1. Do the eras differ?
2. Can the corpus be built?
3. Does fine-tuning improve diagnosis?
4. Does era explain the difference?

---
layout: grid
---

## One specialty textbook joins in each field

### Nephrology

Brenner and Rector

### Cardiology

Braunwald

### Gastroenterology

Bockus and Sleisenger

### Pulmonology

Murray and Nadel

::foot::

Known limitation: specialty series begin later

---
layout: grid
field: light
---

## Four specialties. Ten diseases each.

### Nephrology

**10**

### Cardiology

**10**

### Pulmonology

**10**

### Gastroenterology

**10**

::foot::

Selection criterion: *prevalence*

---
layout: flow
---

## Observation gave way to criteria.

- Descriptive prose
- Standardized terminology
- Explicit diagnostic criteria

---
layout: flow
---

## A model learns from whatever corpus it is given.

- Pretraining
  - General text
- Fine-tuning
  - Chosen corpus
- **Learned content + style**

::foot::

This study changes only the corpus.

---
layout: flow
direction: across
---

## From scanned pages to training data

- SCAN
  - Digitize pages
- LOCATE
  - Find disease sections
- EXTRACT
  - Pull passages
- LABEL
  - Era + specialty tags
- **TRAINING FILE**

::foot::

Hardest step: identifying sections in older editions

---
layout: flow
direction: across
---

# If the eras read alike, the study stops here.

1. Era difference
   - Readability + BERTScore
2. Source difference
   - Within the same era
3. **Proceed to fine-tuning**

---
layout: timeline
mark: 1980 DSM-III
---

## Cecil's editions

- 1963 Early
  - Observational prose. The physician describes what they saw.
- 1983 Middle
  - The transition. Criteria start displacing description.
- 2012 Late
  - Structured criteria, standardized terminology, tables.

---
layout: close
---

# The line the talk opened on

name@example.edu
