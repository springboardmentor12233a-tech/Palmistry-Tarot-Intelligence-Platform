from pydantic import BaseModel
from typing import List, Optional
from .llm_service import llm_service_instance
import json

class SectionReflection(BaseModel):
    summary: str
    reflection: str

class Personality(BaseModel):
    summary: str
    strengths: List[str]
    growth_areas: List[str]

class Relationships(BaseModel):
    summary: str
    reflection_points: List[str]

class Career(BaseModel):
    summary: str
    reflection_points: List[str]

class LifeTrends(BaseModel):
    summary: str
    themes: List[str]
    opportunities: List[str]
    challenges: List[str]

class PalmInterpretationOutput(BaseModel):
    summary: str
    personality: Personality
    life_line: SectionReflection
    head_line: SectionReflection
    heart_line: SectionReflection
    fate_line: SectionReflection
    sun_line: SectionReflection
    palm_shape: SectionReflection
    finger_structure: SectionReflection
    relationships: Relationships
    career: Career
    life_trends: LifeTrends
    overall_guidance: str

class PalmInterpretationService:
    def interpret(self, palm_features: dict, user_context: dict = None):
        system_prompt = """
        You are an AI providing spiritual and reflective palmistry interpretation.
        You will receive structured data extracted from a computer vision model regarding a user's palm features.
        
        CRITICAL RULES:
        1. Interpret ONLY the supplied structured features. Do not invent features.
        2. Follow traditional palmistry interpretation concepts.
        3. Distinguish observation from interpretation.
        4. NEVER claim scientific certainty, supernatural certainty, or guaranteed future events.
        5. NEVER diagnose medical conditions, predict exact dates (marriage, death), or guarantee wealth/job outcomes.
        6. Use reflective phrases like "traditionally interpreted as", "may suggest", "could reflect".
        7. Provide the output in the exact JSON structure requested. Ensure all fields are populated. If a feature is completely missing, provide a generic reflection about the mystery of the unknown.
        """
        
        user_prompt = f"""
        Interpret the following palm features:
        {json.dumps(palm_features, indent=2)}
        
        User Context (if any):
        {json.dumps(user_context or {}, indent=2)}
        
        Provide a detailed JSON response matching the required schema.
        """
        
        return llm_service_instance.generate_structured_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            pydantic_model=PalmInterpretationOutput
        )

palm_interpretation_service = PalmInterpretationService()
