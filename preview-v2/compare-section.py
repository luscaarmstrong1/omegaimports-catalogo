import os
import sys
import numpy as np
from PIL import Image

def compute_ssim(img1, img2):
    # Convert to grayscale luminance
    gray1 = np.array(img1.convert('L'), dtype=np.float64)
    gray2 = np.array(img2.convert('L'), dtype=np.float64)
    
    C1 = (0.01 * 255) ** 2
    C2 = (0.03 * 255) ** 2
    
    mu1 = gray1.mean()
    mu2 = gray2.mean()
    sigma1_sq = gray1.var()
    sigma2_sq = gray2.var()
    sigma12 = ((gray1 - mu1) * (gray2 - mu2)).mean()
    
    ssim = ((2 * mu1 * mu2 + C1) * (2 * sigma12 + C2)) / ((mu1**2 + mu2**2 + C1) * (sigma1_sq + sigma2_sq + C2))
    return float(ssim)

def compare_section(section_name):
    base_dir = os.path.join('preview-v2', '_visual-tests', section_name)
    ref_path = os.path.join(base_dir, 'reference.png')
    cur_path = os.path.join(base_dir, 'current.png')
    
    if not os.path.exists(ref_path) or not os.path.exists(cur_path):
        print(f"Error: Missing files for section {section_name}")
        return
        
    ref_img = Image.open(ref_path).convert('RGBA')
    cur_img = Image.open(cur_path).convert('RGBA')
    
    # Normalize dimensions if slight mismatch
    if ref_img.size != cur_img.size:
        cur_img = cur_img.resize(ref_img.size, Image.Resampling.LANCZOS)
        
    ref_arr = np.array(ref_img, dtype=np.float32)
    cur_arr = np.array(cur_img, dtype=np.float32)
    
    # 1. Overlay 50/50
    overlay_arr = (ref_arr * 0.5 + cur_arr * 0.5).astype(np.uint8)
    overlay_img = Image.fromarray(overlay_arr, mode='RGBA')
    overlay_path = os.path.join(base_dir, 'overlay.png')
    overlay_img.save(overlay_path)
    
    # 2. Diff Image (amplified for visibility)
    diff_raw = np.abs(ref_arr[:, :, :3] - cur_arr[:, :, :3])
    diff_mag = diff_raw.mean(axis=2)
    
    # Red-tinted diff map
    diff_vis = np.zeros_like(ref_arr, dtype=np.uint8)
    diff_vis[:, :, 0] = np.clip(diff_mag * 3, 0, 255).astype(np.uint8) # Red channel amplified
    diff_vis[:, :, 1] = (diff_mag * 0.5).astype(np.uint8)
    diff_vis[:, :, 2] = (diff_mag * 0.5).astype(np.uint8)
    diff_vis[:, :, 3] = 255
    
    diff_img = Image.fromarray(diff_vis, mode='RGBA')
    diff_path = os.path.join(base_dir, 'diff.png')
    diff_img.save(diff_path)
    
    # 3. Metrics
    mae = float(diff_raw.mean())
    ssim = compute_ssim(ref_img, cur_img)
    print(f"[{section_name.upper()}] SSIM: {ssim:.4f} | MAE: {mae:.2f}px | Overlay & Diff saved to {base_dir}")

if __name__ == '__main__':
    section = sys.argv[1] if len(sys.argv) > 1 else 'hero'
    compare_section(section)
