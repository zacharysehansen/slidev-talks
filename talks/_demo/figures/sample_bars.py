"""Sample bar chart for the demo talk. Invented numbers, see data/README.md."""
import csv

import matplotlib.pyplot as plt

import plot_styles as ps

with open("data/sample_rates.csv") as f:
    rows = list(csv.DictReader(f))
names = [r["condition"] for r in rows]
values = [float(r["accuracy"]) for r in rows]

ps.apply("slide")
fig, ax = plt.subplots(figsize=ps.SLIDE_FIGSIZE)
best = max(values)
ax.bar(names, values, width=0.62,
       color=[ps.BAR_RED if v == best else ps.BAR_BLACK for v in values])
ax.set_ylabel("Accuracy (%)")
ax.set_ylim(0, 100)
ps.bold_ticks(ax)
ps.save_slide(fig)
