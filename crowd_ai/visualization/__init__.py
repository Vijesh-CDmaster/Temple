"""
Visualization Module
====================
Heatmap generation and density visualization.
"""

from .heatmap import (
    generate_heatmap,
    overlay_heatmap,
    DensityVisualizer
)
from .dashboard import (
    create_dashboard_frame,
    draw_stats_overlay
)

__all__ = [
    "generate_heatmap",
    "overlay_heatmap",
    "DensityVisualizer",
    "create_dashboard_frame",
    "draw_stats_overlay"
]
