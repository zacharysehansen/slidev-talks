"""
Centralized figure styling package.

Reproduces the visual language from the AI-Fallibility project figures:
bold Arial, semantic red/green/blue palette, minimal chrome, publication-ready.

Usage:
    import figures.plot_styles as ps

    ps.apply("standard")          # load base style + font tier
    fig, ax = plt.subplots(...)
    ps.bold_ticks(ax)
    ps.save(fig, "my_figure")

Slides (this copy lives in the deck theme; everything below is additive, so the
file still works dropped back into the paper project):
    ps.apply("slide")             # projection sizes, transparent, text as paths
    fig, ax = plt.subplots(figsize=ps.SLIDE_FIGSIZE)
    ps.save_slide(fig)            # public/figures/<script name>.svg
"""

import os
import sys
from typing import List, Optional, Tuple

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.axes import Axes
from matplotlib.figure import Figure
from matplotlib.colors import ListedColormap


# ── Semantic color constants ────────────────────────────────────────────────

AFFIRM = "#E41A1C"
REJECT = "#4DAF4A"
FAILED = "#999999"

BAR_BLACK = "#000000"
BAR_RED = "#C0392B"

STACKED_AFFIRM = "#C0392B"
STACKED_REJECT = "#27AE60"

TREND_LINE = "#377EB8"
TREND_BAND = "#C5B3E6"
SPAGHETTI = "#B7B7B7"
MIDLINE = "#9A9A9A"

GRID_LIGHT = "#E2E2E2"
GRIDLINE = "#B0B0B0"
EMPTY_BG = "#ECECEC"

SECTION_DIVIDER = "#333333"
RULE_DARK = "#222222"
RULE_LIGHT = "#BBBBBB"

LABEL_OPEN = "#1F5C8B"
LABEL_CLOSED = "#B35400"
LABEL_UNDISCLOSED = "#767676"
TEXT_BODY = "#3D3D3D"
TEXT_DARK = "#111111"


# ── Color cycle (ColorBrewer-influenced) ────────────────────────────────────

COLOR_CYCLE = [
    "#377EB8", "#4DAF4A", "#FF7F00", "#E41A1C", "#F781BF",
    "#FFFF33", "#A65628", "#984EA3", "#A6CEE3", "#FF33CC",
]


# ── DPI presets ─────────────────────────────────────────────────────────────

PREVIEW_DPI = 100
UPLOAD_DPI = 200
PRINT_DPI = 300

# Slide figures. The figure layout shows a plot about 1104x430 CSS px, and an
# SVG's intrinsic size is 96 px per inch, so this figsize lands at 1:1 and a
# point size here is 4/3 of that in CSS px (ticks 15pt = 20px on the slide).
SLIDE_FIGSIZE = (11.5, 4.45)
SLIDE_RASTER_DPI = 200


# ── Font-size tiers ─────────────────────────────────────────────────────────
#
# Three tiers match the three figure scales from the project:
#   poster   — enormous grid figures (heatmaps at 80x72 inches)
#   standard — standalone charts (bar, single trend, zigzag)
#   compact  — small-multiple grid panels
#
# Each tier is a dict applied to rcParams; individual scripts can still
# override specific values after calling apply().

_FONT_TIERS = {
    "poster": {
        "axes.titlesize": 84,
        "axes.labelsize": 72,
        "xtick.labelsize": 40,
        "ytick.labelsize": 40,
        "legend.fontsize": 64,
        "legend.title_fontsize": 72,
        "figure.titlesize": 84,
    },
    "standard": {
        "axes.titlesize": 22,
        "axes.labelsize": 18,
        "xtick.labelsize": 13,
        "ytick.labelsize": 13,
        "legend.fontsize": 14,
        "legend.title_fontsize": 16,
        "figure.titlesize": 26,
    },
    "slide": {
        "axes.titlesize": 20,
        "axes.labelsize": 18,
        "xtick.labelsize": 15,
        "ytick.labelsize": 15,
        "legend.fontsize": 15,
        "legend.title_fontsize": 16,
        "figure.titlesize": 22,
    },
    "compact": {
        "axes.titlesize": 20,
        "axes.labelsize": 16,
        "xtick.labelsize": 11,
        "ytick.labelsize": 11,
        "legend.fontsize": 11,
        "legend.title_fontsize": 13,
        "figure.titlesize": 20,
    },
}


