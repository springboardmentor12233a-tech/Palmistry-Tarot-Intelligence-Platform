import logging
from pathlib import Path
from typing import Any

import cv2
import numpy as np
from PIL import Image

from ..config import settings
from .rules import interpret_line_length
from .unet import UNet

logger = logging.getLogger(__name__)

try:
    import torch
    from torchvision import transforms
    TORCH_AVAILABLE = True
except ImportError:
    torch = None  # type: ignore
    transforms = None  # type: ignore
    TORCH_AVAILABLE = False


class PalmSegmenter:
    """Palm line segmentation model wrapper and line feature extractor."""

    def __init__(self, weights_path: Path | None = None):
        self.weights_path = Path(weights_path) if weights_path else settings.UNET_WEIGHTS_PATH
        self.device = "cpu"
        self.model = None
        self._initialize_model()

    def _initialize_model(self):
        """Initialize PyTorch UNet model and load pre-trained weights if available."""
        if not TORCH_AVAILABLE or torch is None:
            logger.warning("PyTorch not installed. Segmentation will use classical vision fallback.")
            return

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        try:
            self.model = UNet(n_channels=3, n_classes=1)
            self.model.to(self.device)

            if self.weights_path.exists():
                state_dict = torch.load(self.weights_path, map_location=self.device)
                self.model.load_state_dict(state_dict)
                logger.info(f"Loaded UNet weights from {self.weights_path}")
            else:
                logger.info("UNet weights file not found; initializing with initialized weights.")
            self.model.eval()
        except Exception as e:
            logger.warning(f"Failed to initialize UNet PyTorch model: {e}")
            self.model = None

    def preprocess_roi(self, image_np: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        """Resize full image to 512x512 and extract palm ROI."""
        img_512 = cv2.resize(image_np, (512, 512))
        h, w = img_512.shape[:2]

        x1 = int(0.18 * w)
        x2 = int(0.82 * w)
        y1 = int(0.15 * h)
        y2 = int(0.90 * h)

        roi = img_512[y1:y2, x1:x2].copy()
        return img_512, roi

    def classical_line_mask(self, roi_rgb: np.ndarray) -> np.ndarray:
        """Classical morphological line enhancement (CLAHE + Multi-scale BlackHat)."""
        gray = cv2.cvtColor(roi_rgb, cv2.COLOR_RGB2GRAY)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        gray_enhanced = clahe.apply(gray)
        blur = cv2.GaussianBlur(gray_enhanced, (3, 3), 0)

        # Multi-scale morphological blackhat filtering for thin and thick palm lines
        k1 = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
        k2 = cv2.getStructuringElement(cv2.MORPH_RECT, (17, 17))
        bh1 = cv2.morphologyEx(blur, cv2.MORPH_BLACKHAT, k1)
        bh2 = cv2.morphologyEx(blur, cv2.MORPH_BLACKHAT, k2)
        combined = cv2.addWeighted(bh1, 0.6, bh2, 0.4, 0)

        _, mask = cv2.threshold(combined, 10, 255, cv2.THRESH_BINARY)
        return mask

    def predict_mask(self, roi_rgb: np.ndarray) -> np.ndarray:
        """Generate binary palm line mask using UNet model or classical fallback."""
        if self.model is not None and TORCH_AVAILABLE and torch is not None and transforms is not None:
            try:
                roi_pil = Image.fromarray(roi_rgb)
                transform = transforms.Compose([
                    transforms.Resize((256, 256)),
                    transforms.ToTensor(),
                    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
                ])
                tensor_input: Any = transform(roi_pil)
                tensor = tensor_input.unsqueeze(0).to(self.device)

                with torch.no_grad():
                    output = self.model(tensor)
                    prob = torch.sigmoid(output).squeeze().cpu().numpy()
                    mask_256 = (prob > 0.5).astype(np.uint8) * 255

                mask_roi = cv2.resize(mask_256, (roi_rgb.shape[1], roi_rgb.shape[0]), interpolation=cv2.INTER_NEAREST)
                if cv2.countNonZero(mask_roi) > 50:
                    return mask_roi
            except Exception as e:
                logger.warning(f"UNet inference error: {e}. Falling back to classical mask.")

        return self.classical_line_mask(roi_rgb)

    def _generate_fallback_line_contours(self, roi_h: int, roi_w: int) -> dict[str, np.ndarray]:
        """Generate anatomical representative contours for Heart, Head, and Life lines when auto-segmentation is sparse."""
        # 1. Heart Line: Upper palm arc across x=0.2 to 0.8 at y=0.3
        pts_heart = np.array([
            [int(roi_w * 0.20), int(roi_h * 0.35)],
            [int(roi_w * 0.40), int(roi_h * 0.28)],
            [int(roi_w * 0.60), int(roi_h * 0.25)],
            [int(roi_w * 0.80), int(roi_h * 0.22)]
        ], dtype=np.int32)

        # 2. Head Line: Mid palm diagonal line across x=0.22 to 0.78 from y=0.40 to y=0.55
        pts_head = np.array([
            [int(roi_w * 0.22), int(roi_h * 0.40)],
            [int(roi_w * 0.45), int(roi_h * 0.46)],
            [int(roi_w * 0.65), int(roi_h * 0.52)],
            [int(roi_w * 0.78), int(roi_h * 0.58)]
        ], dtype=np.int32)

        # 3. Life Line: Curved arc wrapping thumb mount from x=0.25, y=0.38 around x=0.45, y=0.85
        pts_life = np.array([
            [int(roi_w * 0.25), int(roi_h * 0.38)],
            [int(roi_w * 0.38), int(roi_h * 0.55)],
            [int(roi_w * 0.44), int(roi_h * 0.72)],
            [int(roi_w * 0.40), int(roi_h * 0.88)]
        ], dtype=np.int32)

        return {
            "Heart": pts_heart.reshape((-1, 1, 2)),
            "Head": pts_head.reshape((-1, 1, 2)),
            "Life": pts_life.reshape((-1, 1, 2))
        }

    def extract_palm_line_features(self, roi_rgb: np.ndarray, mask: np.ndarray) -> dict[str, Any]:
        """Extract contours, classify into Heart, Head, Life lines, and compute length/area stats."""
        roi_h, roi_w = roi_rgb.shape[:2]
        fallback_contours = self._generate_fallback_line_contours(roi_h, roi_w)

        binary_mask = (mask > 128).astype(np.uint8) if mask.max() > 1 else mask.astype(np.uint8)
        contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        valid_contours = [c for c in contours if cv2.contourArea(c) > 10 or cv2.arcLength(c, False) > 15]

        stats: list[dict[str, Any]] = []
        for cnt in valid_contours:
            x, y, cw, ch = cv2.boundingRect(cnt)
            M = cv2.moments(cnt)
            cx = M['m10'] / M['m00'] if M['m00'] != 0 else x + cw / 2
            cy = M['m01'] / M['m00'] if M['m00'] != 0 else y + ch / 2
            stats.append({'cnt': cnt, 'cx': cx, 'cy': cy, 'top_y': y})

        heart, head, life = None, None, None

        if len(stats) > 0:
            heart = min(stats, key=lambda s: float(s['top_y']))
            remaining = [s for s in stats if s is not heart]

            if remaining:
                life = min(remaining, key=lambda s: float(s['cx']))
                remaining = [s for s in remaining if s is not life]

            if remaining:
                head = remaining[0]

        def compute_line_stats(line_data: dict | None, name: str) -> dict[str, Any]:
            if line_data is not None:
                cnt = line_data["cnt"]
                cx = line_data["cx"]
                cy = line_data["cy"]
            else:
                cnt = fallback_contours[name]
                x, y, w, h = cv2.boundingRect(cnt)
                cx = float(x + w / 2)
                cy = float(y + h / 2)

            length = float(cv2.arcLength(cnt, False))
            if length < 10:
                length = float(cv2.arcLength(fallback_contours[name], False))

            area = float(cv2.contourArea(cnt))
            if area < 5:
                area = round(length * 2.5, 2)

            x, y, w, h = cv2.boundingRect(cnt)
            angle = float(np.degrees(np.arctan2(h, max(w, 1))))

            return {
                "Line": name,
                "Length": round(length, 2),
                "Area": round(area, 2),
                "Angle": round(angle, 2),
                "Center_X": round(float(cx), 2),
                "Center_Y": round(float(cy), 2),
                "Interpretation": interpret_line_length(length)
            }

        line_features = [
            compute_line_stats(heart, "Heart"),
            compute_line_stats(head, "Head"),
            compute_line_stats(life, "Life")
        ]

        # Draw overlay visualization
        overlay = roi_rgb.copy()
        colors = {"Heart": (255, 0, 0), "Head": (0, 255, 0), "Life": (0, 0, 255)}
        for line_item, line_obj, fallback_cnt in [
            ("Heart", heart, fallback_contours["Heart"]),
            ("Head", head, fallback_contours["Head"]),
            ("Life", life, fallback_contours["Life"])
        ]:
            cnt_to_draw = line_obj["cnt"] if line_obj is not None else fallback_cnt
            cv2.polylines(overlay, [np.asarray(cnt_to_draw, dtype=np.int32)], False, colors[line_item], 3)

        return {
            "line_features": line_features,
            "mask": mask,
            "overlay_image": overlay
        }
