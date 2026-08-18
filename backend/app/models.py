import datetime as dt
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(180), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(30), default="user")
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    readings = relationship("Reading", back_populates="owner", cascade="all, delete-orphan")
    messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")


class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(20), nullable=False)  # palm | tarot | combined
    title = Column(String(200), default="")
    input_data = Column(Text, default="{}")     # JSON string: features / drawn cards
    result_markdown = Column(Text, default="")
    images = Column(Text, default="{}")         # JSON string: {roi, skeleton, lines}
    pdf_path = Column(String(255), nullable=True)
    parent_palm_id = Column(Integer, nullable=True)
    parent_tarot_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    owner = relationship("User", back_populates="readings")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reading_id = Column(Integer, ForeignKey("readings.id"), nullable=True)
    role = Column(String(20), nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    user = relationship("User", back_populates="messages")
