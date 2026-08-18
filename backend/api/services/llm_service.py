import os
import json
import urllib.request
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class LLMService:
    def __init__(self):
        pass

    def generate_reading(self, palm_data: dict, tarot_cards: list, user_goal: str) -> dict:
        load_dotenv()
        api_key = os.getenv("GEMINI_API_KEY")
        
        # We need to return a structured dictionary since the frontend expects JSON now.
        fallback_response = {
            "personality": "Reflective and analytical.",
            "relationships": "Values deep connections.",
            "career": "Driven by purpose.",
            "life_trends": "A period of transition and growth.",
            "future_reflection": "May suggest new opportunities on the horizon.",
            "overall_guidance": "Trust your intuition."
        }
        
        if not api_key or api_key == "your_actual_api_key_here":
            return fallback_response
            
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
        
        lines_text = []
        for line_name, data in palm_data.get("lines", {}).items():
            if data.get("detected"):
                lines_text.append(f"- {line_name.replace('_', ' ').title()}: Length: {data.get('length')}px, Curvature Score: {data.get('curvature')}, Branches: {data.get('branches')}, Thickness: {data.get('thickness')}")
                
        palm_shape = palm_data.get("palm_shape", {}).get("type", "Unknown")
        shape_reasoning = ", ".join(palm_data.get("palm_shape", {}).get("reasoning_features", []))
        finger_type = palm_data.get("finger_structure", {}).get("type", "Unknown")
        
        tarot_text = []
        for card in tarot_cards:
            tarot_text.append(f"- {card.get('name')} ({card.get('arcana')} Arcana): Keywords: {', '.join(card.get('keywords', []))}. Meaning: {card.get('meaning')}")

        prompt = f"""
        You are an expert, highly intuitive AI Palmistry and Tarot reader. 
        
        The user's stated spiritual goal is: "{user_goal}".
        
        I have analyzed their palm image using an advanced MediaPipe & OpenCV Computer Vision pipeline. The following exact mathematical features were extracted from their hand:
        - Handedness: {palm_data.get('handedness')}
        - Elemental Palm Shape: {palm_shape} (Calculated via: {shape_reasoning})
        - Finger Structure: {finger_type}
        - Detected Major Lines (with exact mathematical metrics):
        {chr(10).join(lines_text)}

        Additionally, the following Tarot cards were drawn for them:
        {chr(10).join(tarot_text)}
        
        Please provide a cohesive, deeply personalized reading specifically addressing their spiritual goal. 
        Blend the exact mathematical insights from the palm features (e.g., mention how their specific number of branches or precise curve score influences the reading) with the symbolic meanings of the drawn Tarot cards.
        
        CRITICAL INSTRUCTIONS FOR HIGH DIVERSITY:
        1. DO NOT give generic or repetitive answers! Every single hand is mathematically unique. If a line has 5 branches vs 0 branches, or a curvature of 100 vs 5, the reading MUST be drastically different.
        2. Explicitly reference the mathematical uniqueness of their hand in the reading (e.g., "The highly branched structure of your life line...", or "The stark thickness of your fate line...").
        3. Do NOT claim guaranteed future events (e.g., "You will get married" or "You will get a new job"). Use language such as "may suggest", "potential opportunity", "reflects a tendency towards".
        4. The system is for spiritual reflection, inspiration, and self-discovery.
        
        Respond ONLY with a valid JSON object matching this exact schema:
        {{
            "personality": "string",
            "relationships": "string",
            "career": "string",
            "life_trends": "string",
            "future_reflection": "string",
            "overall_guidance": "string"
        }}
        """
        
        data = {
            "contents": [{
                "parts":[{"text": prompt}]
            }],
            "generationConfig": {
                "response_mime_type": "application/json"
            }
        }
        
        req = urllib.request.Request(
            api_url, 
            data=json.dumps(data).encode('utf-8'), 
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
                text_response = result['candidates'][0]['content']['parts'][0]['text']
                return json.loads(text_response)
        except Exception as e:
            print(f"LLM API Error: {e}")
            return fallback_response

    def chat_with_reading(self, reading_data: dict, user_question: str) -> str:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key == "your_actual_api_key_here":
            return "I am currently running in offline mode and cannot answer this question."
            
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
        
        prompt = f"""
        You are an expert AI Palmistry and Tarot reader. 
        You have just completed a reading for this user.
        
        Here is the JSON summary of their complete reading:
        {json.dumps(reading_data)}
        
        The user has asked the following follow-up question regarding their reading:
        "{user_question}"
        
        Provide a thoughtful, intuitive, and highly personalized answer based ONLY on the data in their reading summary.
        Keep the response conversational, insightful, and under 150 words.
        """
        
        data = {
            "contents": [{
                "parts":[{"text": prompt}]
            }]
        }
        
        req = urllib.request.Request(
            api_url, 
            data=json.dumps(data).encode('utf-8'), 
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
                return result['candidates'][0]['content']['parts'][0]['text']
        except Exception as e:
            print(f"LLM Chat Error: {e}")
            return "I am having trouble connecting to my higher consciousness right now. Please try again."

llm_service = LLMService()
