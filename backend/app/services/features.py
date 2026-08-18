"""
Numeric feature extraction from detected palm lines. Ported from the
notebook (Cell 7).
"""
import numpy as np
from scipy.interpolate import splprep, splev


def _length(points):
    total = 0.0
    for i in range(len(points) - 1):
        p1, p2 = np.array(points[i]), np.array(points[i + 1])
        total += np.linalg.norm(p2 - p1)
    return float(total)


def _straight_distance(points):
    p1, p2 = np.array(points[0]), np.array(points[-1])
    return float(np.linalg.norm(p2 - p1))


def _curvature(points):
    if len(points) < 10:
        return 0.0
    pts = np.array(points)
    try:
        tck, u = splprep([pts[:, 1], pts[:, 0]], s=5)
        dx, dy = splev(u, tck, der=1)
        ddx, ddy = splev(u, tck, der=2)
        k = np.abs(dx * ddy - dy * ddx)
        k /= np.power(dx * dx + dy * dy + 1e-6, 1.5)
        return float(np.mean(k))
    except Exception:
        return 0.0


def _orientation(points):
    p1, p2 = points[0], points[-1]
    angle = np.degrees(np.arctan2(p2[0] - p1[0], p2[1] - p1[1]))
    return float(angle)


def extract_features(lines: dict) -> dict:
    features = {}
    for name, line in lines.items():
        if line is None:
            features[name] = None
            continue
        pts = line["pixels"]
        length = _length(pts)
        distance = _straight_distance(pts)
        curve = _curvature(pts)
        angle = _orientation(pts)
        tortuosity = length / (distance + 1e-6)
        features[name] = {
            "Length": round(length, 2),
            "Straight": round(distance, 2),
            "Curvature": round(curve, 4),
            "Orientation": round(angle, 2),
            "Tortuosity": round(tortuosity, 3),
        }
    return features
