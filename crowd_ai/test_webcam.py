#!/usr/bin/env python3
"""
Quick Test Script
=================
Test the crowd density estimation system with your webcam.

This script provides a quick way to verify the installation
and see the system in action.

Usage:
    python test_webcam.py
"""

import sys
import time

import cv2
import numpy as np


def test_opencv():
    """Test OpenCV and webcam access."""
    print("Testing OpenCV and webcam...")
    
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    
    if not cap.isOpened():
        print("ERROR: Could not open webcam!")
        print("Make sure your webcam is connected and not in use.")
        return False
    
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        print("ERROR: Could not read frame from webcam!")
        return False
    
    print(f"SUCCESS: Webcam working! Frame size: {frame.shape}")
    return True


def test_pytorch():
    """Test PyTorch installation."""
    print("\nTesting PyTorch...")
    
    try:
        import torch
        print(f"PyTorch version: {torch.__version__}")
        print(f"CUDA available: {torch.cuda.is_available()}")
        
        if torch.cuda.is_available():
            print(f"CUDA device: {torch.cuda.get_device_name(0)}")
        
        # Test tensor creation
        x = torch.rand(3, 3)
        print(f"Test tensor created: {x.shape}")
        
        return True
        
    except ImportError as e:
        print(f"ERROR: PyTorch not installed: {e}")
        print("Install with: pip install torch torchvision")
        return False


def test_csrnet_model():
    """Test CSRNet model creation."""
    print("\nTesting CSRNet model...")
    
    try:
        from crowd_ai.models import CSRNet, get_model_info
        
        # Create model (will download VGG weights)
        print("Creating CSRNet model (this may take a moment for VGG download)...")
        model = CSRNet(load_pretrained_vgg=True)
        
        info = get_model_info(model)
        print(f"Model created successfully!")
        print(f"  Parameters: {info['total_parameters']:,}")
        print(f"  Size: {info['total_params_mb']:.1f} MB")
        
        # Test forward pass
        import torch
        dummy_input = torch.rand(1, 3, 480, 640)
        output = model(dummy_input)
        print(f"  Input shape: {list(dummy_input.shape)}")
        print(f"  Output shape: {list(output.shape)}")
        
        return True
        
    except Exception as e:
        print(f"ERROR: CSRNet test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_preprocessing():
    """Test preprocessing pipeline."""
    print("\nTesting preprocessing...")
    
    try:
        from crowd_ai.preprocessing import preprocess_frame
        import torch
        
        # Create dummy frame (like from OpenCV)
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        tensor, info = preprocess_frame(frame, scale_factor=0.5)
        
        print(f"Preprocessing successful!")
        print(f"  Input: {frame.shape}")
        print(f"  Output tensor: {list(tensor.shape)}")
        print(f"  Scale: {info['scale_h']:.2f}x")
        
        return True
        
    except Exception as e:
        print(f"ERROR: Preprocessing test failed: {e}")
        return False


def test_full_pipeline():
    """Test full inference pipeline with webcam."""
    print("\nTesting full pipeline...")
    print("(Press 'q' to quit)")
    
    try:
        from crowd_ai.inference import CrowdDensityEngine, EngineConfig
        from crowd_ai.visualization import DensityVisualizer
        
        # Create engine with conservative settings
        config = EngineConfig(
            scale_factor=0.5,
            area_sqm=10.0,  # Assume small area for webcam
            enable_smoothing=True
        )
        
        print("Creating inference engine...")
        engine = CrowdDensityEngine(config)
        engine.warmup(2)
        
        # Create visualizer
        viz = DensityVisualizer(colormap="turbo", alpha=0.4)
        
        # Open webcam
        cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        if not cap.isOpened():
            print("ERROR: Could not open webcam!")
            return False
        
        print("Processing frames... (press 'q' to quit)")
        
        frame_count = 0
        start_time = time.time()
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process frame
            result = engine.process(frame)
            frame_count += 1
            
            # Visualize
            display = viz.visualize(
                frame,
                result.density_map,
                count=result.crowd_count,
                density_level=result.density_level
            )
            
            # Add FPS
            elapsed = time.time() - start_time
            fps = frame_count / elapsed if elapsed > 0 else 0
            cv2.putText(
                display, f"FPS: {fps:.1f}", 
                (display.shape[1] - 120, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2
            )
            
            cv2.imshow("Crowd Density Test", display)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            
            # Print periodic status
            if frame_count % 30 == 0:
                print(f"Frame {frame_count}: Count={result.crowd_count:.0f}, "
                      f"Level={result.density_level}, FPS={fps:.1f}")
        
        cap.release()
        cv2.destroyAllWindows()
        
        print(f"\nProcessed {frame_count} frames")
        print(f"Average FPS: {frame_count / (time.time() - start_time):.1f}")
        
        return True
        
    except Exception as e:
        print(f"ERROR: Full pipeline test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("Crowd Density Estimation System - Test Suite")
    print("=" * 60)
    
    tests = [
        ("OpenCV/Webcam", test_opencv),
        ("PyTorch", test_pytorch),
        ("CSRNet Model", test_csrnet_model),
        ("Preprocessing", test_preprocessing),
    ]
    
    results = []
    for name, test_func in tests:
        print(f"\n{'='*40}")
        passed = test_func()
        results.append((name, passed))
        
        if not passed:
            print(f"\n{name} test FAILED - stopping here")
            break
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    all_passed = True
    for name, passed in results:
        status = "PASS" if passed else "FAIL"
        print(f"  {name}: {status}")
        if not passed:
            all_passed = False
    
    if all_passed:
        print("\nAll component tests passed!")
        
        # Offer full pipeline test
        response = input("\nRun full pipeline test with webcam? (y/n): ").strip().lower()
        if response == 'y':
            test_full_pipeline()
    else:
        print("\nSome tests failed. Please fix issues before proceeding.")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
