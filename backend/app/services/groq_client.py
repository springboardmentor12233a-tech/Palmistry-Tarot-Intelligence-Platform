import os
from pathlib import Path
from dotenv import load_dotenv

# Find backend/.env
BACKEND_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_ROOT / ".env")

try:
    from groq import Groq
except ImportError:
    Groq = None


def ask_groq(prompt: str, system_prompt: str, max_tokens: int = 1000) -> str:

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        return "Groq API key was not found."

    if Groq is None:
        return "Groq package is not installed."

    client = Groq(api_key=api_key)

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=max_tokens,
    )

    return response.choices[0].message.content