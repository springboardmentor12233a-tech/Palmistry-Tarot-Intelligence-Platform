from tarot_pipeline import draw_spread
from llm_interpretation import generate_tarot_llm_reading

spread = draw_spread("three_card")

for card in spread:
    orientation = "reversed" if card["reversed"] else "upright"
    print(f"{card['position']}: {card['name']} ({orientation})")

print()
reading = generate_tarot_llm_reading(spread)
print(reading)