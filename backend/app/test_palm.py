from palm_pipeline import analyze_palm

result = analyze_palm("test_input/test_hand.jpg", "test_input/results")

print("Success:", result["success"])
print("Error:", result.get("error"))

if result["success"]:
    for name, data in result["lines"].items():
        print(f"{name} -> {data['relative_length']} ({data['length_px']} px)")
    print("Annotated image saved at:", result["result_image_path"])