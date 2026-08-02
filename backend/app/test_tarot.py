from tarot_pipeline import draw_spread

spread = draw_spread("three_card")

for card in spread:
    orientation = "reversed" if card["reversed"] else "upright"
    print(f"{card['position']}: {card['name']} ({orientation})")
    print("  Keywords:", ", ".join(card["keywords"]))
    print()