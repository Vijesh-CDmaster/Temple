"""
Crowd Density Estimation System using CSRNet
================================================
A free, open-source crowd counting and density estimation pipeline
designed for temple festival crowd management.

Features:
- CSRNet (PyTorch) for density estimation
- Real-time webcam or RTSP stream processing
- Density heatmap visualization
- Area-wise crowd count and density classification

Author: Temple Crowd Management System
License: MIT (Open Source)
"""

__version__ = "1.0.0"
__all__ = ["models", "capture", "preprocessing", "inference", "visualization", "calibration"]
