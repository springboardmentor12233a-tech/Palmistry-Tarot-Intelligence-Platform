import sys
import traceback
from pathlib import Path


# ============================================================
# PROJECT PATHS
# ============================================================

# This file is expected to be in the project root:
#
# Palmistry-Tarot-Streamlit/
# ├── app.py
# ├── palmistry_engine.py
# └── palmistry/
#     └── code/
#
# If palmistry_engine.py is inside another folder,
# adjust PROJECT_ROOT accordingly.

PROJECT_ROOT = Path(__file__).resolve().parent

PALMISTRY_CODE = PROJECT_ROOT / "palmistry" / "code"

INPUT_DIR = PALMISTRY_CODE / "input"
RESULTS_DIR = PALMISTRY_CODE / "results"
CHECKPOINT_DIR = PALMISTRY_CODE / "checkpoint"


# ============================================================
# MAKE EXISTING PALMISTRY MODULES IMPORTABLE
# ============================================================

if str(PALMISTRY_CODE) not in sys.path:
    sys.path.insert(0, str(PALMISTRY_CODE))


# ============================================================
# IMPORT EXISTING PALMISTRY PIPELINE
# ============================================================

from tools import *
from model import *
from rectification import *
from detection import *
from classification import *
from measurement import *


# ============================================================
# PALM ANALYSIS
# ============================================================

