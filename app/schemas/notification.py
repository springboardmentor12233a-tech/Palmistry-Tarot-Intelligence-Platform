from typing import Optional
from pydantic import BaseModel


class NotificationItem(BaseModel):
    id: str
    type: str  # 'insight_update' | 'reading_reminder' | 'celestial_transit' | 'system'
    title: str
    message: str
    date: str
    read: bool = False
    link: Optional[str] = None
