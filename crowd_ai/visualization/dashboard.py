"""
Dashboard Visualization
=======================
Create comprehensive dashboard views with stats overlays.
"""

from typing import Dict, Optional, List
import cv2
import numpy as np

from ..inference.density_analyzer import DensityLevel, DensityStats


def draw_stats_overlay(
    frame: np.ndarray,
    stats: Dict,
    position: str = "top-left"
) -> np.ndarray:
    """
    Draw statistics overlay on frame.
    
    Args:
        frame: Input frame
        stats: Dictionary of statistics to display
        position: Overlay position ('top-left', 'top-right', 'bottom-left', 'bottom-right')
        
    Returns:
        Frame with stats overlay
    """
    result = frame.copy()
    h, w = result.shape[:2]
    
    # Calculate text dimensions
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.5
    thickness = 1
    line_height = 25
    padding = 10
    
    # Prepare text lines
    lines = []
    for key, value in stats.items():
        if isinstance(value, float):
            lines.append(f"{key}: {value:.2f}")
        else:
            lines.append(f"{key}: {value}")
    
    # Calculate box dimensions
    max_width = max(cv2.getTextSize(line, font, font_scale, thickness)[0][0] for line in lines)
    box_width = max_width + 2 * padding
    box_height = len(lines) * line_height + 2 * padding
    
    # Position
    if "right" in position:
        x = w - box_width - 10
    else:
        x = 10
    
    if "bottom" in position:
        y = h - box_height - 10
    else:
        y = 10
    
    # Draw background
    overlay = result.copy()
    cv2.rectangle(overlay, (x, y), (x + box_width, y + box_height), (0, 0, 0), -1)
    result = cv2.addWeighted(overlay, 0.7, result, 0.3, 0)
    
    # Draw border
    cv2.rectangle(result, (x, y), (x + box_width, y + box_height), (100, 100, 100), 1)
    
    # Draw text
    for i, line in enumerate(lines):
        text_y = y + padding + (i + 1) * line_height - 5
        cv2.putText(result, line, (x + padding, text_y), font, font_scale, (255, 255, 255), thickness)
    
    return result


def create_dashboard_frame(
    frame: np.ndarray,
    density_map: np.ndarray,
    stats: Optional[DensityStats] = None,
    count: float = 0,
    density_level: str = "UNKNOWN",
    fps: float = 0,
    show_histogram: bool = True
) -> np.ndarray:
    """
    Create comprehensive dashboard with all visualizations.
    
    Layout:
    ┌─────────────────────────────────────┐
    │  Main View (with heatmap overlay)   │
    │                                     │
    │  ┌──────┐                    ┌────┐ │
    │  │Stats │                    │Bar │ │
    │  └──────┘                    └────┘ │
    ├─────────────────────────────────────┤
    │ Histogram │ Mini-map │ Safety Meter │
    └─────────────────────────────────────┘
    
    Args:
        frame: Original camera frame
        density_map: Density map from model
        stats: DensityStats object (optional)
        count: Crowd count
        density_level: Density classification
        fps: Current processing FPS
        show_histogram: Whether to show density histogram
        
    Returns:
        Dashboard frame
    """
    from .heatmap import generate_heatmap, overlay_heatmap
    
    h, w = frame.shape[:2]
    
    # Target dashboard size
    dash_w = max(800, w)
    dash_h = int(dash_w * 0.75)  # 4:3 aspect ratio
    
    # Main view height
    main_h = int(dash_h * 0.75)
    bottom_h = dash_h - main_h
    
    # Create dashboard canvas
    dashboard = np.zeros((dash_h, dash_w, 3), dtype=np.uint8)
    
    # --- Main View with Heatmap ---
    # Resize frame to fit main view
    main_frame = cv2.resize(frame, (dash_w, main_h))
    
    # Generate and overlay heatmap
    heatmap = generate_heatmap(density_map, target_size=(dash_w, main_h), colormap="turbo")
    main_view = overlay_heatmap(main_frame, heatmap, alpha=0.5)
    
    # Draw stats box
    stats_dict = {
        "Count": f"{count:.0f}",
        "Level": density_level,
        "FPS": f"{fps:.1f}",
    }
    if stats:
        stats_dict["Density"] = f"{stats.density_per_sqm:.2f}/sqm"
        stats_dict["Hotspots"] = str(stats.hotspot_count)
    
    main_view = _draw_stats_box(main_view, stats_dict, density_level)
    
    # Draw color bar
    main_view = _draw_color_bar(main_view)
    
    dashboard[0:main_h, 0:dash_w] = main_view
    
    # --- Bottom Panel ---
    panel_w = dash_w // 3
    
    # Histogram panel
    if show_histogram:
        hist_panel = _create_histogram_panel(density_map, panel_w, bottom_h)
        dashboard[main_h:dash_h, 0:panel_w] = hist_panel
    
    # Mini density map
    mini_map = _create_mini_map(density_map, panel_w, bottom_h)
    dashboard[main_h:dash_h, panel_w:2*panel_w] = mini_map
    
    # Safety meter
    safety_panel = _create_safety_meter(
        density_level,
        stats.density_per_sqm if stats else count / 100,
        panel_w, bottom_h
    )
    dashboard[main_h:dash_h, 2*panel_w:dash_w] = safety_panel
    
    return dashboard


