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
layout: close
---

# The line the talk opened on

name@example.edu
