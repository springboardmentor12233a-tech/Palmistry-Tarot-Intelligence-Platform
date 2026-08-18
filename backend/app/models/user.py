from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..database.connection import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    spiritual_goals = Column(String)
    role = Column(String, default="User")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
