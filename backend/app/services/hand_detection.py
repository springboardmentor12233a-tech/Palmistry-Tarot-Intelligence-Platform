"""
Hand landmark detection + palm alignment + ROI extraction.

Ported from the original Colab notebook (Cell 3): MediaPipe HandLandmarker
detects 21 hand landmarks, the hand is rotated so the palm is upright, and a
square palm region-of-interest is cropped around the densest part of the palm
mask (found via a distance transform).
"""
import os
import urllib.request

import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

from app.config import MODELS_DIR

MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/"
    "hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
)
MODEL_PATH = os.path.join(MODELS_DIR, "hand_landmarker.task")

CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 4),
    (0, 5), (5, 6), (6, 7), (7, 8),
    (5, 9), (9, 10), (10, 11), (11, 12),
    (9, 13), (13, 14), (14, 15), (15, 16),
    (13, 17), (17, 18), (18, 19), (19, 20),
    (0, 17),
]

_detector = None


def _ensure_model():
    if not os.path.exists(MODEL_PATH):
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)


def get_detector():
    global _detector
    if _detector is None:
        _ensure_model()
        base_options = mp_python.BaseOptions(model_asset_path=MODEL_PATH)
        options = mp_vision.HandLandmarkerOptions(
            base_options=base_options,
            num_hands=1,
            min_hand_detection_confidence=0.5,
            min_hand_presence_confidence=0.5,
            min_tracking_confidence=0.5,
        )
        _detector = mp_vision.HandLandmarker.create_from_options(options)
    return _detector


class HandNotFoundError(Exception):
    pass


def detect_and_extract_roi(image_path: str) -> dict:
    """
    Given a path to an uploaded hand photo, returns a dict with:
      original_rgb, rotated_rgb, palm_roi_rgb, palm_mask, hand_side, landmarks
    All images are numpy arrays in RGB.
    """
    bgr = cv2.imread(image_path)
    if bgr is None:
        raise ValueError("Could not read the uploaded image")

    original_rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    height, width = original_rgb.shape[:2]

    detector = get_detector()
    mp_image = mp.Image.create_from_file(image_path)
    result = detector.detect(mp_image)

    if not result.hand_landmarks:
        raise HandNotFoundError("No hand detected in this image. Try a clearer, well-lit palm photo.")

    hand = result.hand_landmarks[0]
    hand_side = result.handedness[0][0].category_name

    landmarks = np.array(
        [[int(lm.x * width), int(lm.y * height)] for lm in hand],
        dtype=np.int32,
    )

    # ---- Align: rotate so the palm faces upright ----
    wrist = landmarks[0]
    middle_mcp = landmarks[9]
    dx = middle_mcp[0] - wrist[0]
    dy = middle_mcp[1] - wrist[1]
    angle = np.degrees(np.arctan2(dy, dx))
    rotation_angle = angle - 90

    center = (width // 2, height // 2)
    rotation_matrix = cv2.getRotationMatrix2D(center, rotation_angle, 1.0)
    rotated_rgb = cv2.warpAffine(
        original_rgb, rotation_matrix, (width, height),
        flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE,
    )

    rotated_points = []
    for x, y in landmarks:
        rx = rotation_matrix[0, 0] * x + rotation_matrix[0, 1] * y + rotation_matrix[0, 2]
        ry = rotation_matrix[1, 0] * x + rotation_matrix[1, 1] * y + rotation_matrix[1, 2]
        rotated_points.append([int(rx), int(ry)])
    rotated_points = np.array(rotated_points, dtype=np.int32)

    wrist_r = rotated_points[0]
    thumb_cmc_r = rotated_points[1]
    index_mcp_r = rotated_points[5]
    middle_mcp_r = rotated_points[9]
    ring_mcp_r = rotated_points[13]
    little_mcp_r = rotated_points[17]

    # ---- Robust palm ROI extraction ----
    palm_points = np.array(
        [wrist_r, thumb_cmc_r, index_mcp_r, middle_mcp_r, ring_mcp_r, little_mcp_r],
        dtype=np.int32,
    )
    hull = cv2.convexHull(palm_points)

    mask = np.zeros((height, width), dtype=np.uint8)
    cv2.fillConvexPoly(mask, hull, 255)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (51, 51))
    mask = cv2.dilate(mask, kernel, iterations=1)

    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(mask)
    largest = np.zeros_like(mask)
    if num_labels > 1:
        idx = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        largest[labels == idx] = 255
    mask = largest

    dist = cv2.distanceTransform(mask, cv2.DIST_L2, 5)
    _, radius, _, center_pt = cv2.minMaxLoc(dist)
    cx, cy = center_pt
    radius = int(radius * 2.1)

    xmin, xmax = max(0, cx - radius), min(width, cx + radius)
    ymin, ymax = max(0, cy - radius), min(height, cy + radius)

    palm_roi = rotated_rgb[ymin:ymax, xmin:xmax].copy()
    if palm_roi.size == 0:
        raise ValueError("Palm ROI extraction failed - try a different photo")

    roi_mask = mask[ymin:ymax, xmin:xmax]
    palm_roi = cv2.bitwise_and(palm_roi, palm_roi, mask=roi_mask)

    gray = cv2.cvtColor(palm_roi, cv2.COLOR_RGB2GRAY)
    ys, xs = np.where(gray > 5)
    if len(xs):
        palm_roi = palm_roi[np.min(ys):np.max(ys), np.min(xs):np.max(xs)]

    palm_roi = cv2.resize(palm_roi, (700, 700), interpolation=cv2.INTER_CUBIC)

    landmark_img = original_rgb.copy()
    for s, e in CONNECTIONS:
        cv2.line(landmark_img, tuple(landmarks[s]), tuple(landmarks[e]), (0, 255, 0), 2)
    for p in landmarks:
        cv2.circle(landmark_img, tuple(p), 4, (255, 0, 0), -1)

    return {
        "original_rgb": original_rgb,
        "landmark_rgb": landmark_img,
        "rotated_rgb": rotated_rgb,
        "palm_roi_rgb": palm_roi,
        "palm_mask": mask,
        "hand_side": hand_side,
    }
