# Crowd Density Estimation System

## 🎯 Overview

A **100% free and open-source** crowd counting and density estimation system designed for temple festival crowd management. Uses **CSRNet (PyTorch)** for accurate crowd density estimation from webcam or CCTV feeds.

**No paid APIs or cloud services required.**

## ✨ Features

- **CSRNet-based density estimation** - State-of-the-art crowd counting model
- **Multiple video sources** - Webcam, RTSP/CCTV, or video files
- **Real-time processing** - Near real-time inference on modern hardware
- **Density heatmap visualization** - Visual representation of crowd distribution
- **Density classification** - LOW, MEDIUM, HIGH, CRITICAL levels
- **Area calibration** - Convert pixel counts to people per square meter
- **Zone-based analysis** - Analyze density by grid zones
- **Safety alerts** - Automatic warnings for dangerous density levels

## 📁 Project Structure

```
crowd_ai/
├── __init__.py              # Package initialization
├── main.py                  # Main entry point
├── requirements.txt         # Dependencies
├── README.md                # This file
│
├── models/                  # CSRNet model implementation
│   ├── __init__.py
│   ├── csrnet.py            # CSRNet architecture (PyTorch)
│   └── model_loader.py      # Model loading utilities
│
├── capture/                 # Video capture module
│   ├── __init__.py
│   ├── video_source.py      # Webcam, RTSP, file sources
│   ├── frame_buffer.py      # Thread-safe frame buffering
│   └── multi_camera.py      # Multi-camera management
│
├── preprocessing/           # Image preprocessing
│   ├── __init__.py
│   └── transforms.py        # Frame preprocessing for CSRNet
│
├── inference/               # Inference engine
│   ├── __init__.py
│   ├── engine.py            # Main inference engine
│   └── density_analyzer.py  # Advanced density analysis
│
├── visualization/           # Visualization tools
│   ├── __init__.py
│   ├── heatmap.py           # Heatmap generation
│   └── dashboard.py         # Dashboard visualization
│
├── calibration/             # Camera calibration
│   ├── __init__.py
│   └── camera_calibration.py # Area calibration utilities
│
└── weights/                 # Model weights directory (created on download)
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd Temple/crowd_ai

# Install PyTorch (choose based on your system)
# CPU only:
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Or with CUDA (for GPU acceleration):
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# Install other dependencies
pip install opencv-python numpy Pillow
```

### 2. Run the Demo

```bash
# Basic webcam demo
python -m crowd_ai.main

# With custom area (100 square meters)
python -m crowd_ai.main --area 100

# Use a preset calibration
python -m crowd_ai.main --preset temple_entrance

# Process a video file
python -m crowd_ai.main --source "crowd_video.mp4"
```

### 3. Controls

- **q** - Quit
- **s** - Save screenshot

## 📝 Usage Examples

### Basic Python API

```python
from crowd_ai.capture import WebcamSource
from crowd_ai.inference import CrowdDensityEngine, EngineConfig
from crowd_ai.visualization import DensityVisualizer

# Create inference engine
config = EngineConfig(
    scale_factor=0.5,
    area_sqm=100.0   # Area covered by camera
)
engine = CrowdDensityEngine(config)

# Create visualizer
viz = DensityVisualizer(colormap="turbo", alpha=0.5)

# Process webcam
with WebcamSource() as source:
    for frame, metadata in source.frames():
        # Run inference
        result = engine.process(frame)
        
        print(f"Count: {result.crowd_count:.0f}")
        print(f"Density: {result.density_per_sqm:.2f} people/sqm")
        print(f"Level: {result.density_level}")
        
        # Visualize
        display = viz.visualize(
            frame, 
            result.density_map,
            count=result.crowd_count,
            density_level=result.density_level
        )
        
        cv2.imshow("Density", display)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
```

### RTSP Camera (for CCTV)

```python
from crowd_ai.capture import RTSPSource

# Connect to IP camera
with RTSPSource("rtsp://admin:password@192.168.1.100:554/stream") as source:
    for frame, metadata in source.frames():
        result = engine.process(frame)
        print(f"Area: {metadata.source_id}, Count: {result.crowd_count:.0f}")
```

### Multi-Camera Setup

```python
from crowd_ai.capture import MultiCameraManager, CameraConfig

# Define cameras
cameras = [
    CameraConfig("0", "cam_gate", "Main Gate", area_sqm=50),
    CameraConfig("rtsp://...", "cam_hall", "Main Hall", area_sqm=200),
]

# Process multiple cameras
with MultiCameraManager(cameras) as manager:
    while True:
        frames = manager.get_latest_frames()
        for cam_id, (frame, meta) in frames.items():
            config = manager.get_area_config(cam_id)
            result = engine.process(frame, area_sqm=config.area_sqm)
            print(f"{config.area_name}: {result.crowd_count:.0f} people")
```

### Area Calibration

#### Method 1: Direct Area Specification

```python
# If you know the area covered by your camera
area_sqm = 100  # 100 square meters
result = engine.process(frame, area_sqm=area_sqm)
```

#### Method 2: Reference Distance Calibration

```python
from crowd_ai.calibration import calibrate_from_reference

# If a known 1-meter object is 150 pixels wide in your frame
calibration = calibrate_from_reference(
    frame_width=1920,
    frame_height=1080,
    reference_distance_pixels=150,
    reference_distance_meters=1.0
)
print(f"Estimated area: {calibration.total_area_sqm:.1f} sqm")
```

