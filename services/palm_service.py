"""
Palm analysis service — wired to the real "Fortune On Your Hand" pipeline
(read_palm.py / tools.py / model.py / rectification.py / detection.py /
classification.py / measurement.py), as uploaded from
palmistry-main/palmistry-main/code.

Key facts about that pipeline that shape this adapter:
  - `read_palm.main(filename)` takes a FILENAME ONLY (e.g. "Hand_0001657.jpg"),
    not a full path, and resolves 'input/...', 'results/...', and
    'checkpoint/...' relative to the current working directory. So we must
    chdir into palmistry_code_dir before calling it.
  - It needs checkpoint/checkpoint_aug_epoch70.pth to exist inside
    palmistry_code_dir. That file wasn't part of what you uploaded — make
    sure it's present wherever this runs (bake it into the Docker image or
    mount it as a volume; it's too large to hardcode a path assumption
    about here).
  - It already writes results/palm_interpretation.json with heart/head/life
    line descriptions and findings — that's the palm_text this service
    returns. If line detection fails (no hand found, or fewer than 3 lines
    detected), that file contains `null`.
  - tools.py, model.py, rectification.py, detection.py, classification.py,
    measurement.py are plain top-level modules (not a package), so
    palmistry_code_dir must be on sys.path before importing read_palm.
"""

import importlib
import json
import os
import shutil
import sys
from pathlib import Path

# Cache imported `read_palm` modules per code_dir so repeated requests don't
# re-trigger Python's import machinery — the (slow) part that actually costs
# time per request is net.load_state_dict() inside main(), which happens on
# every call as written in read_palm.py. If this becomes a bottleneck under
# real traffic, the fix is to refactor read_palm.py to load the UNet once at
# startup instead of inside main() — flagged here rather than done silently,
# since it means editing code you own.
_read_palm_module_cache: dict[str, object] = {}


class PalmAnalysisError(Exception):
    pass


def _get_read_palm_module(code_dir: str):
    if code_dir not in _read_palm_module_cache:
        if code_dir not in sys.path:
            sys.path.insert(0, code_dir)
        _read_palm_module_cache[code_dir] = importlib.import_module("read_palm")
    return _read_palm_module_cache[code_dir]


def analyze_palm(image_path: str, palmistry_code_dir: str) -> dict:
    """
    Runs the real palmistry pipeline against `image_path` and returns:
      - palm_success: bool
      - palm_text: dict[str, {"description": str, "finding": str}] | None
      - palm_error: str | None
      - result_image_path: str | None  (the annotated result.jpg)
    """
    code_dir = Path(palmistry_code_dir).resolve()
    input_dir = code_dir / "input"
    results_dir = code_dir / "results"
    input_dir.mkdir(parents=True, exist_ok=True)

    filename = Path(image_path).name
    shutil.copy(image_path, input_dir / filename)

    try:
        read_palm_module = _get_read_palm_module(str(code_dir))
    except Exception as e:
        return _failure(f"Failed to import palmistry pipeline from {code_dir}: {e}")

    original_cwd = Path.cwd()
    try:
        os.chdir(code_dir)
        read_palm_module.main(filename)
    except Exception as e:
        return _failure(f"Palmistry pipeline raised an exception: {e}")
    finally:
        os.chdir(original_cwd)

    interpretation_json = results_dir / "palm_interpretation.json"
    if not interpretation_json.exists():
        return _failure("Pipeline ran but produced no results/palm_interpretation.json")

    with open(interpretation_json) as f:
        palm_text = json.load(f)

    if palm_text is None:
        # read_palm.py writes `null` when warp() fails or fewer than 3 lines
        # are detected — i.e. the image genuinely couldn't be read.
        return _failure("Palm lines not properly detected in this image. Try a clearer, well-lit photo.")

    result_image_path = results_dir / "result.jpg"
    return {
        "palm_success": True,
        "palm_text": palm_text,
        "palm_error": None,
        "result_image_path": str(result_image_path) if result_image_path.exists() else None,
    }


def _failure(reason: str) -> dict:
    return {"palm_success": False, "palm_text": None, "palm_error": reason, "result_image_path": None}
