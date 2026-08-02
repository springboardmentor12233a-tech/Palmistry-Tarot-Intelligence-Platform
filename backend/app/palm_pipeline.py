import os
import sys
import torch
import cv2
from PIL import Image, ImageDraw

# Make palmistry_core/code importable
CODE_DIR = os.path.join(os.path.dirname(__file__), "palmistry_core", "code")
sys.path.insert(0, CODE_DIR)

from model import UNet
from detection import detect
from rectification import warp, detect_landmarks
from classification import classify

device = torch.device("cpu")
_net = UNet(3, 1)
_checkpoint_path = os.path.join(CODE_DIR, "checkpoint", "checkpoint_aug_epoch70.pth")
_checkpoint = torch.load(_checkpoint_path, map_location=device)
_net.load_state_dict(_checkpoint)
_net.to(device)
_net.eval()


def analyze_palm(image_path, results_dir, resize_value=256):
    os.makedirs(results_dir, exist_ok=True)
    warped_path = os.path.join(results_dir, "warped_palm.jpg")
    pred_path = os.path.join(results_dir, "prediction.png")
    mini_path = os.path.join(results_dir, "warped_palm_mini.jpg")

    warp_result = warp(image_path, warped_path)
    if warp_result is None:
        return {"success": False, "error": "Could not detect hand landmarks in image.", "lines": {}, "result_image_path": None}

    Image.open(warped_path).resize((resize_value, resize_value), resample=Image.NEAREST).save(mini_path)

    detect(_net, warped_path, pred_path, resize_value)

    lines = classify(pred_path)
    if None in lines or len(lines) < 3:
        return {"success": False, "error": "Could not confidently identify all three major lines.", "lines": {}, "result_image_path": None}

    landmarks = detect_landmarks(warped_path)
    image = cv2.imread(warped_path)
    image_height, image_width = image.shape[:2]

    zero, one = landmarks[0].y, landmarks[1].y
    five, nine, thirteen = landmarks[5].x, landmarks[9].x, landmarks[13].x

    heart_thres_x = image_width * (1 - (nine + (five - nine) * 2 / 5))
    head_thres_x = image_width * (1 - (thirteen + (nine - thirteen) / 3))
    life_thres_y = image_height * (one + (zero - one) / 3)

    line_names = ["heart", "head", "life"]
    result = {"success": True, "error": None, "lines": {}}

    for name, line in zip(line_names, lines):
        points = [tuple(reversed(l[:2])) for l in line]
        length_px = len(points)

        if name == "heart":
            tip = points[0]
            relative = "long" if tip[0] < heart_thres_x else "short"
        elif name == "head":
            tip = points[-1]
            relative = "long" if tip[0] > head_thres_x else "short"
        else:
            tip = points[-1]
            relative = "long" if tip[1] > life_thres_y else "short"

        result["lines"][name] = {
            "length_px": length_px,
            "relative_length": relative,
            "points": points
        }

    im = Image.open(mini_path).convert("RGB")
    draw = ImageDraw.Draw(im)
    colors = {"heart": "red", "head": "green", "life": "blue"}
    for name in line_names:
        draw.line(result["lines"][name]["points"], fill=colors[name], width=2)

    result_image_path = os.path.join(results_dir, "annotated_palm.jpg")
    im.save(result_image_path)
    result["result_image_path"] = result_image_path

    return result