import os
import json
import random

CARDS_DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "tarot_cards.json")

# Complete Rider-Waite 78 Cards definition builder
def build_default_deck():
    major_arcana = [
        ("The Fool", "0", "Trump", ["beginnings", "innocence", "spontaneity", "free spirit"], 
         ["New beginnings", "Embracing pure potential", "Leap of faith", "Living in the moment"],
         ["Recklessness", "Risk taking", "Foolishness", "Naivety"],
         ["A surprise opportunity is on its way", "Trust the journey ahead"], "Air", "The Divine Explorer"),
        ("The Magician", "1", "Trump", ["manifestation", "resourcefulness", "power", "inspired action"],
         ["Manifesting desires", "Utilizing all available tools", "Conscious awareness", "Creative willpower"],
         ["Trickery", "Wasted talent", "Illusion", "Manipulation"],
         ["You have all the resources you need to succeed", "Focus your will to create your reality"], "Mercury", "The Alchemist"),
        ("The High Priestess", "2", "Trump", ["intuition", "sacred knowledge", "divine feminine", "subconscious"],
         ["Trusting intuition", "Unveiling mysteries", "Inner silence", "Spiritual insight"],
         ["Secrets", "Disconnected from intuition", "Surface illusions", "Hidden agendas"],
         ["Look beneath the surface; your inner voice holds the truth", "Answers lie in stillness"], "Moon", "The Oracle"),
        ("The Empress", "3", "Trump", ["abundance", "fertility", "nurturing", "creativity"],
         ["Creative fruitfulness", "Nurturing relationships", "Sensory joy", "Harmony and prosperity"],
         ["Creative block", "Smothering", "Overdependence", "Neglecting self-care"],
         ["Growth and bountiful returns are blossoming in your life", "Nurture what you wish to see thrive"], "Venus", "The Great Mother"),
        ("The Emperor", "4", "Trump", ["authority", "structure", "control", "fatherhood"],
         ["Solid foundation", "Leadership and discipline", "Organized structure", "Protective guidance"],
         ["Tyranny", "Rigidity", "Lack of discipline", "Abuse of authority"],
         ["Bring discipline and order to your current endeavor", "Stand strong in your authority"], "Aries", "The Sovereign"),
        ("The Hierophant", "5", "Trump", ["tradition", "conformity", "morality", "institutions"],
         ["Spiritual wisdom", "Mentorship", "Honoring proven traditions", "Ethical discernment"],
         ["Rebellion", "Dogmatism", "Challenging traditions", "Hypocrisy"],
         ["Seek guidance from trusted mentors or timeless principles", "Align with your deepest ethics"], "Taurus", "The Spiritual Teacher"),
        ("The Lovers", "6", "Trump", ["love", "harmony", "relationships", "values alignment"],
         ["Soul connections", "Deep partnership", "Harmonious union", "Choices aligned with true values"],
         ["Disharmony", "Misalignment of values", "Indecision", "Conflict in relationships"],
         ["A vital relationship or decision calls for authentic alignment", "Choose from the heart"], "Gemini", "The Sacred Union"),
        ("The Chariot", "7", "Trump", ["determination", "willpower", "victory", "assertion"],
         ["Overcoming obstacles", "Focused determination", "Victorious momentum", "Mastery of opposing forces"],
         ["Lack of direction", "Aggression", "Loss of control", "Forcefulness"],
         ["Triumph is yours if you maintain unwavering focus and self-discipline", "Stay determined"], "Cancer", "The Victor"),
        ("Strength", "8", "Trump", ["courage", "persuasion", "compassion", "inner strength"],
         ["Gentle power", "Taming inner beasts", "Endurance and patience", "Compassionate resilience"],
         ["Self-doubt", "Weakness", "Raw emotion", "Impatience"],
         ["Patience and inner fortitude will overcome raw force", "Lead with gentle courage"], "Leo", "The Gentle Tamer"),
        ("The Hermit", "9", "Trump", ["soul searching", "introspection", "solitude", "inner guidance"],
         ["Seeking inner truth", "Spiritual retreat", "Inner illumination", "Wisdom found in silence"],
         ["Loneliness", "Isolation", "Lost in the dark", "Refusing wise counsel"],
         ["Step back from external noise to discover your inner light", "Solitude will bring clarity"], "Virgo", "The Sage"),
        ("Wheel of Fortune", "10", "Trump", ["cycles", "good luck", "karma", "destiny"],
         ["Positive turning point", "Karmic rewards", "Fortuitous cycles", "Destined encounters"],
         ["Bad luck", "Resisting inevitable change", "Negative cycles", "Helplessness"],
         ["A shift of destiny is occurring in your favor", "Embrace the cycles of life with grace"], "Jupiter", "The Wheel of Destiny"),
        ("Justice", "11", "Trump", ["fairness", "truth", "cause and effect", "law"],
         ["Truth revealed", "Fair resolution", "Accountability", "Honest discernment"],
         ["Dishonesty", "Unfair treatment", "Lack of accountability", "Prejudice"],
         ["Integrity and truth will restore balance to your situation", "Act with honor and clarity"], "Libra", "The Great Arbiter"),
        ("The Hanged Man", "12", "Trump", ["surrender", "new perspective", "letting go", "pause"],
         ["Surrendering ego", "Gaining fresh viewpoints", "Sacred pause", "Enlightening sacrifice"],
         ["Stalling", "Pointless sacrifice", "Martyrdom", "Resistance to surrender"],
         ["Pause and look at this from an entirely inverted perspective", "Letting go allows breakthrough"], "Water", "The Transcendent"),
        ("Death", "13", "Trump", ["transformation", "endings", "transition", "renewal"],
         ["Closing obsolete chapters", "Profound rebirth", "Metamorphosis", "Making space for the new"],
         ["Fear of change", "Holding on to the past", "Stagnation", "Decay"],
         ["An old phase concludes to make room for an empowering resurrection", "Embrace rebirth"], "Scorpio", "The Transformer"),
        ("Temperance", "14", "Trump", ["balance", "moderation", "patience", "synthesis"],
         ["Harmonizing opposites", "Alchemical fusion", "Peaceful moderation", "Emotional equilibrium"],
         ["Imbalance", "Excess", "Discord", "Extremes"],
         ["Find the golden middle way through patience and blending diverse viewpoints", "Remain calm"], "Sagittarius", "The Alchemist of Soul"),
        ("The Devil", "15", "Trump", ["shadow self", "attachment", "addiction", "illusion of restriction"],
         ["Confronting shadow", "Breaking invisible chains", "Recognizing unhealthy patterns", "Reclaiming autonomy"],
         ["Trap of materialism", "Obsession", "Powerlessness", "Toxic codependency"],
         ["You possess the power to break free from any self-imposed limitations", "Acknowledge the shadow"], "Capricorn", "The Shadow Binder"),
        ("The Tower", "16", "Trump", ["sudden upheaval", "breakthrough", "revelation", "awakening"],
         ["Shattering false illusions", "Sudden breakthrough", "Clearing rigid structures", "Liberating awakening"],
         ["Avoiding inevitable change", "Fear of collapse", "Prolonged disaster", "Denial"],
         ["A sudden truth sweeps away illusions to build upon genuine bedrock", "Liberation follows shock"], "Mars", "The Lightning Bolt"),
        ("The Star", "17", "Trump", ["hope", "faith", "purpose", "renewal", "serenity"],
         ["Renewed inspiration", "Spiritual healing", "Guiding beacon", "Wishes aligned with universe"],
         ["Hopelessness", "Disillusionment", "Despair", "Loss of faith"],
         ["Hope and radiant blessings shine upon your path", "Trust your guiding star"], "Aquarius", "The Beacon of Hope"),
        ("The Moon", "18", "Trump", ["subconscious", "illusions", "intuition", "dreams"],
         ["Navigating deep emotions", "Deciphering dreams", "Heightened psychic sensitivity", "Facing the unknown"],
         ["Confusion", "Deception", "Anxiety", "Paranoia"],
         ["Trust your instincts through uncertain or shadowy terrain", "Look past surface illusions"], "Pisces", "The Dream Weaver"),
        ("The Sun", "19", "Trump", ["joy", "success", "vitality", "celebration", "clarity"],
         ["Radiant vitality", "Unabashed happiness", "Clarity and optimism", "Abundant victory"],
         ["Temporary cloudiness", "Overconfidence", "Delayed gratification", "Unexpressed joy"],
         ["Brilliant light, vitality, and success illuminate your journey", "Celebrate your triumphs"], "Sun", "The Radiant Light"),
        ("Judgement", "20", "Trump", ["reckoning", "calling", "awakening", "absolution"],
         ["Heeding your true calling", "Higher awakening", "Liberating self-forgiveness", "Karmic clarity"],
         ["Self-criticism", "Ignoring the call", "Regret", "Doubt"],
         ["Rise up and claim your true purpose with a clear conscience", "Answer the spiritual trumpet"], "Pluto", "The Great Awakening"),
        ("The World", "21", "Trump", ["completion", "wholeness", "accomplishment", "travel"],
         ["Triumphant completion", "Mastery and wholeness", "Global connections", "Cosmic integration"],
         ["Incomplete goals", "Shortcuts", "Lack of closure", "Stagnant finish"],
         ["A major life cycle culminates in triumph, wholeness, and celebration", "You have arrived"], "Saturn", "The Cosmic Whole")
    ]

    cards = []
    for name, num, suit, kw, light, shadow, ft, elem, arch in major_arcana:
        cards.append({
            "name": name,
            "number": num,
            "arcana": "Major Arcana",
            "suit": suit,
            "img": f"m{int(num):02d}.jpg",
            "keywords": kw,
            "meanings": {"light": light, "shadow": shadow},
            "fortune_telling": ft,
            "elemental": elem,
            "archetype": arch,
            "questions_to_ask": [f"How does {name} invite me to grow today?", "What wisdom is calling for my attention?"]
        })

    # Minor Arcana Suits
    suits = [
        ("Wands", "Fire", "Creativity, Passion, Ambition, Willpower"),
        ("Cups", "Water", "Emotions, Intuition, Relationships, Soul"),
        ("Swords", "Air", "Intellect, Truth, Mental Clarity, Challenges"),
        ("Pentacles", "Earth", "Wealth, Work, Health, Physical Reality")
    ]

    ranks = [
        ("Ace", "1", ["new spark", "potential", "breakthrough"], ["Burst of fresh energy", "Raw potential realized"], ["Missed opportunity", "Blocked force"]),
        ("Two", "2", ["balance", "decision", "planning"], ["Weighing choices", "Harmony in progress"], ["Indecision", "Conflict in path"]),
        ("Three", "3", ["growth", "collaboration", "expansion"], ["Reaching milestones", "Collective effort"], ["Delays in progress", "Miscommunication"]),
        ("Four", "4", ["stability", "celebration", "foundation"], ["Secure base", "Contentment and rest"], ["Restlessness", "Rigid stagnation"]),
        ("Five", "5", ["conflict", "challenge", "competition"], ["Navigating discord", "Testing of resilience"], ["Avoidance of struggle", "Lingering strife"]),
        ("Six", "6", ["victory", "harmony", "nostalgia", "success"], ["Sweet memories", "Earned triumph", "Giving and receiving"], ["Ego arrogance", "Living in past"]),
        ("Seven", "7", ["assessment", "perseverance", "strategy"], ["Evaluating results", "Strategic patience"], ["Impatience", "Deception in strategy"]),
        ("Eight", "8", ["speed", "dedication", "movement"], ["Rapid progress", "Honing craftsmanship"], ["Hasty errors", "Overworking in vain"]),
        ("Nine", "9", ["resilience", "fulfillment", "nearing goal"], ["Boundary defense", "Satisfaction of desires"], ["Burnout", "Paranoia near the end"]),
        ("Ten", "10", ["culmination", "abundance", "completion", "burden"], ["Legacy fulfilled", "Overcoming heavy burden", "Abundant family"], ["Exhaustion", "Overburdened"]),
        ("Page", "11", ["curiosity", "enthusiasm", "messages", "learning"], ["Eager student", "Exciting news arriving", "Fresh creative urge"], ["Immaturity", "Unreliable messenger"]),
        ("Knight", "12", ["action", "pursuit", "intensity", "movement"], ["Charging toward goals", "Dedicated quest", "Passionate crusade"], ["Impulsiveness", "Reckless charge"]),
        ("Queen", "13", ["mastery", "nourishment", "grace", "depth"], ["Emotional/creative maturity", "Graceful leadership", "Inspiring authority"], ["Jealousy", "Overbearing control"]),
        ("King", "14", ["command", "wisdom", "stability", "vision"], ["Wise governance", "Pinnacle of mastery", "Enduring legacy"], ["Tyranny", "Stubborn misuse of power"])
    ]

    for suit_name, element, suit_desc in suits:
        suit_code = suit_name[0].lower()
        for rank_name, rank_num, kw, light, shadow in ranks:
            full_name = f"{rank_name} of {suit_name}"
            card_id = f"{suit_code}{int(rank_num):02d}"
            cards.append({
                "name": full_name,
                "number": rank_num,
                "arcana": "Minor Arcana",
                "suit": suit_name,
                "img": f"{card_id}.jpg",
                "keywords": kw + [suit_name.lower(), element.lower()],
                "meanings": {
                    "light": light + [f"Channeling the pure {element} essence of {suit_name} in {rank_name} form"],
                    "shadow": shadow + [f"Blocked or distorted expression of {suit_name}"]
                },
                "fortune_telling": [
                    f"A development in {suit_desc.lower()} is developing rapidly.",
                    f"Trust your ability to handle {rank_name.lower()} energy in this circumstance."
                ],
                "elemental": element,
                "archetype": f"The {rank_name} of {suit_name}",
                "questions_to_ask": [
                    f"How can I channel the {element} power of {suit_name} today?",
                    f"Where is {rank_name} energy most needed in my life?"
                ]
            })

    return cards