# ── Core style application ──────────────────────────────────────────────────

def apply(tier: str = "standard") -> None:
    """Load the base publication style and apply a named font-size tier.

    Args:
        tier: One of "poster", "standard", or "compact".
    """
    _base_rcparams()
    if tier in _FONT_TIERS:
        plt.rcParams.update(_FONT_TIERS[tier])
    if tier == "slide":
        _slide_rcparams()


def _slide_rcparams() -> None:
    """Extras for figures shown on a slide rather than printed.

    The slide's own title line names the plot, so figures carry no title.
    Arial falls through to Liberation Sans, which has Arial's metrics, on a
    machine without it. Text is saved as paths so the SVG looks the same on
    whatever machine presents it.
    """
    from matplotlib import font_manager
    installed = {f.name for f in font_manager.fontManager.ttflist}
    family = [f for f in ("Arial", "Liberation Sans") if f in installed] or ["DejaVu Sans"]
    plt.rcParams.update({
        "font.family": family,
        "figure.facecolor": "none",
        "axes.facecolor": "none",
        "savefig.transparent": True,
        "svg.fonttype": "path",
    })


def _base_rcparams() -> None:
    """Set the core rcParams that define the visual language."""
    plt.rcParams.update({
        # Font
        "font.family": "Arial",
        "font.size": 14,
        "font.weight": "bold",

        # Axes
        "axes.spines.top": False,
        "axes.spines.right": False,
        "axes.titleweight": "bold",
        "axes.labelweight": "bold",
        "axes.prop_cycle": plt.cycler("color", COLOR_CYCLE),

        # Figure
        "figure.autolayout": True,

        # Save
        "savefig.dpi": PRINT_DPI,
        "savefig.bbox": "tight",
    })


def apply_no_autolayout(tier: str = "standard") -> None:
    """Same as apply() but disables autolayout and uses standard bbox.

    Use for figures with manual GridSpec layouts (e.g., heatmap grids).
    """
    apply(tier)
    plt.rcParams["figure.autolayout"] = False
    plt.rcParams["savefig.bbox"] = "standard"


# ── Colormaps ───────────────────────────────────────────────────────────────

def binary_colormap() -> ListedColormap:
    """Red/green binary colormap with gray for NaN/missing."""
    cmap = ListedColormap([REJECT, AFFIRM])
    cmap.set_bad(FAILED)
    return cmap


# ── Tick helpers ────────────────────────────────────────────────────────────

def bold_ticks(axis: Axes, which: str = "both") -> None:
    """Make tick labels bold on the given axis.

    Args:
        which: "x", "y", or "both".
    """
    labels = []
    if which in ("x", "both"):
        labels += axis.get_xticklabels()
    if which in ("y", "both"):
        labels += axis.get_yticklabels()
    for label in labels:
        label.set_fontweight("bold")


# ── Panel styling ───────────────────────────────────────────────────────────

def clean_panel(
    axis: Axes,
    ref_line: Optional[float] = None,
    ref_color: str = GRIDLINE,
    bg_color: Optional[str] = None,
) -> None:
    """Style a small-multiple panel: no grid, optional reference line & bg.

    Args:
        ref_line: Y-value for a single horizontal reference line.
        ref_color: Color of the reference line.
        bg_color: Panel background color (e.g., EMPTY_BG).
    """
    axis.grid(False)
    if ref_line is not None:
        axis.axhline(ref_line, color=ref_color, linewidth=1.0, zorder=0)
    if bg_color is not None:
        axis.set_facecolor(bg_color)


def strip_ticks(axis: Axes, x: bool = True, y: bool = True) -> None:
    """Remove tick marks and labels from an axis."""
    if x:
        axis.set_xticks([])
    if y:
        axis.set_yticks([])


# ── Legends ─────────────────────────────────────────────────────────────────

def bottom_legend(
    figure: Figure,
    handles: list,
    fontsize: Optional[int] = None,
    y: float = 0.01,
) -> None:
    """Place a frameless legend at the bottom center of the figure.

    Args:
        handles: List of matplotlib patch/line handles.
        fontsize: Override font size (defaults to current rcParams).
        y: Vertical anchor position in figure coordinates.
    """
    kwargs = {
        "handles": handles,
        "loc": "lower center",
        "ncol": len(handles),
        "frameon": False,
        "bbox_to_anchor": (0.5, y),
    }
    if fontsize is not None:
        kwargs["fontsize"] = fontsize
    figure.legend(**kwargs)


