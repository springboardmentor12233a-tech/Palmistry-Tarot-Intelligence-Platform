from llm_interpretation import generate_palm_llm_reading

sample_lines = {
    "heart": {"relative_length": "long", "length_px": 47},
    "head": {"relative_length": "short", "length_px": 43},
    "life": {"relative_length": "short", "length_px": 62},
}

reading = generate_palm_llm_reading(sample_lines)
print(reading)