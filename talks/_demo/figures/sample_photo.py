"""A generated stand-in photograph for the demo's photo layout: a dark
starfield, so the demo ships no binary assets."""
import os

import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(7)
h, w = 720, 1280
y = np.linspace(0, 1, h)[:, None]
sky = np.dstack([0.02 + 0.10 * y, 0.04 + 0.12 * y, 0.12 + 0.20 * y]) * np.ones((h, w, 1))
for _ in range(900):
    r, c = rng.integers(0, h), rng.integers(0, w)
    sky[r, c] = rng.uniform(0.6, 1.0)
out = os.environ.get("DECK_FIGURES", "public/figures")
os.makedirs(out, exist_ok=True)
plt.imsave(os.path.join(out, "sample_photo.png"), np.clip(sky, 0, 1))
