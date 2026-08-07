from typing import Literal

from pydantic import BaseModel


PalmLineLength = Literal["short", "long"]


class PalmAnalysisData(BaseModel):
    heart_line: PalmLineLength
    head_line: PalmLineLength
    life_line: PalmLineLength


class PalmDescriptions(BaseModel):
    heart_line: str
    head_line: str
    life_line: str


class PalmOutputFiles(BaseModel):
    result_image_url: str
    warped_palm_url: str
    palm_lines_url: str


class PalmAnalysisResponse(BaseModel):
    status: str
    message: str
    request_id: str
    original_filename: str
    palm_analysis: PalmAnalysisData
    descriptions: PalmDescriptions
    output_files: PalmOutputFiles