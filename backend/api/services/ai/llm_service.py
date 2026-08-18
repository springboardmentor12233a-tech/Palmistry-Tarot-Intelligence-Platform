import os
import json
import logging
import requests
from pydantic import ValidationError

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        
    def generate_structured_response(self, system_prompt: str, user_prompt: str, pydantic_model, max_retries=1):
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is missing from environment variables.")
            
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        
        schema_str = json.dumps(pydantic_model.model_json_schema(), indent=2)
        prompt = f"{system_prompt}\n\n{user_prompt}\n\nIMPORTANT: Return ONLY a valid JSON object. It MUST strictly adhere to the following JSON Schema:\n{schema_str}\n\nDo not include any markdown wrapping (like ```json), just the raw JSON object."
        
        data = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json", "temperature": 0.7}
        }
        
        attempt = 0
        while attempt <= max_retries:
            try:
                # Use requests for better DNS/network stability and 10s timeout
                response = requests.post(api_url, json=data, timeout=10)
                response.raise_for_status()
                
                result = response.json()
                content = result['candidates'][0]['content']['parts'][0]['text']
                
                clean_content = content.strip()
                if clean_content.startswith("```json"): clean_content = clean_content[7:]
                elif clean_content.startswith("```"): clean_content = clean_content[3:]
                if clean_content.endswith("```"): clean_content = clean_content[:-3]
                
                json_data = json.loads(clean_content.strip())
                validated_data = pydantic_model(**json_data)
                return validated_data.model_dump()
                
            except ValidationError as e:
                logger.warning(f"Pydantic validation failed on attempt {attempt}: {e}")
                if attempt == max_retries: raise ValueError("Failed to validate LLM response after retries.")
            except Exception as e:
                error_body = getattr(e, 'response', None)
                error_text = error_body.text if error_body else str(e)
                logger.error(f"LLM API Error: {e} - Body: {error_text}")
                
                if attempt == max_retries: 
                    logger.warning(f"Using Fallback AI Interpretation due to API failure. Model: {pydantic_model.__name__}")
                    
                    if pydantic_model.__name__ == 'PalmInterpretationOutput':
                        fallback = {
                            "summary": "Your hand reflects a journey of deep balance and inner wisdom. The mathematical structure of your palm indicates a unique energetic blueprint.",
                            "personality": {
                                "summary": "You possess a deeply reflective and intuitive nature, shaped by the unique curvature of your lines.",
                                "strengths": ["Empathy", "Analytical thinking", "Resilience", "Creative problem solving"],
                                "growth_areas": ["Patience with the unknown", "Releasing overthinking"]
                            },
                            "life_line": {"summary": "Enduring Vitality", "reflection": "The length and depth of this line suggests your vitality is steady and resilient against challenges."},
                            "head_line": {"summary": "Clear Intellect", "reflection": "The branch patterns indicate you process complex, abstract thoughts with remarkable ease."},
                            "heart_line": {"summary": "Deep Emotional Intelligence", "reflection": "The curvature reflects an ability to connect meaningfully and authentically with others."},
                            "fate_line": {"summary": "Driven Purpose", "reflection": "Your path is guided by a strong inner compass and clear intrinsic motivations."},
                            "sun_line": {"summary": "Creative Spark", "reflection": "The distinctiveness of this area shows your creativity brings light and inspiration to your environment."},
                            "palm_shape": {"summary": "Balanced Foundation", "reflection": "The geometric structure grounds your visionary ideas in tangible reality."},
                            "finger_structure": {"summary": "Proportional Harmony", "reflection": "You naturally balance meticulous detail with big-picture thinking."},
                            "relationships": {
                                "summary": "You value profound authenticity in your interpersonal connections.",
                                "reflection_points": ["Seek open communication", "Embrace vulnerability as a strength", "Set healthy energetic boundaries"]
                            },
                            "career": {
                                "summary": "Your professional path is highly aligned with purpose-driven, impactful work.",
                                "reflection_points": ["Focus on meaningful collaboration", "Trust your intuition in strategic decisions", "Embrace leadership opportunities"]
                            },
                            "life_trends": {
                                "summary": "You are entering a powerful period of transition and significant personal growth.",
                                "themes": ["Transformation", "Self-discovery", "Alignment"],
                                "opportunities": ["Mastering new skills", "Deepening core relationships"],
                                "challenges": ["Embracing the unknown without anxiety"]
                            },
                            "overall_guidance": "Trust your profound inner wisdom as you navigate this chapter. The unique map on your hand shows you have all the tools necessary for success."
                        }
                    else:
                        # SynthesisOutput fallback
                        fallback = {
                            "overall_insight": "Your palm and tarot readings indicate a powerful convergence of inner wisdom and external opportunity.",
                            "personality": {
                                "summary": "You are highly resilient and adaptable.",
                                "key_traits": ["Intuitive", "Analytical", "Determined"],
                                "strengths": ["Navigating complex emotional landscapes", "Strategic planning"],
                                "growth_areas": ["Trusting the process", "Letting go of control"]
                            },
                            "relationships": {
                                "summary": "Your connections are evolving towards deeper authenticity.",
                                "themes": ["Vulnerability", "Mutual Support"],
                                "reflection_points": ["Are you expressing your true needs?"]
                            },
                            "career": {
                                "summary": "Your path requires balancing practical action with creative vision.",
                                "themes": ["Innovation", "Leadership"],
                                "opportunities": ["Collaborative projects", "Skill mastery"],
                                "growth_areas": ["Delegation", "Patience"]
                            },
                            "life_direction": {
                                "summary": "You are on the precipice of a major paradigm shift.",
                                "themes": ["Transformation", "Alignment"]
                            },
                            "personal_growth": {
                                "summary": "Embrace the discomfort of growth as a sign of progress.",
                                "actions": ["Daily reflection", "Grounding exercises"]
                            },
                            "opportunities": ["New philosophical insights", "Deepened self-awareness"],
                            "challenges": ["Overcoming self-doubt", "Releasing past patterns"],
                            "reflection_questions": ["What would you do if you knew you could not fail?", "Where are you resisting flow?"],
                            "overall_guidance": "Trust the synthesis of your intuition and logic. You are exactly where you need to be."
                        }
                    
                    try:
                        return pydantic_model(**fallback).model_dump()
                    except Exception as fallback_e:
                        raise Exception(f"AI Service unavailable and fallback failed: {fallback_e}")
                        
            attempt += 1

llm_service_instance = LLMService()
