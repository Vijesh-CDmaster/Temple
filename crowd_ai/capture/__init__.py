"""
Video Capture Module
====================
Handles video input from webcam, RTSP streams, or video files.
Designed for easy extension from laptop webcam to CCTV systems.
"""

from .video_source import (
    VideoSource, 
    WebcamSource, 
    RTSPSource, 
    VideoFileSource,
    FrameMetadata,
    create_video_source
)
from .frame_buffer import FrameBuffer
from .multi_camera import MultiCameraManager, CameraConfig

__all__ = [
    "VideoSource",
    "WebcamSource", 
    "RTSPSource",
    "VideoFileSource",
    "FrameMetadata",
    "create_video_source",
    "FrameBuffer",
    "MultiCameraManager",
    "CameraConfig"
]
