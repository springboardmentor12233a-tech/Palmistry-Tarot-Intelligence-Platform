import random
from api.models import TarotCard

SPREADS = {
    "single_card": {
        "name": "Single Card Reading",
        "description": "A quick draw for immediate focus or daily reflection.",
        "positions": [
            {"id": 1, "name": "Focus", "description": "The central theme or answer."}
        ]
    },
    "three_card": {
        "name": "Three Card Reading",
        "description": "A reflective three-stage reading for exploring patterns, current themes and possible directions.",
        "positions": [
            {"id": 1, "name": "Past", "description": "Influences from the past."},
            {"id": 2, "name": "Present", "description": "Current state of affairs."},
            {"id": 3, "name": "Future", "description": "Potential outcome or direction."}
        ]
    },
    "relationship": {
        "name": "Relationship Spread",
        "description": "Explore the dynamics between two people.",
        "positions": [
            {"id": 1, "name": "You", "description": "Your role and feelings."},
            {"id": 2, "name": "Other Person", "description": "Their role and feelings."},
            {"id": 3, "name": "Connection", "description": "The dynamic between you."},
            {"id": 4, "name": "Challenge", "description": "Current obstacles."},
            {"id": 5, "name": "Guidance", "description": "Advice for the relationship."}
        ]
    },
    "career": {
        "name": "Career Spread",
        "description": "Insight into professional paths and opportunities.",
        "positions": [
            {"id": 1, "name": "Current Energy", "description": "Your current career situation."},
            {"id": 2, "name": "Strength", "description": "Your professional assets."},
            {"id": 3, "name": "Challenge", "description": "Obstacles to overcome."},
            {"id": 4, "name": "Opportunity", "description": "Potential for growth."},
            {"id": 5, "name": "Guidance", "description": "Advice for your career path."}
        ]
    },
    "celtic_cross": {
        "name": "Celtic Cross Spread",
        "description": "A comprehensive 10-card reading for deep insight.",
        "positions": [
            {"id": 1, "name": "Present", "description": "The current situation."},
            {"id": 2, "name": "Challenge", "description": "The immediate challenge."},
            {"id": 3, "name": "Past", "description": "Recent past events."},
            {"id": 4, "name": "Recent Past", "description": "Foundational past."},
            {"id": 5, "name": "Goal/Destiny", "description": "The best possible outcome."},
            {"id": 6, "name": "Future", "description": "Immediate future."},
            {"id": 7, "name": "You", "description": "Your current attitude."},
            {"id": 8, "name": "Environment", "description": "External influences."},
            {"id": 9, "name": "Hopes and Fears", "description": "Internal state."},
            {"id": 10, "name": "Outcome", "description": "Long-term resolution."}
        ]
    },
    "life_path": {
        "name": "Life Path Spread",
        "description": "Explore your overarching journey and purpose.",
        "positions": [
            {"id": 1, "name": "Current Path", "description": "Where you are now."},
            {"id": 2, "name": "Challenge", "description": "What blocks your path."},
            {"id": 3, "name": "Strength", "description": "Your inner resources."},
            {"id": 4, "name": "Opportunity", "description": "What you can embrace."},
            {"id": 5, "name": "Growth", "description": "Area for personal development."},
            {"id": 6, "name": "Guidance", "description": "Overall advice."}
        ]
    }
}

class TarotEngine:
    def get_spreads(self):
        return SPREADS

    def shuffle_deck(self):
        card_ids = list(TarotCard.objects.values_list('id', flat=True))
        random.shuffle(card_ids)
        return card_ids

    def assign_orientation(self):
        return random.choice(["upright", "reversed"])
        
tarot_engine_service = TarotEngine()
