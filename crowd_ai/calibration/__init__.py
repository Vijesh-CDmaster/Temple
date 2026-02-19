"""
Area Calibration Module
=======================
Camera calibration and area mapping utilities.
"""

from .camera_calibration import (
    CameraCalibration,
    CalibrationPoint,
    calibrate_from_reference,
    estimate_area_from_height,
    get_preset_calibration,
    CALIBRATION_PRESETS
)

__all__ = [
    "CameraCalibration",
    "CalibrationPoint",
    "calibrate_from_reference",
    "estimate_area_from_height",
    "get_preset_calibration",
    "CALIBRATION_PRESETS"
]
