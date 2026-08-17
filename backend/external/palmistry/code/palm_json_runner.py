import argparse
import gc
import json
import os
import sys
from pathlib import Path
from typing import Any


# ============================================================
# LOW-MEMORY CPU SETTINGS
# ============================================================
#
# These must be configured before importing PyTorch.
# ============================================================

os.environ.setdefault(
    "OMP_NUM_THREADS",
    "1",
)

os.environ.setdefault(
    "MKL_NUM_THREADS",
    "1",
)

os.environ.setdefault(
    "OPENBLAS_NUM_THREADS",
    "1",
)

os.environ.setdefault(
    "NUMEXPR_NUM_THREADS",
    "1",
)

os.environ.setdefault(
    "VECLIB_MAXIMUM_THREADS",
    "1",
)

os.environ.setdefault(
    "MALLOC_ARENA_MAX",
    "2",
)


import torch


# ============================================================
# PYTORCH CPU LIMITS
# ============================================================

torch.set_num_threads(
    1
)

try:
    torch.set_num_interop_threads(
        1
    )

except RuntimeError:
    # PyTorch allows this setting only before
    # inter-op work starts.
    pass


# ============================================================
# PALM MODEL IMPORTS
# ============================================================

from classification import classify
from detection import detect
from measurement import measure
from model import UNet
from rectification import warp
from tools import (
    remove_background,
    resize,
    save_result,
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = (
    Path(__file__)
    .resolve()
    .parent
)

PALMISTRY_ROOT = (
    BASE_DIR.parent
)

INPUT_DIR = (
    BASE_DIR
    / "input"
)

RESULTS_DIR = (
    BASE_DIR
    / "results"
)

CHECKPOINT_PATH = (
    PALMISTRY_ROOT
    / "detect"
    / "checkpoints"
    / "checkpoint_aug_epoch70.pth"
)


# ============================================================
# MEMORY CLEANUP
# ============================================================

def release_memory() -> None:
    """
    Request Python garbage collection.

    This cannot force every native library to release
    memory, but it helps remove Python-side references
    as early as possible.
    """

    gc.collect()


# ============================================================
# LINE RESULT EXTRACTION
# ============================================================

def extract_line_length(
    description: str,
    line_name: str,
) -> str:
    """
    Convert the model's text description into
    either 'long' or 'short'.
    """

    normalized_description = (
        description.lower()
    )

    if (
        " is long"
        in normalized_description
    ):
        return "long"

    if (
        " is short"
        in normalized_description
    ):
        return "short"

    raise ValueError(
        (
            f"Could not determine the "
            f"{line_name} length from "
            f"model output: {description}"
        )
    )


# ============================================================
# JSON OUTPUT
# ============================================================

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


# ============================================================
# MEMORY-EFFICIENT MODEL LOADING
# ============================================================

def load_palm_model() -> UNet:
    """
    Load the palm-line UNet with reduced peak RAM usage.

    Strategy:
    1. memory-map checkpoint where supported
    2. construct the model on the meta device
    3. assign checkpoint tensors directly
    4. avoid an additional model-weight copy
    """

    print(
        "Loading palm UNet using "
        "low-memory mode...",
        flush=True,
    )


    # --------------------------------------------------------
    # LOAD CHECKPOINT
    # --------------------------------------------------------

    try:

        model_state = torch.load(
            str(
                CHECKPOINT_PATH
            ),
            map_location="cpu",
            mmap=True,
            weights_only=True,
        )

        print(
            (
                "Checkpoint loaded using "
                "memory mapping."
            ),
            flush=True,
        )

    except (
        TypeError,
        RuntimeError,
        ValueError,
    ) as error:

        print(
            (
                "Memory-mapped checkpoint "
                "loading was unavailable. "
                f"Fallback reason: {error}"
            ),
            flush=True,
        )

        model_state = torch.load(
            str(
                CHECKPOINT_PATH
            ),
            map_location="cpu",
            weights_only=True,
        )


    # --------------------------------------------------------
    # CREATE MODEL WITHOUT ALLOCATING FULL PARAMETERS
    # --------------------------------------------------------

    with torch.device(
        "meta"
    ):

        model = UNet(
            n_channels=3,
            n_classes=1,
        )


    # --------------------------------------------------------
    # ASSIGN CHECKPOINT TENSORS DIRECTLY
    # --------------------------------------------------------

    try:

        model.load_state_dict(
            model_state,
            assign=True,
        )

    except TypeError:

        raise RuntimeError(
            (
                "This PyTorch version does not "
                "support load_state_dict(assign=True). "
                "The low-memory palm loader requires "
                "a modern PyTorch version."
            )
        )


    # The model now owns the parameter references.
    del model_state

    release_memory()


    model.eval()


    print(
        "Palm UNet loaded successfully.",
        flush=True,
    )


    return model


# ============================================================
# PALM ANALYSIS
# ============================================================

def analyze_palm(
    input_filename: str,
) -> dict[str, Any]:
    """
    Run the complete external palm model and return
    structured palm-line results.
    """

    os.chdir(
        BASE_DIR
    )


    input_path = (
        INPUT_DIR
        / input_filename
    )


    if not input_path.exists():

        raise FileNotFoundError(
            (
                "Palm image was not found: "
                f"{input_path}"
            )
        )


    if not CHECKPOINT_PATH.exists():

        raise FileNotFoundError(
            (
                "Palm model checkpoint was "
                "not found: "
                f"{CHECKPOINT_PATH}"
            )
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


    # --------------------------------------------------------
    # REMOVE OLD RESULT
    # --------------------------------------------------------

    if result_image_path.exists():

        result_image_path.unlink()


    # ========================================================
    # STEP 1 — BACKGROUND REMOVAL
    # ========================================================

    print(
        "Palm step 1/6: removing background...",
        flush=True,
    )


    remove_background(
        str(
            input_path
        ),
        str(
            clean_image_path
        ),
    )


    release_memory()


    # ========================================================
    # STEP 2 — PALM RECTIFICATION
    # ========================================================

    print(
        "Palm step 2/6: rectifying palm...",
        flush=True,
    )


    warp_result = warp(
        str(
            input_path
        ),
        str(
            warped_image_path
        ),
    )


    if warp_result is None:

        raise ValueError(
            (
                "The palm could not be detected "
                "or rectified. Use a clearer "
                "front-facing palm image."
            )
        )


    release_memory()


    remove_background(
        str(
            warped_image_path
        ),
        str(
            warped_clean_path
        ),
    )


    release_memory()


    resize(
        str(
            warped_image_path
        ),
        str(
            warped_clean_path
        ),
        str(
            warped_mini_path
        ),
        str(
            warped_clean_mini_path
        ),
        resize_value,
    )


    release_memory()


    # ========================================================
    # STEP 3 — PRINCIPAL LINE DETECTION
    # ========================================================

    print(
        "Palm step 3/6: loading line model...",
        flush=True,
    )


    model = load_palm_model()


    print(
        "Palm step 3/6: detecting palm lines...",
        flush=True,
    )


    with torch.inference_mode():

        detect(
            model,
            str(
                warped_clean_path
            ),
            str(
                palm_lines_path
            ),
            resize_value,
        )


    # The neural network is no longer required after
    # palm_lines.png has been generated.
    del model

    release_memory()


    # ========================================================
    # STEP 4 — LINE CLASSIFICATION
    # ========================================================

    print(
        "Palm step 4/6: classifying lines...",
        flush=True,
    )


    classified_lines = classify(
        str(
            palm_lines_path
        )
    )


    if (
        classified_lines is None
        or len(
            classified_lines
        ) < 3
        or any(
            line is None
            for line in classified_lines
        )
    ):

        raise ValueError(
            (
                "The model could not classify "
                "all three principal palm lines."
            )
        )


    release_memory()


    # ========================================================
    # STEP 5 — LINE MEASUREMENT
    # ========================================================

    print(
        "Palm step 5/6: measuring lines...",
        flush=True,
    )


    result_image, contents = measure(
        str(
            warped_mini_path
        ),
        classified_lines,
    )


    if (
        result_image is None
        or contents is None
        or len(
            contents
        ) < 6
    ):

        raise ValueError(
            (
                "The model could not measure "
                "all three principal palm lines."
            )
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


    # ========================================================
    # STEP 6 — SAVE RESULT
    # ========================================================

    print(
        "Palm step 6/6: saving result...",
        flush=True,
    )


    save_result(
        result_image,
        contents,
        resize_value,
        str(
            result_image_path
        ),
    )


    release_memory()


    return {

        "status":
            "success",

        "message": (
            "Palm image analyzed successfully."
        ),

        "input_filename":
            input_filename,

        "palm_analysis": {

            "heart_line":
                heart_line,

            "head_line":
                head_line,

            "life_line":
                life_line,
        },

        "descriptions": {

            "heart_line":
                contents[1],

            "head_line":
                contents[3],

            "life_line":
                contents[5],
        },

        "output_files": {

            "result_image":
                str(
                    result_image_path
                ),

            "warped_palm":
                str(
                    warped_image_path
                ),

            "palm_lines":
                str(
                    palm_lines_path
                ),
        },
    }


# ============================================================
# COMMAND-LINE ENTRY POINT
# ============================================================

def main() -> int:

    parser = argparse.ArgumentParser(
        description=(
            "Run palm analysis and save "
            "structured JSON results."
        )
    )


    parser.add_argument(
        "--input",
        required=True,
        help=(
            "Filename of an image inside "
            "the code/input folder."
        ),
    )


    parser.add_argument(
        "--output-json",
        default=(
            "results/"
            "palm_analysis.json"
        ),
        help=(
            "Path where the structured JSON "
            "result will be saved."
        ),
    )


    arguments = (
        parser.parse_args()
    )


    output_json_path = Path(
        arguments.output_json
    )


    if not (
        output_json_path.is_absolute()
    ):

        output_json_path = (
            BASE_DIR
            / output_json_path
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
            (
                "Palm analysis completed "
                "successfully."
            ),
            flush=True,
        )


        print(
            (
                "JSON result: "
                f"{output_json_path}"
            ),
            flush=True,
        )


        return 0


    except Exception as error:

        error_result = {

            "status":
                "error",

            "message":
                str(
                    error
                ),

            "input_filename":
                arguments.input,
        }


        write_json(
            output_json_path,
            error_result,
        )


        print(
            (
                "Palm analysis failed: "
                f"{error}"
            ),
            file=sys.stderr,
            flush=True,
        )


        return 1


if __name__ == "__main__":

    raise SystemExit(
        main()
    )