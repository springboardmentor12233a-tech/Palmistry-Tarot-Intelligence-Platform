import os
from dotenv import load_dotenv
from google import genai

# ==========================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================

load_dotenv()

ASSISTANT_API_KEY = os.getenv(
    "GEMINI_ASSISTANT_API_KEY"
)

# ==========================================
# GEMINI CLIENT
# ==========================================

client = genai.Client(
    api_key=ASSISTANT_API_KEY
)


# ==========================================
# AI READING ASSISTANT
# ==========================================

def ask_reading_assistant(
    question,
    reading_context
):
    """
    Answer a user's question using their
    saved Palmistry, Tarot or Combined reading.
    """

    prompt = f"""
You are an AI Reading Assistant for a
Palmistry and Tarot Intelligence Platform.

The user is asking a question about their
personal reading.

USER QUESTION:
{question}

USER READING CONTEXT:
{reading_context}

IMPORTANT RULES:

1. Answer using ONLY the supplied reading context
   when discussing the user's personal reading.

2. Do not invent Tarot cards.

3. Do not invent Palmistry findings.

4. Do not claim that Palmistry or Tarot can
   scientifically predict the future.

5. Treat Palmistry and Tarot as reflective
   practices rather than scientific predictions.

6. Do not make guaranteed predictions.

7. If the user asks about something that does
   not appear in their reading context, clearly
   say that the information is not available
   in the saved reading.

8. Explain technical or traditional terminology
   in simple language when useful.

9. If the user asks for clarification about a
   card or palm line, explain it using the
   information supplied in the reading context.

10. Do not mention the database, JSON files,
    Python code, API, or internal implementation.

11. Be friendly, concise and helpful.

12. Never provide medical, legal or financial
    advice based on Palmistry or Tarot.

Answer the user's question directly.
"""

    try:

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        return response.text

    except Exception as e:

        error_message = str(e)

        if (
            "429" in error_message
            or "RESOURCE_EXHAUSTED" in error_message
        ):

            return (
                "⚠️ The AI Assistant has temporarily "
                "reached its API quota. Please try "
                "again later."
            )

        return (
            "❌ Unable to generate an AI response.\n\n"
            f"Error: {error_message}"
        )