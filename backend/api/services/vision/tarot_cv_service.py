import random
import cv2
import numpy as np
import base64
from api.models import TarotCard

class TarotCVService:
    def __init__(self):
        pass

    def detect_cards(self, image_bytes: bytes, num_cards: int = 3) -> dict:
        """
        Simulates an Object Detection API that identifies physical tarot cards from a photo.
        Returns the recognized cards, their orientation, and a marked image with bounding boxes.
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"error": "Invalid image format."}
            
        height, width = img.shape[:2]
        
        # Simulate selecting `num_cards` random cards to represent the detected objects
        all_cards = list(TarotCard.objects.all())
        if len(all_cards) < num_cards:
            return {"error": "Not enough cards in database."}
            
        detected_cards = random.sample(all_cards, num_cards)
        
        results = []
        
        # Draw simulated bounding boxes on the image
        marked_img = img.copy()
        
        # Calculate roughly even spacing for the bounding boxes horizontally
        card_w = int(width / (num_cards + 1))
        card_h = int(card_w * 1.7) # Standard tarot ratio
        y_start = int((height - card_h) / 2)
        
        for i, card in enumerate(detected_cards):
            orientation = random.choice(["upright", "reversed"])
            
            # Simulated bounding box coordinates
            x1 = int((i + 0.5) * card_w)
            y1 = y_start + random.randint(-20, 20) # slight offset
            x2 = x1 + card_w
            y2 = y1 + card_h
            
            # Ensure within bounds
            x1 = max(0, x1)
            y1 = max(0, y1)
            x2 = min(width, x2)
            y2 = min(height, y2)
            
            cv2.rectangle(marked_img, (x1, y1), (x2, y2), (0, 255, 0), 4)
            label = f"{card.name} ({orientation})"
            cv2.putText(marked_img, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            
            results.append({
                "card_id": card.id,
                "name": card.name,
                "orientation": orientation,
                "confidence": round(random.uniform(0.85, 0.99), 2)
            })
            
        _, buffer = cv2.imencode('.jpg', marked_img)
        marked_image_b64 = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
        
        return {
            "success": True,
            "detected_cards": results,
            "marked_image": marked_image_b64
        }

tarot_cv_service = TarotCVService()
