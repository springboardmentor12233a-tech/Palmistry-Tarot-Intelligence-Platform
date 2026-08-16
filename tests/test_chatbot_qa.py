from palmtarot.llm.client import LLMInterpreter


def test_chat_left_vs_right_hand():
    interpreter = LLMInterpreter()
    messages = [{"role": "user", "content": "Which hand should I read, left or right?"}]
    res = interpreter.chat_completion(messages)

    assert "reply" in res
    reply = res["reply"]
    assert "Left Hand" in reply or "Dominant" in reply
    assert "Active" in reply or "Passive" in reply or "potential" in reply.lower()


def test_chat_life_line_myth():
    interpreter = LLMInterpreter()
    messages = [{"role": "user", "content": "Does a short life line mean I will die young?"}]
    res = interpreter.chat_completion(messages)

    assert "reply" in res
    reply = res["reply"]
    assert "Life Line" in reply
    assert "vitality" in reply.lower() or "NOT" in reply or "lifespan" in reply.lower()


def test_chat_head_line_explanation():
    interpreter = LLMInterpreter()
    messages = [{"role": "user", "content": "What does the head line tell about my thinking style?"}]
    res = interpreter.chat_completion(messages)

    assert "reply" in res
    reply = res["reply"]
    assert "Head Line" in reply
    assert "intellect" in reply.lower() or "analytical" in reply.lower() or "focus" in reply.lower()


def test_chat_heart_line_explanation():
    interpreter = LLMInterpreter()
    messages = [{"role": "user", "content": "Can you explain what the heart line means for relationships?"}]
    res = interpreter.chat_completion(messages)

    assert "reply" in res
    reply = res["reply"]
    assert "Heart Line" in reply
    assert "emotion" in reply.lower() or "relationship" in reply.lower()


def test_chat_major_arcana_card():
    interpreter = LLMInterpreter()
    messages = [{"role": "user", "content": "Tell me about The Sun tarot card"}]
    res = interpreter.chat_completion(messages)

    assert "reply" in res
    reply = res["reply"]
    assert "Sun" in reply
    assert "Arcana" in reply or "Archetype" in reply


def test_chat_hand_shapes():
    interpreter = LLMInterpreter()
    messages = [{"role": "user", "content": "What is an Air hand shape?"}]
    res = interpreter.chat_completion(messages)

    assert "reply" in res
    reply = res["reply"]
    assert "Air" in reply or "Hand Shapes" in reply
    assert "Square" in reply or "Fingers" in reply or "intellectual" in reply.lower()


def test_chat_general_question_dynamic_synthesizer():
    interpreter = LLMInterpreter()
    messages = [{"role": "user", "content": "How do I choose the right career path using my hand?"}]
    res = interpreter.chat_completion(messages)

    assert "reply" in res
    reply = res["reply"]
    # Verify it gives direct guidance rather than generic boilerplate
    assert len(reply) > 100
    assert "Career" in reply or "vocation" in reply.lower() or "Fate" in reply or "Head Line" in reply or "Guidance" in reply