def _draw_stats_box(
    frame: np.ndarray,
    stats: Dict[str, str],
    level: str
) -> np.ndarray:
    """Draw statistics box on main view."""
    result = frame.copy()
    
    # Box dimensions
    box_w = 180
    box_h = len(stats) * 30 + 20
    x, y = 15, 15
    
    # Semi-transparent background
    overlay = result.copy()
    cv2.rectangle(overlay, (x, y), (x + box_w, y + box_h), (30, 30, 30), -1)
    result = cv2.addWeighted(overlay, 0.8, result, 0.2, 0)
    
    # Border color based on level
    level_colors = {
        "FREE_FLOW": (0, 200, 0),
        "LOW": (0, 255, 0),
        "MEDIUM": (0, 200, 200),
        "HIGH": (0, 150, 255),
        "CRITICAL": (0, 0, 255),
    }
    border_color = level_colors.get(level, (128, 128, 128))
    cv2.rectangle(result, (x, y), (x + box_w, y + box_h), border_color, 2)
    
    # Stats text
    for i, (key, value) in enumerate(stats.items()):
        text_y = y + 25 + i * 30
        cv2.putText(result, f"{key}:", (x + 10, text_y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (150, 150, 150), 1)
        cv2.putText(result, str(value), (x + 80, text_y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    
    return result


def _draw_color_bar(frame: np.ndarray) -> np.ndarray:
    """Draw vertical color bar legend."""
    result = frame.copy()
    h, w = result.shape[:2]
    
    bar_w = 20
    bar_h = 120
    x = w - bar_w - 20
    y = (h - bar_h) // 2
    
    # Gradient
    gradient = np.linspace(255, 0, bar_h).astype(np.uint8).reshape(-1, 1)
    gradient = np.repeat(gradient, bar_w, axis=1)
    color_bar = cv2.applyColorMap(gradient, cv2.COLORMAP_TURBO)
    
    result[y:y+bar_h, x:x+bar_w] = color_bar
    cv2.rectangle(result, (x-1, y-1), (x+bar_w, y+bar_h), (255, 255, 255), 1)
    
    # Labels
    cv2.putText(result, "High", (x - 40, y + 15),
                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    cv2.putText(result, "Low", (x - 35, y + bar_h - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    
    return result


def _create_histogram_panel(
    density_map: np.ndarray,
    width: int,
    height: int
) -> np.ndarray:
    """Create density histogram panel."""
    panel = np.zeros((height, width, 3), dtype=np.uint8)
    panel[:] = (30, 30, 30)  # Dark background
    
    # Calculate histogram
    if density_map.ndim > 2:
        density_map = density_map.squeeze()
    
    # Flatten and normalize
    values = density_map.flatten()
    values = values[values > 0.001]  # Filter near-zero
    
    if len(values) == 0:
        cv2.putText(panel, "No density data", (10, height // 2),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (100, 100, 100), 1)
        return panel
    
    # Create histogram
    hist_bins = 30
    hist, bin_edges = np.histogram(values, bins=hist_bins)
    
    # Normalize histogram heights
    max_hist = max(hist) if max(hist) > 0 else 1
    hist_normalized = (hist / max_hist * (height - 40)).astype(int)
    
    # Draw histogram bars
    bar_width = (width - 40) // hist_bins
    
    for i, h_val in enumerate(hist_normalized):
        x1 = 20 + i * bar_width
        y1 = height - 20
        x2 = x1 + bar_width - 2
        y2 = y1 - h_val
        
        # Color based on position (low to high)
        color_val = int(255 * i / hist_bins)
        color = cv2.applyColorMap(np.array([[color_val]], dtype=np.uint8), cv2.COLORMAP_TURBO)[0, 0]
        color = tuple(map(int, color))
        
        cv2.rectangle(panel, (x1, y2), (x2, y1), color, -1)
    
    # Title
    cv2.putText(panel, "Density Distribution", (10, 20),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
    
    return panel


def _create_mini_map(
    density_map: np.ndarray,
    width: int,
    height: int
) -> np.ndarray:
    """Create mini density map view."""
    from .heatmap import generate_heatmap
    
    panel = np.zeros((height, width, 3), dtype=np.uint8)
    panel[:] = (30, 30, 30)
    
    # Generate small heatmap
    map_margin = 10
    map_w = width - 2 * map_margin
    map_h = height - 30 - map_margin
    
    mini_heatmap = generate_heatmap(density_map, target_size=(map_w, map_h), colormap="turbo")
    
    # Paste on panel
    panel[25:25+map_h, map_margin:map_margin+map_w] = mini_heatmap
    
    # Border
    cv2.rectangle(panel, (map_margin-1, 24), (map_margin+map_w, 25+map_h), (100, 100, 100), 1)
    
    # Title
    cv2.putText(panel, "Density Map", (10, 18),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
    
    return panel


def _create_safety_meter(
    level: str,
    density_per_sqm: float,
    width: int,
    height: int
) -> np.ndarray:
    """Create safety meter visualization."""
    panel = np.zeros((height, width, 3), dtype=np.uint8)
    panel[:] = (30, 30, 30)
    
    # Title
    cv2.putText(panel, "Safety Status", (10, 20),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
    
    # Level indicator
    level_colors = {
        "FREE_FLOW": ((0, 200, 0), "SAFE"),
        "LOW": ((0, 255, 0), "SAFE"),
        "MEDIUM": ((0, 200, 200), "MONITOR"),
        "HIGH": ((0, 150, 255), "WARNING"),
        "CRITICAL": ((0, 0, 255), "DANGER"),
    }
    
    color, status = level_colors.get(level, ((128, 128, 128), "UNKNOWN"))
    
    # Large status indicator
    center_x = width // 2
    center_y = height // 2 + 10
    radius = min(width, height) // 3 - 10
    
    # Glow effect
    cv2.circle(panel, (center_x, center_y), radius + 5, color, 2)
    cv2.circle(panel, (center_x, center_y), radius, color, -1)
    
    # Status text
    text_size = cv2.getTextSize(status, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
    text_x = center_x - text_size[0] // 2
    text_y = center_y + text_size[1] // 2
    
    # Contrast text color
    text_color = (0, 0, 0) if level in ["FREE_FLOW", "LOW", "MEDIUM"] else (255, 255, 255)
    cv2.putText(panel, status, (text_x, text_y),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, text_color, 2)
    
    # Density value
    density_text = f"{density_per_sqm:.2f} p/sqm"
    cv2.putText(panel, density_text, (10, height - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (150, 150, 150), 1)
    
    return panel
