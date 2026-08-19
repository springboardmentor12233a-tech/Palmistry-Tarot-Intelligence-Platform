import os
import time
import urllib.request
from pathlib import Path

import numpy as np
import cv2
import mediapipe as mp

from mediapipe.tasks import python
from mediapipe.tasks.python import vision


# ============================================================
# CONSTANTS
# ============================================================

WARP_SUCCESS = 1

MODEL_URL = (
    "https://storage.googleapis.com/"
    "mediapipe-models/hand_landmarker/"
    "hand_landmarker/float16/1/"
    "hand_landmarker.task"
)


# ============================================================
# MODEL PATH
# ============================================================

# This file:
#
# palmistry/
#     code/
#         rectification.py
#
# Model will be stored at:
#
# palmistry/
#     code/
#         models/
#             hand_landmarker.task
#
CURRENT_DIR = Path(__file__).resolve().parent

MODEL_DIR = CURRENT_DIR / "models"
MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

MODEL_PATH = MODEL_DIR / "hand_landmarker.task"


# ============================================================
# DOWNLOAD MODEL
# ============================================================

def download_model():

    # --------------------------------------------------------
    # Already downloaded
    # --------------------------------------------------------

    if MODEL_PATH.exists():

        file_size = MODEL_PATH.stat().st_size

        # A valid MediaPipe model should not be tiny.
        # This also protects against an old incomplete download.
        if file_size > 1_000_000:

            print(
                f"[MediaPipe] Model already exists: "
                f"{MODEL_PATH}"
            )

            return True

        else:

            print(
                "[MediaPipe] Existing model appears "
                "incomplete. Removing it..."
            )

            try:
                MODEL_PATH.unlink()
            except Exception:
                pass

    # --------------------------------------------------------
    # Temporary download path
    # --------------------------------------------------------

    temp_path = MODEL_PATH.with_suffix(
        ".task.part"
    )

    # Remove previous incomplete download
    if temp_path.exists():

        try:
            temp_path.unlink()
        except Exception:
            pass

    print(
        "[MediaPipe] Downloading Hand Landmarker model..."
    )

    print(
        "[MediaPipe] This may take a few seconds."
    )

    # --------------------------------------------------------
    # Retry download
    # --------------------------------------------------------

    max_retries = 5

    for attempt in range(
        1,
        max_retries + 1
    ):

        try:

            print(
                f"[MediaPipe] Download attempt "
                f"{attempt}/{max_retries}"
            )

            # ------------------------------------------------
            # Open URL
            # ------------------------------------------------

            request = urllib.request.Request(
                MODEL_URL,
                headers={
                    "User-Agent": "Mozilla/5.0"
                }
            )

            with urllib.request.urlopen(
                request,
                timeout=60
            ) as response:

                total_size = response.headers.get(
                    "Content-Length"
                )

                if total_size is not None:
                    total_size = int(total_size)

                downloaded = 0

                chunk_size = 64 * 1024

                with open(
                    temp_path,
                    "wb"
                ) as output_file:

                    while True:

                        chunk = response.read(
                            chunk_size
                        )

                        if not chunk:
                            break

                        output_file.write(
                            chunk
                        )

                        downloaded += len(
                            chunk
                        )

                        # ------------------------------------
                        # Progress
                        # ------------------------------------

                        if total_size:

                            percentage = (
                                downloaded
                                / total_size
                                * 100
                            )

                            print(
                                f"\r[MediaPipe] "
                                f"{percentage:.1f}% "
                                f"({downloaded / 1024 / 1024:.2f} MB)",
                                end=""
                            )

            print()

            # ------------------------------------------------
            # Validate download
            # ------------------------------------------------

            if not temp_path.exists():

                raise RuntimeError(
                    "Downloaded model file was not created."
                )

            downloaded_size = (
                temp_path.stat().st_size
            )

            if downloaded_size < 1_000_000:

                raise RuntimeError(
                    "Downloaded model appears incomplete."
                )

            # ------------------------------------------------
            # Move completed file
            # ------------------------------------------------

            if MODEL_PATH.exists():

                MODEL_PATH.unlink()

            temp_path.replace(
                MODEL_PATH
            )

            print(
                "[MediaPipe] Model downloaded successfully."
            )

            print(
                f"[MediaPipe] Model path: "
                f"{MODEL_PATH}"
            )

            return True

        except Exception as error:

            print(
                f"\n[MediaPipe] Download failed: "
                f"{error}"
            )

            # Remove incomplete download
            if temp_path.exists():

                try:
                    temp_path.unlink()
                except Exception:
                    pass

            if attempt < max_retries:

                wait_time = attempt * 2

                print(
                    f"[MediaPipe] Retrying in "
                    f"{wait_time} seconds..."
                )

                time.sleep(
                    wait_time
                )

    # --------------------------------------------------------
    # All attempts failed
    # --------------------------------------------------------

    raise RuntimeError(
        "\n\n"
        "Unable to download the MediaPipe Hand Landmarker model.\n\n"
        "Possible reasons:\n"
        "1. Internet connection interrupted.\n"
        "2. Google storage download was interrupted.\n"
        "3. Firewall/antivirus blocked the download.\n"
        "4. Network timeout occurred.\n\n"
        f"Model URL:\n{MODEL_URL}\n\n"
        "Please check your internet connection and "
        "restart the Streamlit application."
    )