def heatmap_legend(
    figure: Figure,
    has_failed: bool = False,
    fontsize: int = 64,
) -> None:
    """Add the standard Rejection / Affirmation / Failed legend."""
    handles = [
        mpatches.Patch(color=REJECT, label="Rejection"),
        mpatches.Patch(color=AFFIRM, label="Affirmation"),
    ]
    if has_failed:
        handles.append(mpatches.Patch(color=FAILED, label="Failed"))
    bottom_legend(figure, handles, fontsize=fontsize)


# ── Section dividers & labels ───────────────────────────────────────────────

def section_divider(
    figure: Figure,
    y: float,
    x_start: float = 0.02,
    x_end: float = 0.99,
    color: str = SECTION_DIVIDER,
    linewidth: float = 2.0,
) -> None:
    """Draw a horizontal divider line across the figure."""
    figure.add_artist(
        plt.Line2D(
            [x_start, x_end],
            [y, y],
            color=color,
            linewidth=linewidth,
            transform=figure.transFigure,
        )
    )


def section_label(
    figure: Figure,
    text: str,
    y: float,
    x: float = 0.012,
    fontsize: int = 34,
) -> None:
    """Place a bold section label at a figure-coordinate position."""
    figure.text(
        x, y, text,
        fontsize=fontsize,
        fontweight="bold",
        ha="left",
        va="center",
    )


# ── Table rules ─────────────────────────────────────────────────────────────

def table_rule(
    axis: Axes,
    y: float,
    color: str = RULE_DARK,
    linewidth: float = 1.6,
) -> None:
    """Draw a horizontal rule across a table axis (0-1 coordinates)."""
    axis.plot(
        [0.0, 1.0], [y, y],
        color=color,
        linewidth=linewidth,
        solid_capstyle="butt",
    )


def table_section_rule(
    axis: Axes,
    y: float,
    color: str = RULE_LIGHT,
    linewidth: float = 1.0,
) -> None:
    """Draw a dotted section separator in a table."""
    axis.plot(
        [0.0, 1.0], [y, y],
        color=color,
        linewidth=linewidth,
        linestyle=(0, (1, 3)),
        solid_capstyle="butt",
    )


# ── Heatmap sidebar ────────────────────────────────────────────────────────

def draw_sidebar(axis: Axes, rates: np.ndarray) -> None:
    """Draw a stacked horizontal bar sidebar showing rejection/affirmation.

    Args:
        rates: Array of rejection rates (0-1) per row.
    """
    num_rows = len(rates)
    y_positions = np.arange(num_rows)

    rejection = np.where(np.isnan(rates), 0, rates)
    affirmation = 1.0 - rejection

    axis.barh(
        y_positions, rejection,
        color=REJECT, height=1.0, edgecolor="none",
    )
    axis.barh(
        y_positions, affirmation, left=rejection,
        color=AFFIRM, height=1.0, edgecolor="none",
    )
    axis.set_xlim(0, 1.05)
    axis.set_ylim(num_rows - 0.5, -0.5)
    strip_ticks(axis)


def heatmap_sidebar_layout(
    n_panels: int,
    heatmap_width: float = 5.0,
    sidebar_width: float = 1.0,
    sidebar_gap: float = 0.4,
    panel_gap: float = 0.8,
) -> Tuple[List[float], List[int]]:
    """Build column width ratios for a heatmap + sidebar grid.

    Returns:
        (column_widths, panel_column_starts): widths for GridSpec and
        the column index where each panel's heatmap begins.
    """
    column_widths: List[float] = []
    panel_starts: List[int] = []

    for i in range(n_panels):
        panel_starts.append(len(column_widths))
        column_widths.append(heatmap_width)
        column_widths.append(sidebar_gap)
        column_widths.append(sidebar_width)
        if i < n_panels - 1:
            column_widths.append(panel_gap)

    return column_widths, panel_starts


# ── Spaghetti + mean overlay ───────────────────────────────────────────────

