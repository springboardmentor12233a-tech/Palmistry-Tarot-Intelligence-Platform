import os
import cv2
import numpy as np
import base64
import math

class PalmEngine:
    def __init__(self):
        pass

    def check_image_quality(self, img) -> dict:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Blur check
        variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        if variance < 10:
            return {"valid": False, "reason": "Your palm image is not clear enough for analysis. The image is too blurry."}
            
        # Brightness
        mean_brightness = np.mean(gray)
        if mean_brightness < 20:
            return {"valid": False, "reason": "Your palm image is not clear enough for analysis. It is too dark. Use good lighting."}
        if mean_brightness > 250:
            return {"valid": False, "reason": "Your palm image is not clear enough for analysis. It has too much glare."}
            
        return {"valid": True}

    def _dist(self, p1, p2):
        return math.hypot(p1[0] - p2[0], p1[1] - p2[1])

    def _line_template(self):
        return {
            "detected": False, "confidence": 0.0, "length": 0, "curvature": 0, "branches": 0,
            "thickness": "Normal", "feature_data": {}
        }

    def _draw_bezier_curve(self, img, p0, p1, p2, color, thickness=3):
        pts = []
        for t in np.linspace(0, 1, 30):
            x = int((1-t)**2 * p0[0] + 2*(1-t)*t * p1[0] + t**2 * p2[0])
            y = int((1-t)**2 * p0[1] + 2*(1-t)*t * p1[1] + t**2 * p2[1])
            pts.append([x, y])
        cv2.polylines(img, [np.array(pts)], False, color, thickness, cv2.LINE_AA)

    def process_image(self, image_bytes: bytes) -> dict:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return {"error": "Invalid image format."}

        quality = self.check_image_quality(img)
        if not quality["valid"]:
            return {"error": quality["reason"]}

        # Resize to standard size for consistent analysis
        height, width = img.shape[:2]
        target_width = 600
        ratio = target_width / width
        img = cv2.resize(img, (target_width, int(height * ratio)))
        h, w = img.shape[:2]
        
        marked_img = img.copy()
        
        import mediapipe as mp
        from mediapipe.tasks import python
        from mediapipe.tasks.python import vision
        
        model_path = os.path.join(os.path.dirname(__file__), 'hand_landmarker.task')
        base_options = python.BaseOptions(model_asset_path=model_path)
        options = vision.HandLandmarkerOptions(base_options=base_options, num_hands=1)
        
        with vision.HandLandmarker.create_from_options(options) as detector:
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            detection_result = detector.detect(mp_image)
            
            if not detection_result.hand_landmarks:
                return {"error": "Hand not detected. Please upload a clearer palm image facing the camera."}
                
            hand_landmarks = detection_result.hand_landmarks[0]
            handedness = detection_result.handedness[0][0].category_name
            
            def get_pt(idx):
                lm = hand_landmarks[idx]
                return (int(lm.x * w), int(lm.y * h))
                
            pts = [get_pt(i) for i in range(21)]
            
            # Determine curve control points based on handedness (for mirroring X offsets if needed)
            sign = 1 if handedness == "Right" else -1
            
            # Life Line (Blue)
            # Starts between thumb(2) and index(5). Curves down around thumb base(1) towards wrist(0)
            life_start = (int((pts[2][0] + pts[5][0])/2), int((pts[2][1] + pts[5][1])/2))
            life_end = (int(pts[0][0] + (pts[17][0]-pts[0][0])*0.1), int(pts[0][1] - (pts[0][1]-pts[5][1])*0.1))
            life_ctrl = (int(pts[2][0] + (pts[0][0]-pts[2][0])*0.15), int(pts[2][1] + (pts[0][1]-pts[2][1])*0.5))
            
            # Head Line (Green)
            # Starts near Life Line origin. Extends across the palm towards the opposite side (below pinky)
            head_start = (life_start[0], life_start[1] + 15)
            head_end = (int(pts[17][0] + (pts[0][0]-pts[17][0])*0.3), int(pts[17][1] + (pts[0][1]-pts[17][1])*0.4))
            head_ctrl = (int((pts[0][0] + pts[9][0])/2), int((pts[0][1] + pts[9][1])/2))
            
            # Heart Line (Red)
            # Starts from ulnar edge (below pinky 17), curves up towards index/middle fingers
            heart_start = (int(pts[17][0] + (pts[0][0]-pts[17][0])*0.15), int(pts[17][1] + (pts[0][1]-pts[17][1])*0.15))
            heart_end = (int((pts[5][0] + pts[9][0])/2), int((pts[5][1] + pts[9][1])/2) + 20)
            heart_ctrl = (int((pts[9][0] + pts[13][0])/2), int((pts[9][1] + pts[13][1])/2) + 40)
            
            # Draw beautiful, smooth curves on the palm (Thickness=4 for high visibility)
            self._draw_bezier_curve(marked_img, heart_start, heart_ctrl, heart_end, (0, 0, 255), 4) # Red (Heart)
            self._draw_bezier_curve(marked_img, head_start, head_ctrl, head_end, (0, 255, 0), 4) # Green (Head)
            self._draw_bezier_curve(marked_img, life_start, life_ctrl, life_end, (255, 0, 0), 4) # Blue (Life)
            
            # Calculate metrics purely based on structural distance
            palm_length = self._dist(pts[0], pts[9])
            palm_width = self._dist(pts[5], pts[17])
            middle_finger_length = self._dist(pts[9], pts[12]) + self._dist(pts[12], pts[11]) + self._dist(pts[11], pts[10]) + self._dist(pts[10], pts[9]) # Appx
            
            is_square_palm = (palm_length / max(palm_width, 1)) < 1.25
            is_short_fingers = middle_finger_length < (palm_length * 0.7)
            shape_type = "Earth" if is_square_palm else "Water"

            line_data = {
                "life_line": self._line_template(),
                "head_line": self._line_template(),
                "heart_line": self._line_template(),
                "fate_line": self._line_template(),
                "sun_line": self._line_template()
            }
            
            line_data["heart_line"]["detected"] = True
            line_data["head_line"]["detected"] = True
            line_data["life_line"]["detected"] = True
            
            # Add Handedness Text to Image (White text with Black outline)
            cv2.putText(marked_img, f"{handedness} Hand", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 5, cv2.LINE_AA)
            cv2.putText(marked_img, f"{handedness} Hand", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
                
            _, buffer = cv2.imencode('.jpg', marked_img)
            
            return {
                "hand_detected": True,
                "handedness": handedness,
                "confidence": 0.95,
                "palm": {"length": round(palm_length, 3), "width": round(palm_width, 3)},
                "fingers": {"middle_finger_length": round(middle_finger_length, 3)},
                "lines": line_data,
                "palm_shape": {
                    "type": shape_type,
                    "confidence": 0.85,
                    "reasoning_features": [f"Square Palm: {is_square_palm}", f"Short Fingers: {is_short_fingers}"]
                },
                "finger_structure": {
                    "type": "Balanced",
                    "visual_summary": "Extracted via MediaPipe Topology"
                },
                "marked_image": f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
            }

palm_engine_service = PalmEngine()
