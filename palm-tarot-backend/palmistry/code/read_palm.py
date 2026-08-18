import os
import argparse
import json

from tools import *
from model import *
from rectification import *
from detection import *
from classification import *
from measurement import *


def make_json_safe(value):
    """
    Convert common Python / NumPy values into JSON-compatible values.
    This allows the palm engine's result to be sent to FastAPI.
    """

    if value is None:
        return None

    if isinstance(value, (str, int, float, bool)):
        return value

    if isinstance(value, dict):
        return {
            str(key): make_json_safe(val)
            for key, val in value.items()
        }

    if isinstance(value, (list, tuple)):
        return [
            make_json_safe(item)
            for item in value
        ]

    # NumPy scalar support
    if hasattr(value, "item"):
        try:
            return value.item()
        except Exception:
            pass

    # NumPy array support
    if hasattr(value, "tolist"):
        try:
            return value.tolist()
        except Exception:
            pass

    # Final fallback
    return str(value)


def main(input):

    path_to_input_image = f"input/{input}"

    results_dir = "./results"
    os.makedirs(results_dir, exist_ok=True)

    resize_value = 256

    path_to_clean_image = "results/palm_without_background.jpg"
    path_to_warped_image = "results/warped_palm.jpg"
    path_to_warped_image_clean = "results/warped_palm_clean.jpg"
    path_to_warped_image_mini = "results/warped_palm_mini.jpg"
    path_to_warped_image_clean_mini = "results/warped_palm_clean_mini.jpg"

    path_to_palmline_image = "results/palm_lines.png"

    path_to_model = "checkpoint/checkpoint_aug_epoch70.pth"

    # Old repository result image.
    # We keep generating it for compatibility.
    path_to_result = "results/result.jpg"

    # NEW structured result
    path_to_json = "results/palm_analysis.json"

    print("Starting palm analysis...")

    # ---------------------------------------------------------
    # 0. Preprocess image
    # ---------------------------------------------------------

    print("Step 1/5: Removing background...")

    remove_background(
        path_to_input_image,
        path_to_clean_image
    )

    # ---------------------------------------------------------
    # 1. Palm image rectification
    # ---------------------------------------------------------

    print("Step 2/5: Rectifying palm...")

    warp_result = warp(
        path_to_input_image,
        path_to_warped_image
    )

    if warp_result is None:
        print_error()
        return

    remove_background(
        path_to_warped_image,
        path_to_warped_image_clean
    )

    resize(
        path_to_warped_image,
        path_to_warped_image_clean,
        path_to_warped_image_mini,
        path_to_warped_image_clean_mini,
        resize_value
    )

    # ---------------------------------------------------------
    # 2. Principal line detection
    # ---------------------------------------------------------

    print("Step 3/5: Detecting palm lines...")

    net = UNet(
        n_channels=3,
        n_classes=1
    )

    net.load_state_dict(
        torch.load(
            path_to_model,
            map_location=torch.device("cpu")
        )
    )

    detect(
        net,
        path_to_warped_image_clean,
        path_to_palmline_image,
        resize_value
    )

    # ---------------------------------------------------------
    # 3. Line classification
    # ---------------------------------------------------------

    print("Step 4/5: Classifying palm lines...")

    lines = classify(
        path_to_palmline_image
    )

    # ---------------------------------------------------------
    # 4. Length measurement
    # ---------------------------------------------------------

    print("Step 5/5: Measuring palm lines...")

    im, contents = measure(
        path_to_warped_image_mini,
        lines
    )

    # ---------------------------------------------------------
    # NEW: Save structured palm intelligence
    # ---------------------------------------------------------

    palm_analysis = {
        "success": True,

        "input_image": input,

        "detected_lines": make_json_safe(lines),

        "measurements": make_json_safe(contents),

        "artifacts": {
            "palm_lines": "palm_lines.png",
            "warped_palm": "warped_palm.jpg",
            "clean_palm": "palm_without_background.jpg",
            "legacy_result": "result.jpg"
        }
    }

    with open(
        path_to_json,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            palm_analysis,
            file,
            indent=4,
            ensure_ascii=False
        )

    print("Structured palm analysis saved.")

    # ---------------------------------------------------------
    # 5. Keep old result for compatibility
    # ---------------------------------------------------------

    save_result(
        im,
        contents,
        resize_value,
        path_to_result
    )

    print("Palm analysis completed successfully.")

    # IMPORTANT:
    # Print the structured result so FastAPI can capture it.
    print(
        json.dumps(
            palm_analysis,
            ensure_ascii=False
        )
    )


if __name__ == "__main__":

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--input",
        required=True,
        help="the path to the input"
    )

    args = parser.parse_args()

    main(args.input)