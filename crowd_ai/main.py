#!/usr/bin/env python3
"""
Crowd Density Estimation System - Main Entry Point
===================================================
Real-time crowd counting and density estimation using CSRNet.

Usage:
    # Basic webcam demo
    python -m crowd_ai.main
    
    # With custom settings
    python -m crowd_ai.main --source 0 --area 100 --scale 0.5
    
    # RTSP camera
    python -m crowd_ai.main --source "rtsp://192.168.1.100/stream"
    
    # Video file
    python -m crowd_ai.main --source "test_video.mp4"

Key Features:
- CSRNet-based density estimation (PyTorch)
- Support for webcam, RTSP, and video files
- Real-time heatmap visualization
- Density classification (LOW/MEDIUM/HIGH/CRITICAL)
- Area-calibrated density per square meter

Requirements:
- PyTorch (CPU or CUDA)
- OpenCV
- NumPy

All components are free and open-source.
"""

import argparse
import sys
import time
from pathlib import Path

import cv2
import numpy as np


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Crowd Density Estimation System using CSRNet",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m crowd_ai.main                           # Webcam (default)
  python -m crowd_ai.main --source 1                # Second webcam
  python -m crowd_ai.main --source video.mp4        # Video file
  python -m crowd_ai.main --source rtsp://...       # RTSP stream
  python -m crowd_ai.main --preset temple_entrance  # Use preset calibration
        """
    )
    
    # Video source
    parser.add_argument(
        "--source", "-s",
        default="0",
        help="Video source: device ID (0,1,...), RTSP URL, or video file path"
    )
    
    # Area calibration
    parser.add_argument(
        "--area", "-a",
        type=float,
        default=100.0,
        help="Area covered by camera in square meters (default: 100)"
    )
    
    parser.add_argument(
        "--preset", "-p",
        default=None,
        choices=[
            "laptop_webcam_desk", "laptop_webcam_room",
            "ceiling_camera_5m", "cctv_wide_angle",
            "temple_entrance", "temple_main_hall"
        ],
        help="Use preset calibration instead of manual area"
    )
    
    # Model settings
    parser.add_argument(
        "--weights", "-w",
        default=None,
        help="Path to CSRNet weights file (optional)"
    )
    
    parser.add_argument(
        "--lite",
        action="store_true",
        help="Use lightweight CSRNet model for faster inference"
    )
    
    parser.add_argument(
        "--scale", 
        type=float,
        default=0.5,
        help="Input scale factor (default: 0.5 = half resolution)"
    )
    
    # Output options
    parser.add_argument(
        "--no-display",
        action="store_true",
        help="Disable GUI display (for headless systems)"
    )
    
    parser.add_argument(
        "--output", "-o",
        default=None,
        help="Save output to video file"
    )
    
    parser.add_argument(
        "--dashboard",
        action="store_true",
        help="Show full dashboard view with statistics"
    )
    
    # Debug options
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug output"
    )
    
    return parser.parse_args()


def run_demo(args):
    """
    Run the crowd density estimation demo.
    
    This is the main demo function that:
    1. Opens the video source (webcam/RTSP/file)
    2. Loads the CSRNet model
    3. Processes frames in real-time
    4. Displays heatmap visualization
    """
    # Import modules (import here for faster --help)
    from .capture import WebcamSource, RTSPSource, VideoFileSource, create_video_source
    from .models import load_csrnet_model, create_mock_model
    from .inference import CrowdDensityEngine, EngineConfig, DensityAnalyzer
    from .visualization import DensityVisualizer, create_dashboard_frame
    from .calibration import get_preset_calibration, CameraCalibration
    
    print("=" * 60)
    print("Crowd Density Estimation System (CSRNet)")
    print("=" * 60)
    print("100% Free and Open Source - No Paid APIs")
    print("=" * 60)
    
    # Setup calibration
    if args.preset:
        print(f"\nUsing preset calibration: {args.preset}")
        # We'll set frame dimensions after opening source
        area_sqm = None  # Will use preset
        preset = args.preset
    else:
        print(f"\nUsing manual area: {args.area} sqm")
        area_sqm = args.area
        preset = None
    
    # Create video source
    print(f"\nOpening video source: {args.source}")
    source = create_video_source(args.source)
    
    if not source.open():
        print("ERROR: Failed to open video source!")
        print("Make sure your webcam is connected and not in use by another application.")
        return 1
    
    # Get frame dimensions
    frame_w, frame_h = source.resolution
    print(f"Frame size: {frame_w}x{frame_h}")
    
    # Setup calibration with frame dimensions
    if preset:
        calibration = get_preset_calibration(preset, frame_w, frame_h)
        area_sqm = calibration.total_area_sqm
        print(f"Preset area: {area_sqm:.1f} sqm")
    
    # Create inference engine
    print("\nInitializing inference engine...")
    config = EngineConfig(
        model_type="lite" if args.lite else "standard",
        weights_path=args.weights,
        scale_factor=args.scale,
        area_sqm=area_sqm,
        use_cuda=True,  # Will fall back to CPU if not available
    )
    
    try:
        engine = CrowdDensityEngine(config)
    except Exception as e:
        print(f"Warning: Could not load full model: {e}")
        print("Using mock model for demo (results will not be accurate)")
        engine = None  # Will use simple demo mode
    
    # Create visualizer
    visualizer = DensityVisualizer(
        colormap="turbo",
        alpha=0.5,
        show_count=True,
        show_density_bar=True
    )
    
    # Create density analyzer
    analyzer = DensityAnalyzer(area_sqm=area_sqm)
    
    # Setup video writer if output specified
    video_writer = None
    if args.output:
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out_w = 800 if args.dashboard else frame_w
        out_h = 600 if args.dashboard else frame_h
        video_writer = cv2.VideoWriter(args.output, fourcc, 30.0, (out_w, out_h))
        print(f"Saving output to: {args.output}")
    
    # Warmup
    if engine:
        print("\nWarming up model...")
        engine.warmup(3)
    
    print("\n" + "=" * 60)
    print("Starting real-time processing...")
    print("Press 'q' to quit, 's' to save screenshot")
    print("=" * 60 + "\n")
    
    # Statistics tracking
    frame_count = 0
    start_time = time.time()
    fps_update_interval = 30
    display_fps = 0.0
    
    try:
        for frame, metadata in source.frames():
            frame_count += 1
            
            # Run inference
            if engine:
                result = engine.process(frame, area_sqm=area_sqm)
                crowd_count = result.crowd_count
                density_map = result.density_map
                density_level = result.density_level
                processing_ms = result.processing_time_ms
            else:
                # Demo mode without model - generate synthetic output
                crowd_count = np.random.randint(10, 100)
                h, w = frame.shape[:2]
                density_map = np.random.rand(h // 8, w // 8).astype(np.float32) * 0.1
                density_level = "DEMO"
                processing_ms = 0.0
            
            # Update FPS counter
            if frame_count % fps_update_interval == 0:
                elapsed = time.time() - start_time
                display_fps = frame_count / elapsed
            
            # Generate visualization
            if args.dashboard:
                # Full dashboard view
                stats = analyzer.analyze(density_map, crowd_count) if engine else None
                display = create_dashboard_frame(
                    frame, density_map,
                    stats=stats,
                    count=crowd_count,
                    density_level=density_level,
                    fps=display_fps
                )
            else:
                # Simple heatmap overlay
                display = visualizer.visualize(
                    frame, density_map,
                    count=crowd_count,
                    density_level=density_level
                )
                
                # Add FPS counter
                cv2.putText(
                    display, f"FPS: {display_fps:.1f}",
                    (display.shape[1] - 100, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2
                )
            
            # Save to video if specified
            if video_writer:
                video_writer.write(display)
            
            # Display
            if not args.no_display:
                cv2.imshow("Crowd Density Estimation", display)
                
                key = cv2.waitKey(1) & 0xFF
                
                if key == ord('q'):
                    print("\nQuitting...")
                    break
                elif key == ord('s'):
                    screenshot_path = f"screenshot_{int(time.time())}.png"
                    cv2.imwrite(screenshot_path, display)
                    print(f"Screenshot saved: {screenshot_path}")
            
            # Print periodic status to console (every 30 frames)
            if frame_count % 30 == 0:
                print(f"[Frame {frame_count}] Count: {crowd_count:.0f} | "
                      f"Level: {density_level} | "
                      f"Density: {crowd_count/area_sqm:.2f} p/sqm | "
                      f"FPS: {display_fps:.1f}")
    
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    
    finally:
        # Cleanup
        source.close()
        if video_writer:
            video_writer.release()
        if not args.no_display:
            cv2.destroyAllWindows()
        
        # Print summary
        elapsed = time.time() - start_time
        print("\n" + "=" * 60)
        print("Session Summary")
        print("=" * 60)
        print(f"Total frames processed: {frame_count}")
        print(f"Total time: {elapsed:.1f} seconds")
        print(f"Average FPS: {frame_count / elapsed:.1f}")
        
        if engine:
            stats = engine.get_performance_stats()
            print(f"Average inference time: {stats['average_inference_ms']:.1f} ms")
            print(f"Device: {stats['device']}")
    
    return 0


def main():
    """Main entry point."""
    args = parse_args()
    
    if args.debug:
        print(f"Arguments: {args}")
    
    return run_demo(args)


if __name__ == "__main__":
    sys.exit(main())