# Ensure cards data JSON is saved
os.makedirs(os.path.dirname(CARDS_DATA_PATH), exist_ok=True)
if not os.path.exists(CARDS_DATA_PATH) or os.path.getsize(CARDS_DATA_PATH) < 100:
    deck_cards = build_default_deck()
    with open(CARDS_DATA_PATH, "w", encoding="utf-8") as f:
        json.dump({"cards": deck_cards}, f, indent=2)

def load_deck():
    if os.path.exists(CARDS_DATA_PATH):
        try:
            with open(CARDS_DATA_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, dict) and "cards" in data:
                return data["cards"]
            elif isinstance(data, list):
                return data
        except Exception:
            pass
    return build_default_deck()

def draw_cards(deck: list, count: int = 3, seed: int = None):
    rng = random.Random(seed)
    selected = rng.sample(deck, min(count, len(deck)))
    drawn = []
    positions = ["Past / Roots", "Present / Current Energies", "Future / Path Forward", "Underlying Influence", "Outcome & Guidance"]
    
    for idx, card in enumerate(selected):
        is_upright = rng.choice([True, False])
        pos_label = positions[idx] if idx < len(positions) else f"Position {idx + 1}"
        drawn.append({
            "card": card,
            "upright": is_upright,
            "orientation": "Upright" if is_upright else "Reversed",
            "position": pos_label
        })
    return drawn

def format_card_reading(drawn_cards: list):
    sections = []
    for item in drawn_cards:
        card = item["card"]
        upright = item["upright"]
        pos = item["position"]
        side = "light" if upright else "shadow"
        meanings = card.get("meanings", {}).get(side, ["Wisdom and guidance unfold"])
        meaning_str = "; ".join(meanings)
        kw_str = ", ".join(card.get("keywords", []))
        
        sections.append(
            f"🔮 {pos}: {card['name']} ({item['orientation']})\n"
            f"   • Keywords: {kw_str}\n"
            f"   • Interpretation: {meaning_str}\n"
        )
    return "\n".join(sections)
