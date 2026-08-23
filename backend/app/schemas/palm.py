from typing import Dict, List, Optional
from pydantic import BaseModel


class PalmLineDetail(BaseModel):
    name: str
    length: str = "medium"  # short, medium, long, extended
    depth: str = "moderate"  # faint, moderate, deep, prominent
    curvature: str = "curved"  # straight, gentle, curved, forked, chained
    confidence: int = 90  # 0 - 100
    summary: str
    biometric_indicators: List[str] = []


class PalmLines(BaseModel):
    heart_line: PalmLineDetail
    head_line: PalmLineDetail
    life_line: PalmLineDetail
    fate_line: Optional[PalmLineDetail] = None
    sun_line: Optional[PalmLineDetail] = None


class MountProminence(BaseModel):
    venus: int = 80
    jupiter: int = 85
    saturn: int = 75
    apollo: int = 80
    mercury: int = 75
    mars: int = 80
    luna: int = 80


class PalmAnalysisResult(BaseModel):
    id: str
    image_url: Optional[str] = None
    hand_type: str = "Fire Hand"  # Fire Hand, Earth Hand, Air Hand, Water Hand
    primary_element: str = "Fire"  # Fire, Earth, Air, Water
    mount_prominence: Dict[str, int]
    lines: PalmLines
    contents: List[str]
    confidence_score: int
    analyzed_at: str
