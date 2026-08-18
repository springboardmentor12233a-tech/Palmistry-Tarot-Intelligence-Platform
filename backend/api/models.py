from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    spiritual_goals = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=50, default='User')
    last_active = models.DateTimeField(auto_now=True)
    is_online = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class TarotCard(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    arcana = models.CharField(max_length=50)
    suit = models.CharField(max_length=50, blank=True, null=True)
    number = models.IntegerField(default=0)
    image_url = models.URLField(max_length=500)
    keywords = models.JSONField(default=list)
    upright_meaning = models.TextField()
    reversed_meaning = models.TextField()
    general_meaning = models.TextField(blank=True)
    relationship_meaning = models.TextField(blank=True)
    career_meaning = models.TextField(blank=True)
    personal_growth_meaning = models.TextField(blank=True)

    def __str__(self):
        return self.name

class TarotReading(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tarot_readings')
    reading_type = models.CharField(max_length=100)
    question = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    overall_interpretation = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.reading_type} - {self.created_at.strftime('%Y-%m-%d')}"

class TarotReadingCard(models.Model):
    reading = models.ForeignKey(TarotReading, on_delete=models.CASCADE, related_name='cards')
    card = models.ForeignKey(TarotCard, on_delete=models.CASCADE)
    position = models.CharField(max_length=100)
    orientation = models.CharField(max_length=50)
    interpretation = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.card.name} ({self.orientation}) at {self.position}"

class AIInterpretation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    reading_id = models.CharField(max_length=255, null=True, blank=True)
    type = models.CharField(max_length=50)
    model_used = models.CharField(max_length=100)
    prompt_version = models.CharField(max_length=50, default='v1')
    input_hash = models.CharField(max_length=255)
    response_json = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class Reading(models.Model):
    STATUS_CHOICES = (
        ('started', 'Started'),
        ('palm_completed', 'Palm Completed'),
        ('tarot_completed', 'Tarot Completed'),
        ('ai_completed', 'AI Completed'),
        ('report_generated', 'Report Generated'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='readings')
    reading_type = models.CharField(max_length=100, default='combined')
    question = models.TextField(blank=True, null=True)
    
    palm_features = models.JSONField(blank=True, null=True)
    palm_interpretation = models.JSONField(blank=True, null=True)
    
    tarot_reading = models.ForeignKey('TarotReading', on_delete=models.SET_NULL, null=True, blank=True)
    
    synthesis_interpretation = models.JSONField(blank=True, null=True)
    overall_insight = models.TextField(blank=True, null=True)
    reading_confidence = models.FloatField(default=0.0)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='started')
    
    pdf_report_path = models.CharField(max_length=500, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.status} - {self.created_at.strftime('%Y-%m-%d')}"