# ============================================================
# MAKE SURE MODEL EXISTS
# ============================================================

download_model()


# ============================================================
# CREATE MEDIAPIPE HAND LANDMARKER
# ============================================================

base_options = python.BaseOptions(
    model_asset_path=str(MODEL_PATH)
)

options = vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=1
)

detector = vision.HandLandmarker.create_from_options(
    options
)


# ============================================================
# DETECT LANDMARKS
# ============================================================

def detect_landmarks(image_path):

    """
    Detect 21 MediaPipe hand landmarks.

    Returns:
        list of 21 landmarks
        None if no hand is detected
    """

    image = cv2.imread(
        str(image_path)
    )

    if image is None:

        print(
            f"[MediaPipe] Unable to read image: "
            f"{image_path}"
        )

        return None

    # Mirror image
    image = cv2.flip(
        image,
        1
    )

    image_rgb = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=image_rgb
    )

    detection_result = detector.detect(
        mp_image
    )

    if (
        detection_result is None
        or
        len(
            detection_result.hand_landmarks
        ) == 0
    ):

        return None

    return detection_result.hand_landmarks[0]


# ============================================================
# WARP PALM IMAGE
# ============================================================

def warp_image(
    path_to_image,
    path_to_warped_image
):

    """
    Detect the hand and warp it into a normalized
    palm orientation.
    """

    # --------------------------------------------------------
    # Target landmark positions
    # --------------------------------------------------------

    pts_target_normalized = np.float32([

        [
            1 - 0.48203104734420776,
            0.9063420295715332
        ],

        [
            1 - 0.6043621301651001,
            0.8119394183158875
        ],

        [
            1 - 0.6763232946395874,
            0.6790258884429932
        ],

        [
            1 - 0.7340714335441589,
            0.5716733932495117
        ],

        [
            1 - 0.7896472215652466,
            0.5098430514335632
        ],

        [
            1 - 0.5655680298805237,
            0.5117031931877136
        ],

        [
            1 - 0.5979393720626831,
            0.36575648188591003
        ],

        [
            1 - 0.6135331392288208,
            0.2713503837585449
        ],

        [
            1 - 0.6196483373641968,
            0.19251111149787903
        ],

        [
            1 - 0.4928809702396393,
            0.4982593059539795
        ],

        [
            1 - 0.4899863600730896,
            0.3213786780834198
        ],

        [
            1 - 0.4894656836986542,
            0.21283167600631714
        ],

        [
            1 - 0.48334982991218567,
            0.12900274991989136
        ],

        [
            1 - 0.4258815348148346,
            0.5180916786193848
        ],

        [
            1 - 0.4033462107181549,
            0.3581996262073517
        ],

        [
            1 - 0.3938145041465759,
            0.2616880536079407
        ],

        [
            1 - 0.38608720898628235,
            0.1775170862674713
        ],

        [
            1 - 0.36368662118911743,
            0.5642163157463074
        ],

        [
            1 - 0.33553171157836914,
            0.44737303256988525
        ],

        [
            1 - 0.3209102153778076,
            0.3749568462371826
        ],

        [
            1 - 0.31213682889938354,
            0.3026996850967407
        ]
    ])

    # --------------------------------------------------------
    # Read image
    # --------------------------------------------------------

    image = cv2.imread(
        str(path_to_image)
    )

    if image is None:

        print(
            f"[MediaPipe] Unable to read image: "
            f"{path_to_image}"
        )

        return None

    # --------------------------------------------------------
    # Mirror image
    # --------------------------------------------------------

    image = cv2.flip(
        image,
        1
    )

    image_height, image_width = (
        image.shape[:2]
    )

    # --------------------------------------------------------
    # Convert BGR → RGB
    # --------------------------------------------------------

    image_rgb = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=image_rgb
    )

    # --------------------------------------------------------
    # Detect hand
    # --------------------------------------------------------

    detection_result = detector.detect(
        mp_image
    )

    if (
        detection_result is None
        or
        len(
            detection_result.hand_landmarks
        ) == 0
    ):

        print(
            "[MediaPipe] No hand detected."
        )

        return None

    hand_landmarks = (
        detection_result.hand_landmarks[0]
    )

    # --------------------------------------------------------
    # Convert 21 landmarks to pixel coordinates
    # --------------------------------------------------------

    pts = np.float32([

        [
            lm.x * image_width,
            lm.y * image_height
        ]

        for lm in hand_landmarks

    ])

    # --------------------------------------------------------
    # Convert target normalized points
    # to pixel coordinates
    # --------------------------------------------------------

    pts_target = np.float32([

        [
            x * image_width,
            y * image_height
        ]

        for x, y in pts_target_normalized

    ])

    # --------------------------------------------------------
    # Calculate homography
    # --------------------------------------------------------

    M, mask = cv2.findHomography(
        pts,
        pts_target,
        cv2.RANSAC,
        5.0
    )

    if M is None:

        print(
            "[MediaPipe] Unable to calculate "
            "palm transformation."
        )

        return None

    # --------------------------------------------------------
    # Warp image
    # --------------------------------------------------------

    warped_image = cv2.warpPerspective(
        image,
        M,
        (
            image_width,
            image_height
        ),
        borderMode=cv2.BORDER_REPLICATE
    )

    # --------------------------------------------------------
    # Make sure output directory exists
    # --------------------------------------------------------

    output_path = Path(
        path_to_warped_image
    )

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    success = cv2.imwrite(
        str(output_path),
        warped_image
    )

    if not success:

        print(
            "[MediaPipe] Failed to save "
            "warped palm image."
        )

        return None

    return WARP_SUCCESS


# ============================================================
# WARP WRAPPER
# ============================================================

def warp(
    path_to_input_image,
    path_to_warped_image
):

    """
    Wrapper used by the existing palmistry pipeline.
    """

    input_path = str(
        path_to_input_image
    )

    # --------------------------------------------------------
    # HEIC handling
    # --------------------------------------------------------

    if input_path.lower().endswith(
        ".heic"
    ):

        jpg_path = (
            input_path[:-5]
            + ".jpg"
        )

        # If a JPG version already exists,
        # use it.
        if os.path.exists(jpg_path):

            input_path = jpg_path

        else:

            print(
                "[MediaPipe] HEIC input detected."
            )

            print(
                "[MediaPipe] Please convert "
                "the HEIC image to JPG/PNG."
            )

            return None

    # --------------------------------------------------------
    # Perform warp
    # --------------------------------------------------------

    warp_result = warp_image(
        input_path,
        path_to_warped_image
    )

    if warp_result is None:

        return None

    return WARP_SUCCESS