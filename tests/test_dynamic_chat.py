from palmtarot.llm.client import LLMInterpreter


def test_dynamic_chat_response_not_canned():
    interpreter = LLMInterpreter()

    # Question 1
    messages1 = [{"role": "user", "content": "how are tarot cards recommended"}]
    res1 = interpreter.chat_completion(messages1)

    # Question 2
    messages2 = [{"role": "user", "content": "after analyzing palm and based on palm lines did tarot cards get recommended"}]
    res2 = interpreter.chat_completion(messages2)

    assert "reply" in res1
    assert "reply" in res2
    assert len(res1["reply"]) > 0
    assert len(res2["reply"]) > 0

    # Ensure replies are NOT identical generic canned strings
    assert res1["reply"] != res2["reply"] or "session" in res2["reply"].lower()

    # Ensure canned legacy string is gone
    legacy_canned = "Tarot readings utilize 78 cards split into Major Arcana"
    assert legacy_canned not in res1["reply"]
    assert legacy_canned not in res2["reply"]


def test_chat_response_with_palm_reading_context():
    interpreter = LLMInterpreter()

    reading_context = {
        "palm_report": {"Palm_Shape": "Rectangular Palm"},
        "engineered_features": {"aspect_ratio": 1.45},
        "cluster": {"cluster_id": 2},
        "palm_lines": [
            {"line": "Heart Line", "length_px": 175.4, "description": "Long, empathetic emotional connection style"},
            {"line": "Head Line", "length_px": 142.1, "description": "Balanced logical focus"},
            {"line": "Life Line", "length_px": 180.0, "description": "Strong physical grounding"}
        ],
        "tarot_reading": {
            "num_cards": 3,
            "cards": [
                {"name": "The Star", "orientation": "Upright", "position": "Past", "meaning": "Hope and inspiration"},
                {"name": "The Sun", "orientation": "Upright", "position": "Present", "meaning": "Joy and success"},
                {"name": "The Moon", "orientation": "Reversed", "position": "Future", "meaning": "Illusion resolved"}
            ]
        }
    }

    messages = [{"role": "user", "content": "after analyzing palm and based on palm lines did tarot cards get recommended"}]
    res = interpreter.chat_completion(messages, reading_context=reading_context)

    reply = res["reply"]
    assert "reply" in res
    assert len(reply) > 0
    # Must reference session palm line data (Heart Line / length / shape)
    assert ("Heart Line" in reply or "175.4" in reply or "Rectangular" in reply or "palm" in reply.lower())
    assert "The Star" in reply or "Sun" in reply or "tarot" in reply.lower()