def spaghetti_lines(
    axis: Axes,
    matrix: np.ndarray,
    color: str = SPAGHETTI,
    alpha: float = 0.30,
    linewidth: float = 0.9,
) -> None:
    """Draw individual prompt lines (the spaghetti background)."""
    x = np.arange(1, matrix.shape[1] + 1)
    for row in matrix:
        axis.plot(x, row, color=color, alpha=alpha, linewidth=linewidth, zorder=1)


def mean_with_se_band(
    axis: Axes,
    matrix: np.ndarray,
    line_color: str = TREND_LINE,
    line_width: float = 3.0,
    band_color: str = TREND_BAND,
    band_alpha: float = 0.35,
    label: Optional[str] = None,
) -> None:
    """Draw the mean trend line with a standard-error band."""
    x = np.arange(1, matrix.shape[1] + 1)
    means = np.nanmean(matrix, axis=0)
    n_valid = np.sum(~np.isnan(matrix), axis=0)
    se = np.nanstd(matrix, axis=0) / np.sqrt(np.where(n_valid == 0, 1, n_valid))

    axis.fill_between(
        x, means - se, means + se,
        color=band_color, alpha=band_alpha, linewidth=0, zorder=2,
    )
    axis.plot(
        x, means,
        color=line_color, linewidth=line_width, zorder=3, label=label,
    )


# ── Zigzag / trajectory panel ──────────────────────────────────────────────

def zigzag_panel(
    axis: Axes,
    trajectory: np.ndarray,
    line_color: str = TREND_LINE,
    fill_color: str = TREND_BAND,
    line_width: float = 2.0,
    show_x: bool = False,
    stance_fontsize: int = 14,
) -> None:
    """Style a binary agree/disagree trajectory panel.

    Args:
        trajectory: 1-D array of 0s and 1s.
        show_x: Whether to show x-axis ticks and label.
        stance_fontsize: Font size for "Agreed" / "Disagreed" y-labels.
    """
    reps = np.arange(1, len(trajectory) + 1)

    axis.axhline(0.5, color=MIDLINE, linestyle=":", linewidth=1.6, zorder=0)
    axis.fill_between(reps, trajectory, 0, color=fill_color, linewidth=0, zorder=1)
    axis.plot(reps, trajectory, color=line_color, linewidth=line_width, zorder=2)

    axis.set_xlim(1, len(trajectory))
    axis.set_ylim(-0.18, 1.18)
    axis.grid(False)

    axis.set_yticks([0, 1])
    axis.set_yticklabels(
        ["Disagreed", "Agreed"],
        fontsize=stance_fontsize,
        fontweight="bold",
    )
    axis.tick_params(axis="y", length=0)

    if not show_x:
        axis.set_xticks([])


# ── Save helper ─────────────────────────────────────────────────────────────

def save(
    figure: Figure,
    name: str,
    directory: str = "figures",
    dpi: int = PREVIEW_DPI,
    suffix: Optional[str] = None,
    extension: str = "png",
) -> str:
    """Save a figure with a consistent naming pattern.

    Args:
        name: Base filename (no extension).
        directory: Output directory (created if needed).
        dpi: Resolution.
        suffix: Optional suffix appended before the extension (e.g., a classifier tag).
        extension: File format.

    Returns:
        The path the figure was saved to.
    """
    os.makedirs(directory, exist_ok=True)
    filename = f"{name}_{suffix}.{extension}" if suffix else f"{name}.{extension}"
    path = os.path.join(directory, filename)
    figure.savefig(path, dpi=dpi, bbox_inches="tight")
    return path


def save_slide(
    figure: Figure,
    name: Optional[str] = None,
    raster: bool = False,
    directory: Optional[str] = None,
) -> str:
    """Save a figure for a slide.

    Args:
        name: Base filename. Defaults to the running script's name, which is
            what the deck's figure runner expects (figures/foo.py -> foo.svg).
        raster: PNG at SLIDE_RASTER_DPI instead of SVG. For dense images such
            as heatmaps, where thousands of vector cells would be slow.
        directory: Defaults to $DECK_FIGURES, set by the runner, else
            public/figures.

    Returns:
        The path the figure was saved to.
    """
    if name is None:
        name = os.path.splitext(os.path.basename(sys.argv[0]))[0]
    if directory is None:
        directory = os.environ.get("DECK_FIGURES", os.path.join("public", "figures"))
    return save(
        figure,
        name,
        directory=directory,
        dpi=SLIDE_RASTER_DPI,
        extension="png" if raster else "svg",
    )
