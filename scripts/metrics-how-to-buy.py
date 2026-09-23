import json
from pathlib import Path

import numpy as np
from PIL import Image
from skimage.metrics import structural_similarity as structural_similarity


ROOT = Path("reports/final-parity/como-comprar")


def metrics(left_name, right_name):
    left = np.asarray(Image.open(ROOT / left_name).convert("RGB"), dtype=np.int16)
    right = np.asarray(Image.open(ROOT / right_name).convert("RGB"), dtype=np.int16)
    if left.shape != right.shape:
        raise ValueError(f"Dimension mismatch for {left_name} and {right_name}: {left.shape} != {right.shape}")
    difference = np.abs(left - right)
    changed = np.any(difference > 10, axis=-1)
    left_gray = np.asarray(Image.fromarray(left.astype(np.uint8)).convert("L"))
    right_gray = np.asarray(Image.fromarray(right.astype(np.uint8)).convert("L"))
    return {
        "width": int(left.shape[1]),
        "height": int(left.shape[0]),
        "pixelDifferencePercent": round(float(changed.mean() * 100), 4),
        "MAE": round(float(difference.mean()), 4),
        "SSIM": round(float(structural_similarity(left_gray, right_gray)), 4),
    }


result = {
    "content": metrics("content-reference.png", "content-current.png"),
    "header": metrics("header-home.png", "header-current.png"),
    "footer": metrics("footer-home.png", "footer-current.png"),
}

(ROOT / "metrics.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
print(json.dumps(result, indent=2))
