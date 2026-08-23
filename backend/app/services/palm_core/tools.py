import numpy as np
from PIL import Image
import cv2
from pathlib import Path
from typing import Union


def remove_background(image_input: Union[str, Path, np.ndarray], path_to_clean_image: Union[str, Path]):
    """Removes non-skin background and isolates the palm area."""
    if isinstance(image_input, (str, Path)):
        img = cv2.imread(str(image_input))
    else:
        img = image_input

    if img is None:
        raise ValueError(f"Could not load image from {image_input}")

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower = np.array([0, 20, 80], dtype="uint8")
    upper = np.array([50, 255, 255], dtype="uint8")
    mask = cv2.inRange(hsv, lower, upper)
    result = cv2.bitwise_and(img, img, mask=mask)
    b, g, r = cv2.split(result)
    g_filter = g.copy()
    ret, mask = cv2.threshold(g_filter, 10, 255, 1)
    img[mask == 255] = 255
    cv2.imwrite(str(path_to_clean_image), img)
    return img


def resize(
    path_to_warped_image: Union[str, Path],
    path_to_warped_image_clean: Union[str, Path],
    path_to_warped_image_mini: Union[str, Path],
    path_to_warped_image_clean_mini: Union[str, Path],
    resize_value: int = 256,
):
    """Resizes palm images to standard model input dimensions."""
    pil_img = Image.open(str(path_to_warped_image))
    pil_img_clean = Image.open(str(path_to_warped_image_clean))
    pil_img.resize((resize_value, resize_value), resample=Image.Resampling.NEAREST).save(str(path_to_warped_image_mini))
    pil_img_clean.resize((resize_value, resize_value), resample=Image.Resampling.NEAREST).save(str(path_to_warped_image_clean_mini))
