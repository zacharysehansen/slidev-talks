"""A generated stand-in video for the demo's bleed layout: four seconds of a
dot orbiting, written with ffmpeg, so the demo ships no binary assets."""
import os

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FFMpegWriter, FuncAnimation

fig = plt.figure(figsize=(12.8, 7.2), dpi=50)
ax = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(-1.6, 1.6)
ax.set_ylim(-0.9, 0.9)
ax.set_axis_off()
fig.set_facecolor("#0C224A")
dot, = ax.plot([], [], "o", ms=40, color="#81D2EB")

def frame(i):
    t = i / 24 * np.pi
    dot.set_data([np.cos(t)], [0.6 * np.sin(t)])
    return dot,

out = os.environ.get("DECK_FIGURES", "public/figures")
os.makedirs(out, exist_ok=True)
FuncAnimation(fig, frame, frames=96, blit=True).save(
    os.path.join(out, "sample_clip.mp4"),
    writer=FFMpegWriter(fps=24, codec="libx264", extra_args=["-pix_fmt", "yuv420p"]),
)
