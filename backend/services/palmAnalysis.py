import sys
import json
import os
import urllib.request

# Suppress tensorflow/mediapipe verbose logging warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

try:
    import mediapipe as mp
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision
except ImportError as e:
    print(json.dumps({
        "success": False,
        "error": f"Missing required python libraries: {str(e)}. Please run pip install mediapipe."
    }))
    sys.exit(1)

def detect_hand_landmarks(image_path):
    if not os.path.exists(image_path):
        return {"success": False, "error": f"Image file not found: {image_path}"}

    # Ensure model file is downloaded
    model_path = os.path.join(os.path.dirname(__file__), 'hand_landmarker.task')
    if not os.path.exists(model_path):
        try:
            # print("Downloading hand_landmarker.task...", file=sys.stderr)
            url = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
            urllib.request.urlretrieve(url, model_path)
        except Exception as e:
            return {"success": False, "error": f"Failed to download MediaPipe model: {str(e)}"}

    try:
        # Configure HandLandmarker
        base_options = python.BaseOptions(model_asset_path=model_path)
        options = vision.HandLandmarkerOptions(
            base_options=base_options,
            num_hands=1,
            min_hand_detection_confidence=0.5
        )
        detector = vision.HandLandmarker.create_from_options(options)

        # Load image (MediaPipe expects RGB)
        image = mp.Image.create_from_file(image_path)

        # Detect landmarks
        detection_result = detector.detect(image)

        # Process results
        if not detection_result.hand_landmarks:
            return {
                "success": False,
                "error": "No hands detected in the uploaded image. Please ensure your palm is fully visible, flat, and well-lit."
            }

        # Extract landmarks of the first hand
        landmarks = []
        hand_landmarks = detection_result.hand_landmarks[0]
        for lm in hand_landmarks:
            landmarks.append({
                "x": float(lm.x),
                "y": float(lm.y),
                "z": float(lm.z)
            })

        return {
            "success": True,
            "landmarks": landmarks
        }

    except Exception as e:
        return {"success": False, "error": f"An error occurred during hand landmarks extraction: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No image path argument provided."}))
        sys.exit(1)

    image_path = sys.argv[1]
    result = detect_hand_landmarks(image_path)
    print(json.dumps(result))
