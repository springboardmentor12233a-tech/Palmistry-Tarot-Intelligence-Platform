from fastapi.testclient import TestClient

from app.main import app
from palmtarot.llm.client import LLMInterpreter

client = TestClient(app)


def test_llm_interpreter_chat_completion_fallback():
    interpreter = LLMInterpreter()
    messages = [{"role": "user", "content": "Tell me about the Heart Line measurement."}]

    res = interpreter.chat_completion(messages)
    assert "reply" in res
    assert len(res["reply"]) > 0
    assert "Heart Line" in res["reply"] or "emotional" in res["reply"]
    assert "suggested_followups" in res


def test_post_chat_api_endpoint():
    payload = {
        "message": "What is the difference between Upright and Reversed Tarot cards?",
        "history": [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi! How can I help you?"}
        ]
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 0
    assert "suggested_followups" in data
    assert isinstance(data["suggested_followups"], list)
