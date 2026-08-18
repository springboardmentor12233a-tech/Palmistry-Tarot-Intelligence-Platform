import os
import shutil
import sys
import threading
from pathlib import Path
from uuid import uuid4

from app.core.config import get_settings
from app.services.groq_client import ask_groq


_PALM_LOCK = threading.Lock()


def _line_length_from_text(text: str) -> str:
    lowered = text.lower()
    if " is long" in lowered:
        return "long"
    if " is short" in lowered:
        return "short"
    return "unknown"


def analyze_palm_image(input_image_path: Path) -> dict:
    settings = get_settings()
    code_dir = settings.palmistry_code_dir
    run_id = uuid4().hex
    input_name = f"{run_id}{input_image_path.suffix.lower() or '.jpg'}"
    repo_input_path = code_dir / "input" / input_name

    if not (code_dir / "read_palm.py").exists():
        raise FileNotFoundError("Palmistry repo is missing external_repos/palmistry/code/read_palm.py")

    with _PALM_LOCK:
        shutil.copy2(input_image_path, repo_input_path)
        previous_cwd = Path.cwd()
        previous_path = list(sys.path)
        try:
            os.chdir(code_dir)
            sys.path.insert(0, str(code_dir))
            from detection import detect
            from measurement import measure
            from model import UNet
            from rectification import warp
            from classification import classify
            from tools import remove_background, resize, save_result
            import torch

            resize_value = 256
            results_dir = code_dir / "results"
            results_dir.mkdir(exist_ok=True)

            path_to_input_image = Path("input") / input_name
            path_to_clean_image = Path("results/palm_without_background.jpg")
            path_to_warped_image = Path("results/warped_palm.jpg")
            path_to_warped_image_clean = Path("results/warped_palm_clean.jpg")
            path_to_warped_image_mini = Path("results/warped_palm_mini.jpg")
            path_to_warped_image_clean_mini = Path("results/warped_palm_clean_mini.jpg")
            path_to_palmline_image = Path("results/palm_lines.png")
            path_to_model = Path("checkpoint/checkpoint_aug_epoch70.pth")
            path_to_result = Path("results/result.jpg")

            remove_background(str(path_to_input_image), str(path_to_clean_image))
            warp_result = warp(str(path_to_input_image), str(path_to_warped_image))
            if warp_result is None:
                raise ValueError("Palm landmarks could not be detected clearly.")

            remove_background(str(path_to_warped_image), str(path_to_warped_image_clean))
            resize(
                str(path_to_warped_image),
                str(path_to_warped_image_clean),
                str(path_to_warped_image_mini),
                str(path_to_warped_image_clean_mini),
                resize_value,
            )

            net = UNet(n_channels=3, n_classes=1)
            net.load_state_dict(torch.load(str(path_to_model), map_location=torch.device("cpu")))
            detect(net, str(path_to_warped_image_clean), str(path_to_palmline_image), resize_value)
            lines = classify(str(path_to_palmline_image))
            print(lines)
            image, contents = measure(str(path_to_warped_image_mini), lines)
            if image is None or contents is None:
                raise ValueError("Palm lines were not detected clearly enough.")

            save_result(image, contents, resize_value, str(path_to_result))

            output_dir = settings.generated_outputs_dir / f"palm_{run_id}"
            output_dir.mkdir(parents=True, exist_ok=True)
            copied_input = output_dir / input_image_path.name
            copied_lines = output_dir / "palm_lines.png"
            copied_result = output_dir / "result.jpg"
            shutil.copy2(input_image_path, copied_input)
            shutil.copy2(code_dir / path_to_palmline_image, copied_lines)
            shutil.copy2(code_dir / path_to_result, copied_result)

        finally:
            os.chdir(previous_cwd)
            sys.path = previous_path
            repo_input_path.unlink(missing_ok=True)

        line_result = {
            "heart_line": _line_length_from_text(contents[1]),
            "head_line": _line_length_from_text(contents[3]),
            "life_line": _line_length_from_text(contents[5]),
        }
    prompt = f"""
You are an expert palm reader.

Palm Analysis:
{line_result}

Give a friendly palmistry interpretation in simple English.

Explain:
- Heart Line
- Head Line
- Life Line
- Overall Personality Summary

IMPORTANT FORMATTING RULES:
- Return ONLY plain text.
- Do NOT use Markdown.
- Do NOT use tables.
- Do NOT use the "|" character.
- Do NOT use asterisks.
- Do NOT use hashtags.
- Do NOT use bullet points.
- Do NOT use markdown headings.
- Write each section as a normal paragraph.
- Keep the language natural, warm, and easy to understand.
- Do not make medical, financial, legal, or guaranteed predictions.
- This is for entertainment and self-reflection only.

Use this exact structure:

Heart Line:
[paragraph]

Head Line:
[paragraph]

Life Line:
[paragraph]

Overall Personality:
[paragraph]
"""
    interpretation = ask_groq(
        prompt=prompt,
        system_prompt="You are a professional palmistry assistant for entertainment-only readings.",
        max_tokens=900,
    )

    return {
        "lines": line_result,
        "interpretation": interpretation,
        "input_image_path": str(copied_input),
        "palm_lines_image_path": str(copied_lines),
        "annotated_result_path": str(copied_result),
    }
