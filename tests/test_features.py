import math

import pytest

from palmtarot.features.landmarks import (
    LandmarkExtractor,
    calculate_distance,
    extract_landmark_features,
)


def test_calculate_distance_3d():
    p1 = {"x": 0.0, "y": 0.0, "z": 0.0}
    p2 = {"x": 3.0, "y": 4.0, "z": 0.0}
    assert math.isclose(calculate_distance(p1, p2), 5.0)

    p3 = {"x": 1.0, "y": 2.0, "z": 2.0}
    p4 = {"x": 4.0, "y": 6.0, "z": 2.0}
    assert math.isclose(calculate_distance(p3, p4), 5.0)


def test_extract_landmark_features_valid():
    # 21 mock landmarks
    landmarks = [{"x": float(i), "y": float(i * 2), "z": 0.0} for i in range(21)]
    features = extract_landmark_features(landmarks)

    expected_keys = {
        "palm_width",
        "palm_height",
        "thumb_length",
        "index_length",
        "middle_length",
        "ring_length",
        "little_length",
        "aspect_ratio"
    }
    assert set(features.keys()) == expected_keys
    assert features["palm_width"] > 0
    assert features["palm_height"] > 0


def test_extract_landmark_features_invalid_count():
    invalid_landmarks = [{"x": 0.0, "y": 0.0, "z": 0.0}] * 10
    with pytest.raises(ValueError, match="Expected 21 landmarks"):
        extract_landmark_features(invalid_landmarks)


def test_landmark_extractor_fallback():
    extractor = LandmarkExtractor()
    fallback_lms = extractor._generate_fallback_landmarks()
    assert len(fallback_lms) == 21
    features = extract_landmark_features(fallback_lms)
    assert features["aspect_ratio"] > 0
