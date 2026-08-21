import os
import cv2
from pathlib import Path
from typing import Any, List, Optional, Tuple, Union
from PIL import Image, ImageDraw
import mediapipe as mp
from app.services.palm_core.rectification import get_landmarker


def measure(
    path_to_warped_image_mini: Union[str, Path], lines: List[Any]
) -> Tuple[Optional[Image.Image], Optional[List[str]], Optional[dict]]:
    """
    Measures Heart, Head, and Life lines against biometric landmark thresholds.
    Draws colored annotations on the mini warped image and returns line contents and details.
    """
    image_path = str(path_to_warped_image_mini)
    image_bgr = cv2.imread(image_path)
    if image_bgr is None:
        return None, None, None

    image = cv2.flip(image_bgr, 1)
    image_height, image_width, _ = image.shape

    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    landmarker = get_landmarker()
    result = landmarker.detect(mp_image)

    if not result.hand_landmarks:
        return None, None, None

    hand_landmarks = result.hand_landmarks[0]

    zero = hand_landmarks[0].y
    one = hand_landmarks[1].y
    five = hand_landmarks[5].x
    nine = hand_landmarks[9].x
    thirteen = hand_landmarks[13].x

    heart_thres_x = image_width * (1 - (nine + (five - nine) * 2 / 5))
    head_thres_x = image_width * (1 - (thirteen + (nine - thirteen) / 3))
    life_thres_y = image_height * (one + (zero - one) / 3)

    if (None in lines) or (len(lines) < 3):
        return None, None, None

    im = Image.open(image_path)
    draw = ImageDraw.Draw(im)
    width = 3

    heart_line = lines[0]
    head_line = lines[1]
    life_line = lines[2]

    # Heart line
    heart_line_points = [tuple(reversed(l[:2])) for l in heart_line]
    heart_line_tip = heart_line_points[0]
    heart_is_long = heart_line_tip[0] < heart_thres_x
    heart_content_1 = "Love line governs all matters of the heart, including romance, friendship, and commitment."
    heart_content_2 = (
        "Your Heart line is long, which means you will have long partnership with whom you love or care."
        if heart_is_long
        else "Your Heart line is short, which means you will meet various people and have a broad range of relationships throughout your life."
    )
    draw.line(heart_line_points, fill="red", width=width)

    # Head line
    head_line_points = [tuple(reversed(l[:2])) for l in head_line]
    head_line_tip = head_line_points[-1]
    head_is_long = head_line_tip[0] > head_thres_x
    head_content_1 = "Head line tells us about our intellectual curiosities and pursuits."
    head_content_2 = (
        "Your Head line is long, which means you will explore a broad range of topics throughout your life."
        if head_is_long
        else "Your Head line is short, which means you will be fascinated by one topic and dig deep into it."
    )
    draw.line(head_line_points, fill="green", width=width)

    # Life line
    life_line_points = [tuple(reversed(l[:2])) for l in life_line]
    life_line_tip = life_line_points[-1]
    life_is_long = life_line_tip[1] > life_thres_y
    life_content_1 = (
        "Life line reveals your experiences, vitality, and zest. Be careful, it has nothing to do with how long you will live!"
    )
    life_content_2 = (
        "Your Life line is long, which means you tend to solve problems with other people rather than by yourself."
        if life_is_long
        else "Your Life line is short, which means you are independent and autonomous."
    )
    draw.line(life_line_points, fill="blue", width=width)

    contents = [
        heart_content_1,
        heart_content_2,
        head_content_1,
        head_content_2,
        life_content_1,
        life_content_2,
    ]

    metrics = {
        "heart_is_long": heart_is_long,
        "head_is_long": head_is_long,
        "life_is_long": life_is_long,
    }

    return im, contents, metrics