def analyze_palm(image_name):
    """
    Run the existing Palmistry pipeline.

    Parameters
    ----------
    image_name : str
        Name of the uploaded palm image.

    Returns
    -------
    dict or None
        Dictionary containing processed images and
        palm-line interpretations.
    """

    try:

        # ====================================================
        # CREATE REQUIRED DIRECTORIES
        # ====================================================

        INPUT_DIR.mkdir(
            parents=True,
            exist_ok=True
        )

        RESULTS_DIR.mkdir(
            parents=True,
            exist_ok=True
        )

        # ====================================================
        # INPUT IMAGE
        # ====================================================

        input_path = INPUT_DIR / image_name

        if not input_path.exists():

            raise FileNotFoundError(
                f"Palm image not found:\n{input_path}"
            )

        # ====================================================
        # OUTPUT PATHS
        # ====================================================

        clean_image = (
            RESULTS_DIR
            / "palm_without_background.jpg"
        )

        warped_image = (
            RESULTS_DIR
            / "warped_palm.jpg"
        )

        warped_clean = (
            RESULTS_DIR
            / "warped_palm_clean.jpg"
        )

        warped_mini = (
            RESULTS_DIR
            / "warped_palm_mini.jpg"
        )

        warped_clean_mini = (
            RESULTS_DIR
            / "warped_palm_clean_mini.jpg"
        )

        palm_lines = (
            RESULTS_DIR
            / "palm_lines.png"
        )

        result_image = (
            RESULTS_DIR
            / "result.jpg"
        )

        # ====================================================
        # MODEL CHECKPOINT
        # ====================================================

        model_path = (
            CHECKPOINT_DIR
            / "checkpoint_aug_epoch70.pth"
        )

        if not model_path.exists():

            raise FileNotFoundError(
                "Palmistry model checkpoint not found:\n"
                f"{model_path}"
            )

        # ====================================================
        # IMAGE SIZE
        # ====================================================

        resize_value = 256

        # ====================================================
        # STEP 1
        # BACKGROUND REMOVAL
        # ====================================================

        print(
            "Step 1/6: Removing background..."
        )

        remove_background(
            str(input_path),
            str(clean_image)
        )

        if not clean_image.exists():

            raise RuntimeError(
                "Background removal failed. "
                "Clean image was not generated."
            )

        # ====================================================
        # STEP 2
        # PALM RECTIFICATION / WARPING
        # ====================================================

        print(
            "Step 2/6: Rectifying palm..."
        )

        warp_result = warp(
            str(input_path),
            str(warped_image)
        )

        if warp_result is None:

            print(
                "Palm warping returned None."
            )

            return None

        if not warped_image.exists():

            raise RuntimeError(
                "Palm rectification failed. "
                "Warped image was not generated."
            )

        # ====================================================
        # REMOVE BACKGROUND FROM WARPED IMAGE
        # ====================================================

        remove_background(
            str(warped_image),
            str(warped_clean)
        )

        if not warped_clean.exists():

            raise RuntimeError(
                "Background removal from warped palm failed."
            )

        # ====================================================
        # RESIZE PALM IMAGES
        # ====================================================

        resize(
            str(warped_image),
            str(warped_clean),
            str(warped_mini),
            str(warped_clean_mini),
            resize_value
        )

        # ====================================================
        # CHECK RESIZED IMAGES
        # ====================================================

        if not warped_mini.exists():

            raise RuntimeError(
                "Palm resize failed. "
                "warped_palm_mini.jpg was not created."
            )

        # ====================================================
        # STEP 3
        # PRINCIPAL LINE DETECTION
        # ====================================================

        print(
            "Step 3/6: Detecting palm lines..."
        )

        # ----------------------------------------------------
        # Create U-Net model
        # ----------------------------------------------------

        net = UNet(
            n_channels=3,
            n_classes=1
        )

        # ----------------------------------------------------
        # Load trained checkpoint
        # ----------------------------------------------------

        import torch

        checkpoint = torch.load(
            str(model_path),
            map_location=torch.device("cpu")
        )

        net.load_state_dict(
            checkpoint
        )

        # ----------------------------------------------------
        # Evaluation mode
        # ----------------------------------------------------

        net.eval()

        # ----------------------------------------------------
        # Detect palm lines
        # ----------------------------------------------------

        detect(
            net,
            str(warped_clean),
            str(palm_lines),
            resize_value
        )

        if not palm_lines.exists():

            raise RuntimeError(
                "Palm line detection failed. "
                "palm_lines.png was not generated."
            )

        # ====================================================
        # STEP 4
        # LINE CLASSIFICATION
        # ====================================================

        print(
            "Step 4/6: Classifying palm lines..."
        )

        lines = classify(
            str(palm_lines)
        )

        if lines is None:

            raise RuntimeError(
                "Palm line classification returned None."
            )

        # ====================================================
        # STEP 5
        # MEASUREMENT + INTERPRETATION
        # ====================================================

        print(
            "Step 5/6: Measuring palm lines..."
        )

        im, contents = measure(
            str(warped_mini),
            lines
        )

        if im is None:

            raise RuntimeError(
                "Palm measurement returned no image."
            )

        if contents is None:

            raise RuntimeError(
                "Palm interpretation returned no contents."
            )

        # ====================================================
        # STEP 6
        # SAVE FINAL RESULT
        # ====================================================

        print(
            "Step 6/6: Saving final result..."
        )

        save_result(
            im,
            contents,
            resize_value,
            str(result_image)
        )

        if not result_image.exists():

            raise RuntimeError(
                "Final palm result image was not created."
            )

        # ====================================================
        # RETURN RESULT TO STREAMLIT
        # ====================================================

        print(
            "Palm analysis completed successfully!"
        )

        return {
            "result_image": result_image,

            "palm_lines_image": palm_lines,

            "clean_image": clean_image,

            "warped_image": warped_image,

            "warped_clean_image": warped_clean,

            "warped_mini_image": warped_mini,

            "warped_clean_mini_image": warped_clean_mini,

            "contents": contents,
        }

    # ========================================================
    # ERROR HANDLING
    # ========================================================

    except Exception as e:

        print(
            "\n=========================================="
        )

        print(
            "PALM ANALYSIS ERROR"
        )

        print(
            "=========================================="
        )

        print(
            f"Error: {e}"
        )

        traceback.print_exc()

        print(
            "==========================================\n"
        )

        # Re-raise the error so Streamlit can display it
        raise


# ============================================================
# OPTIONAL COMMAND-LINE TEST
# ============================================================

if __name__ == "__main__":

    print(
        "Testing Palmistry Engine..."
    )

    test_image = "hand1.jpg"

    try:

        result = analyze_palm(
            test_image
        )

        if result is not None:

            print(
                "\nPalm analysis completed successfully!"
            )

            print(
                "\nReturned keys:"
            )

            print(
                result.keys()
            )

            print(
                "\nInterpretations:"
            )

            print(
                result["contents"]
            )

        else:

            print(
                "\nPalm analysis returned None."
            )

    except Exception as e:

        print(
            "\nPalm analysis failed."
        )

        print(
            f"Error: {e}"
        )