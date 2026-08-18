"""
Palm image preprocessing, ported from the notebook (Cell 4): contrast
enhancement, denoising, blackhat ridge enhancement, adaptive thresholding,
morphology cleanup, and skeletonization down to 1px-wide palm lines.
"""
import cv2
import numpy as np
from skimage.morphology import skeletonize, remove_small_objects, remove_small_holes


def preprocess_palm(palm_roi_rgb: np.ndarray) -> dict:
    gray = cv2.cvtColor(palm_roi_rgb, cv2.COLOR_RGB2GRAY)

    clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(8, 8))
    clahe_img = clahe.apply(gray)

    denoised = cv2.fastNlMeansDenoising(clahe_img, None, 12, 7, 21)

    kernel_bh = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17))
    blackhat = cv2.morphologyEx(denoised, cv2.MORPH_BLACKHAT, kernel_bh)

    blur = cv2.GaussianBlur(blackhat, (5, 5), 0)

    threshold = cv2.adaptiveThreshold(
        blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, -3
    )

    kernel = np.ones((3, 3), np.uint8)
    opened = cv2.morphologyEx(threshold, cv2.MORPH_OPEN, kernel, iterations=1)
    closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel, iterations=2)

    binary = closed > 0
    binary = remove_small_objects(binary, min_size=35)
    binary = remove_small_holes(binary, area_threshold=35)
    binary = (binary.astype(np.uint8)) * 255

    skeleton = skeletonize(binary > 0)
    skeleton = (skeleton.astype(np.uint8)) * 255

    return {
        "gray": gray,
        "clahe": clahe_img,
        "denoised": denoised,
        "blackhat": blackhat,
        "threshold": threshold,
        "binary": binary,
        "skeleton": skeleton,
    }
