from pydantic import BaseModel, Field
from typing import List, Optional
from .llm_service import llm_service_instance
import json

class SectionInsight(BaseModel):
    summary: str
    key_traits: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    growth_areas: List[str] = Field(default_factory=list)

class RelationshipInsight(BaseModel):
    summary: str
    themes: List[str]
    reflection_points: List[str]

class CareerInsight(BaseModel):
    summary: str
    themes: List[str]
    opportunities: List[str]
    growth_areas: List[str]

class LifeDirectionInsight(BaseModel):
    summary: str
    themes: List[str]

class PersonalGrowthInsight(BaseModel):
    summary: str
    actions: List[str]

class SynthesisOutput(BaseModel):
    overall_insight: str
    personality: SectionInsight
    relationships: RelationshipInsight
    career: CareerInsight
    life_direction: LifeDirectionInsight
    personal_growth: PersonalGrowthInsight
    opportunities: List[str]
    challenges: List[str]
    reflection_questions: List[str]
    overall_guidance: str

class CombinedReadingService:
    def synthesize(self, palm_data: dict, tarot_data: dict, user_context: dict = None):
        system_prompt = """
        You are an AI providing spiritual and reflective synthesis between Palmistry and Tarot.
        You will receive extracted features and independent interpretations from both a Palm reading and a Tarot reading.
        
        CRITICAL RULES:
        1. Identify common themes between the two systems without claiming scientific correlation.
        2. NEVER claim supernatural certainty or guaranteed future events.
        3. Do not generate exact death dates, guaranteed marriage dates, or guaranteed financial outcomes.
        4. Use non-deterministic, reflective language ("may suggest", "could reflect", "traditionally interpreted as").
        5. Provide practical, grounding reflection questions.
        6. Return the exact JSON structure required by the schema. All fields are strictly required.
        """
        
        user_prompt = f"""
        Synthesize the following readings:
        
        === PALM DATA ===
        {json.dumps(palm_data, indent=2)}
        
        === TAROT DATA ===
        {json.dumps(tarot_data, indent=2)}
        
        === USER CONTEXT ===
        {json.dumps(user_context or {}, indent=2)}
        
        Provide the synthesized insights combining both modalities.
        """
        
        return llm_service_instance.generate_structured_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            pydantic_model=SynthesisOutput,
            max_retries=2
        )

synthesis_engine_service = CombinedReadingService()