#### Method 3: Camera Height Estimation

```python
from crowd_ai.calibration import estimate_area_from_height

# Camera mounted at 5m height, tilted 60 degrees down
calibration = estimate_area_from_height(
    frame_width=1920,
    frame_height=1080,
    camera_height_m=5.0,
    camera_tilt_deg=60,
    horizontal_fov_deg=70
)
print(f"Estimated area: {calibration.total_area_sqm:.1f} sqm")
```

#### Method 4: Use Presets

```python
from crowd_ai.calibration import get_preset_calibration

# For temple entrance area
calibration = get_preset_calibration("temple_entrance")
print(f"Preset area: {calibration.total_area_sqm} sqm")
```

## 🔧 Configuration Options

### Engine Configuration

```python
from crowd_ai.inference import EngineConfig

config = EngineConfig(
    # Model settings
    model_type="standard",      # "standard" or "lite" (faster)
    weights_path=None,          # Path to pretrained weights
    
    # Preprocessing
    scale_factor=0.5,           # Resize factor (0.5 = half size)
    
    # Area calibration
    area_sqm=100.0,             # Area in square meters
    
    # Density thresholds (people/sqm)
    density_thresholds={
        "LOW": 0.5,
        "MEDIUM": 1.5,
        "HIGH": 3.0,
        "CRITICAL": 5.0
    },
    
    # Performance
    use_cuda=True,              # Use GPU if available
    use_half_precision=False,   # FP16 for faster GPU inference
    
    # Smoothing
    enable_smoothing=True,      # Temporal smoothing
    smoothing_window=5          # Frames to average
)
```

### Density Levels

| Level | Density (people/sqm) | Description |
|-------|---------------------|-------------|
| FREE_FLOW | < 0.3 | Open space, unrestricted movement |
| LOW | 0.3 - 0.5 | Comfortable walking |
| MEDIUM | 0.5 - 1.5 | Normal crowd |
| HIGH | 1.5 - 3.0 | Dense crowd, limited movement |
| CRITICAL | > 3.0 | Safety concern, risk of crowd crush |

## 🎨 Visualization Options

### Colormap Options

- `jet` - Blue (low) → Red (high)  
- `hot` - Black → Red → Yellow → White
- `inferno` - Dark purple → Orange → Yellow
- `turbo` - Perceptually uniform (recommended)
- `plasma` - Purple → Yellow

```python
from crowd_ai.visualization import DensityVisualizer

viz = DensityVisualizer(
    colormap="turbo",
    alpha=0.5,            # Overlay opacity
    show_count=True,      # Show count overlay
    show_density_bar=True # Show color legend
)
```

## 📊 Output Data

### InferenceResult

```python
result = engine.process(frame)

result.crowd_count        # Estimated number of people
result.density_map        # Raw density map (numpy array)
result.density_per_sqm    # Average density
result.density_level      # Classification string
result.processing_time_ms # Inference time
result.timestamp          # Unix timestamp

# Convert to JSON
data = result.to_dict()
```

### DensityStats (Advanced Analysis)

```python
from crowd_ai.inference import DensityAnalyzer

analyzer = DensityAnalyzer(area_sqm=100)
stats = analyzer.analyze(result.density_map, result.crowd_count)

stats.total_count          # Total people count
stats.density_per_sqm      # Density
stats.level                # DensityLevel enum
stats.hotspot_count        # Number of high-density regions
stats.hotspot_percentage   # Percentage of area that's high density
stats.critical_area_percentage  # Area in critical state
```

## ⚡ Performance Tips

1. **Use GPU acceleration** - 5-10x faster with CUDA
2. **Reduce scale factor** - `scale_factor=0.5` for 2x speedup
3. **Use lite model** - `--lite` flag for faster inference
4. **Skip frames** - Process every 2nd or 3rd frame for higher effective FPS
5. **Use FP16** - Enable `use_half_precision=True` on compatible GPUs

### Typical Performance

| Configuration | Device | FPS |
|--------------|--------|-----|
| Standard, 0.5 scale | GTX 1650 | ~15-20 |
| Lite, 0.5 scale | GTX 1650 | ~25-30 |
| Standard, 0.5 scale | CPU (i7) | ~2-5 |
| Lite, 0.5 scale | CPU (i7) | ~5-8 |

## 🔌 Extending for CCTV

The system is designed to easily scale from laptop webcam to CCTV:

```python
# Current: Laptop webcam
source = WebcamSource(device_id=0)

# Future: RTSP CCTV
source = RTSPSource("rtsp://192.168.1.100:554/stream")

# The rest of the code remains the same!
```

## 📄 License

This project uses only free and open-source components:

- **CSRNet** - MIT License
- **PyTorch** - BSD License
- **OpenCV** - Apache 2.0 License
- **NumPy** - BSD License

No paid APIs, no cloud services, no usage limits.

## 🙏 Acknowledgments

- CSRNet paper: "CSRNet: Dilated Convolutional Neural Networks for Understanding the Highly Congested Scenes" (CVPR 2018)
- ShanghaiTech crowd counting dataset
- PyTorch team
- OpenCV community
