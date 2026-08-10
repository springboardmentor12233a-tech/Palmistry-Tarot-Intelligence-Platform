import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

import torch

from classification import classify
from detection import detect
from measurement import measure
from model import UNet
from rectification import warp
from tools import remove_background, resize, save_result


BASE_DIR = Path(__file__).resolve().parent

PALMISTRY_ROOT = BASE_DIR.parent

INPUT_DIR = BASE_DIR / "input"

RESULTS_DIR = BASE_DIR / "results"

CHECKPOINT_PATH = (
    PALMISTRY_ROOT
    / "detect"
    / "checkpoints"
    / "checkpoint_aug_epoch70.pth"
)


def extract_line_length(
    description: str,
    line_name: str,
) -> str:
    """
    Convert the model's text description into
    either 'long' or 'short'.
    """

    normalized_description = description.lower()

    if " is long" in normalized_description:
        return "long"

    if " is short" in normalized_description:
        return "short"

    raise ValueError(
        f"Could not determine the {line_name} "
        f"length from model output: {description}"
    )


def write_json(
    output_path: Path,
    payload: dict[str, Any],
) -> None:
    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with output_path.open(
        "w",
        encoding="utf-8",
    ) as output_file:
        json.dump(
            payload,
            output_file,
            indent=2,
            ensure_ascii=False,
        )


def analyze_palm(
    input_filename: str,
) -> dict[str, Any]:
    """
    Run the complete external palm model and return
    structured palm-line results.
    """

    os.chdir(BASE_DIR)

    input_path = INPUT_DIR / input_filename

    if not input_path.exists():
        raise FileNotFoundError(
            f"Palm image was not found: {input_path}"
        )

    if not CHECKPOINT_PATH.exists():
        raise FileNotFoundError(
            "Palm model checkpoint was not found: "
            f"{CHECKPOINT_PATH}"
        )

    RESULTS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    resize_value = 256

    clean_image_path = (
        RESULTS_DIR
        / "palm_without_background.jpg"
    )

    warped_image_path = (
        RESULTS_DIR
        / "warped_palm.jpg"
    )

    warped_clean_path = (
        RESULTS_DIR
        / "warped_palm_clean.jpg"
    )

    warped_mini_path = (
        RESULTS_DIR
        / "warped_palm_mini.jpg"
    )

    warped_clean_mini_path = (
        RESULTS_DIR
        / "warped_palm_clean_mini.jpg"
    )

    palm_lines_path = (
        RESULTS_DIR
        / "palm_lines.png"
    )

    result_image_path = (
        RESULTS_DIR
        / "result.jpg"
    )

    # Prevent an old result image from being
    # mistaken for a new successful result.
    if result_image_path.exists():
        result_image_path.unlink()

    # Step 1: Remove the background.
    remove_background(
        str(input_path),
        str(clean_image_path),
    )

    # Step 2: Rectify and warp the palm.
    warp_result = warp(
        str(input_path),
        str(warped_image_path),
    )

    if warp_result is None:
        raise ValueError(
            "The palm could not be detected or "
            "rectified. Use a clearer front-facing "
            "palm image."
        )

    remove_background(
        str(warped_image_path),
        str(warped_clean_path),
    )

    resize(
        str(warped_image_path),
        str(warped_clean_path),
        str(warped_mini_path),
        str(warped_clean_mini_path),
        resize_value,
    )

    # Step 3: Detect principal palm lines.
    model = UNet(
        n_channels=3,
        n_classes=1,
    )

    model_state = torch.load(
        str(CHECKPOINT_PATH),
        map_location=torch.device("cpu"),
    )

    model.load_state_dict(model_state)
    model.eval()

    detect(
        model,
        str(warped_clean_path),
        str(palm_lines_path),
        resize_value,
    )

    # Step 4: Classify heart, head and life lines.
    classified_lines = classify(
        str(palm_lines_path)
    )

    if (
        classified_lines is None
        or len(classified_lines) < 3
        or any(
            line is None
            for line in classified_lines
        )
    ):
        raise ValueError(
            "The model could not classify all three "
            "principal palm lines."
        )

    # Step 5: Measure the classified lines.
    result_image, contents = measure(
        str(warped_mini_path),
        classified_lines,
    )

    if (
        result_image is None
        or contents is None
        or len(contents) < 6
    ):
        raise ValueError(
            "The model could not measure all three "
            "principal palm lines."
        )

    heart_line = extract_line_length(
        contents[1],
        "heart line",
    )

    head_line = extract_line_length(
        contents[3],
        "head line",
    )

    life_line = extract_line_length(
        contents[5],
        "life line",
    )

    # Step 6: Save the annotated result image.
    save_result(
        result_image,
        contents,
        resize_value,
        str(result_image_path),
    )

    return {
        "status": "success",
        "message": (
            "Palm image analyzed successfully."
        ),
        "input_filename": input_filename,
        "palm_analysis": {
            "heart_line": heart_line,
            "head_line": head_line,
            "life_line": life_line,
        },
        "descriptions": {
            "heart_line": contents[1],
            "head_line": contents[3],
            "life_line": contents[5],
        },
        "output_files": {
            "result_image": str(
                result_image_path
            ),
            "warped_palm": str(
                warped_image_path
            ),
            "palm_lines": str(
                palm_lines_path
            ),
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Run palm analysis and save structured "
            "JSON results."
        )
    )

    parser.add_argument(
        "--input",
        required=True,
        help=(
            "Filename of an image inside the "
            "code/input folder."
        ),
    )

    parser.add_argument(
        "--output-json",
        default="results/palm_analysis.json",
        help=(
            "Path where the structured JSON result "
            "will be saved."
        ),
    )

    arguments = parser.parse_args()

    output_json_path = Path(
        arguments.output_json
    )

    if not output_json_path.is_absolute():
        output_json_path = (
            BASE_DIR / output_json_path
        )

    try:
        result = analyze_palm(
            arguments.input
        )

        write_json(
            output_json_path,
            result,
        )

        print(
            "Palm analysis completed successfully."
        )

        print(
            f"JSON result: {output_json_path}"
        )

        return 0

    except Exception as error:
        error_result = {
            "status": "error",
            "message": str(error),
            "input_filename": arguments.input,
        }

        write_json(
            output_json_path,
            error_result,
        )

        print(
            f"Palm analysis failed: {error}",
            file=sys.stderr,
        )

        return 1


if __name__ == "__main__":
    raise SystemExit(main())