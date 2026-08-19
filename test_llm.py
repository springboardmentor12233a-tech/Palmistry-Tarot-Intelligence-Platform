from llm_engine import client

response = client.models.generate_content(
    model="gemini-3.6-flash",
    contents="Say hello and confirm that the Gemini API is working."
)

print(response.text)